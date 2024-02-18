const { getClient, query, client } = require("../db");

const { fetch } = require("../helpers/fetch");

const axios = require('axios');

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
    await query(client, "UPDATE comunicate_room SET active =false WHERE id=$1 RETURNING *;", [data.id]);
  },

  getRooms: async() => {
    return await query(
      client,
      `select 
      array_remove(array_agg(CASE WHEN memb.user_info is not null THEN (memb.id, memb.user_info) ELSE NULL END), NULL) member,
      json_agg(json_build_object('id', memb.id, 'user_info', memb.user_info)) members1,
      case when memb.user_info is null then '[]' else json_agg(json_build_object('id', memb.id, 'user_info', memb.user_info)) end as members,
      room.id, room.name as name, subj.name as subject, lang.name as language, room.created
      from comunicate_room as room
      LEFT JOIN comunicate_language as lang ON lang.id = room.language_id
      LEFT JOIN comunicate_subject as subj ON subj.id = room.subject_id
      LEFT JOIN comunicate_member as memb ON memb.room_id = room.id and memb.active = true
      where room.active group by room.id, subj.name, lang.name, memb.user_info;`,
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
    return await query(
      client,
      "WITH insertRooms AS \
      (INSERT INTO comunicate_room (name, created, updated, date_time, user_id, language_id, subject_id, user_info, active) \
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)\
      RETURNING *) \
      select *, room.id as id, room.name as name, subj.name as subject, lang.name as language \
      from insertRooms as room \
      JOIN comunicate_language as lang ON lang.id = room.language_id \
      JOIN comunicate_subject as subj ON subj.id = room.subject_id \
      where room.active=true;",
      [room, date, date, date, data.ID, data.language, data.subject, user_info, true]);
  }, 

  creatMessage: async(room, data, io) => {
    let date = new Date().toLocaleString();
    let user_info = JSON.stringify(data.userInfo);
    if(data.editId) {
      await query(
          client,
          "UPDATE comunicate_chat SET message=$2 WHERE id = $1 RETURNING *;", 
          [data.editId, data.message]
        )
        .then(res=> {
           io.to(room.name).emit('responseChat', res.rows[0], data.editId);
        })
        .catch(err => console.log(200, { success: false }));
        return true;
      }
    await query(
      client,
      "INSERT INTO comunicate_chat (message, created, updated, user_info, room_id, active, shared, shared_room_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;", 
      [data.message, date, date, user_info, room.id, true, false, null])
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

  clearRooms: async(room, userInfo) => {
    return await query(
      client,
      "UPDATE comunicate_member SET active =false WHERE active =true;");
  },

  getOrCreateMember: async(room, userInfo) => {
    const url = `${process.env.DOMAIN}/comunicate/member/`;
    const user_info = JSON.stringify(userInfo);
    const data = {login: userInfo['email'], auth_site: userInfo['auth_site'], room: room, user_info, active: true}
    // headers: {"Authorization": "Token " + token},
    return axios.post(url, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log(error);
    });


  },

  hideMember: async(room, userInfo) => {
    const url = `${process.env.DOMAIN}/comunicate/member/hide`;
    const user_info = JSON.stringify(userInfo);
    const data = {login: userInfo['email'], auth_site: userInfo['auth_site'], room: room, user_info, active: false}
    // headers: {"Authorization": "Token " + token},
    return axios.put(url, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log(error);
    });


  },

  // hideMember: async(id) => {
  //   await query(client, "UPDATE comunicate_member SET active =false WHERE id=$1 RETURNING *;", [id]);
  // },
  
};

