const { getClient, query, queryParams, client } = require("../db");

 // comunicate_chat
 // comunicate_language
 // comunicate_subject
 // comunicate_room

/**
 * Create new user.
 * @function
 * @param {function} room - room uri.
 * @param {function} data - room`s data.
 */

var self = module.exports = {
  closeRoom: async(data) => {
    await queryParams("UPDATE comunicate_room SET active =false WHERE id=$1 RETURNING *;", [data.id], client);
  },

  getRooms: async() => {
    return await client.query(
      `select 
      array_remove(array_agg(CASE WHEN memb.user_info is not null THEN (memb.id, memb.user_info) ELSE NULL END), NULL) member,
      json_agg(json_build_object('id', memb.id, 'user_info', memb.user_info)) members1,
      case when memb.user_info is null then '[]' else json_agg(json_build_object('id', memb.id, 'user_info', memb.user_info)) end as members,
      room.id, room.name as name, subj.name as subject, lang.name as language, room.created
      from comunicate_room as room
      LEFT JOIN comunicate_language as lang ON lang.id = room.language_id
      LEFT JOIN comunicate_subject as subj ON subj.id = room.subject_id
      LEFT JOIN comunicate_member as memb ON memb.room_id = room.id and memb.active = true
      where room.active group by room.id, subj.name, lang.name, memb.user_info;`
    );
  }, 

  getRoom: async(room) => {
    return await client.query("select * from comunicate_room where name=$1", [room.name]);
  }, 

  getMessges: async(room_id) => {
    return await client.query("select * from comunicate_chat where room_id=$1", [room_id]);
  }, 

  createRoom: async(room, data, userInfo) => {
    let date = new Date().toLocaleString();
    let user_info = JSON.stringify(userInfo);
    return await queryParams(
      "WITH insertRooms AS \
      (INSERT INTO comunicate_room (name, created, updated, date_time, user_id, language_id, subject_id, user_info, active) \
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)\
      RETURNING *) \
      select *, room.id as id, room.name as name, subj.name as subject, lang.name as language \
      from insertRooms as room \
      JOIN comunicate_language as lang ON lang.id = room.language_id \
      JOIN comunicate_subject as subj ON subj.id = room.subject_id \
      where room.active=true;",
      [room, date, date, date, data.ID, data.language, data.subject, user_info, true],
      client);
  }, 

  creatMessage: async(room, data, io) => {
    let date = new Date().toLocaleString();
    let user_info = JSON.stringify(data.userInfo);
    if(data.editId) {
      await queryParams(
        "UPDATE comunicate_chat SET message=$2 WHERE id = $1 RETURNING *;", 
        [data.editId, data.message],
        client)
        .then(res=> {
           io.to(room.name).emit('responseChat', res.rows[0], data.editId);
        })
        .catch(err => console.log(200, { success: false }));
        return true;
      }
    await queryParams(
      "INSERT INTO comunicate_chat (message, created, updated, user_info, room_id, active, shared, shared_room_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;", 
      [data.message, date, date, user_info, room.id, true, false, null],
      client)
      .then(res=> {
        console.log(201, { success: true });
          io.to(room.name).emit('responseChat', res.rows[0]);
      })
      .catch(err => console.log(200, { success: false }));;
  },

  getOrCreateRoom: async(room, data, userInfo) => {
    let res = await self.getRoom(room);
    if(res.rows.length > 0) {
      return res
    } else {
      return self.createRoom(room, data, userInfo);

    }
  }, 

  getMember: async(room, userInfo) => {
    return client.query("select * from comunicate_member where login=$1 and room_id=$2", [userInfo['email'], room.id]);
  },

  updatetMember: async(room, userInfo) => {
    return queryParams("UPDATE comunicate_member SET active =true, user_info =$4 WHERE login=$1 and room_id=$2 and auth_site=$3 RETURNING *;", [userInfo['email'], room.id, userInfo['auth_site'], userInfo], client);
  },

  createMember: async(room, userInfo) => {
    let date = new Date().toLocaleString();
    return await queryParams(
      "INSERT INTO comunicate_member (room_id, login, auth_site, created, updated, user_info, active) \
      VALUES ($1, $2, $3, $4, $5, $6, $7)\
      RETURNING *;",
      [room.id, userInfo['email'], userInfo['auth_site'], date, date, userInfo, true],
      client);
  },

  clearRooms: async(room, userInfo) => {
    return await queryParams(
      "UPDATE comunicate_member SET active =false WHERE active =true;",
      [],
      client);
  },

  getOrCreateMember: async(room, userInfo) => {
    let res = await self.updatetMember(room, userInfo);
    if(res.rows.length > 0) {
      return { res: res.rows, created: false };
    } else {
      return { res: await self.createMember(room, userInfo), created: true };
    }
  },

  hideMember: async(id) => {
    await queryParams("UPDATE comunicate_member SET active =false WHERE id=$1 RETURNING *;", [id], client);
  },
  
};
