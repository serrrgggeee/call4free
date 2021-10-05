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
  closeRoom: async(data, rooms, socket) => {
    console.log(data);
    await queryParams(
        "UPDATE comunicate_room SET active =false WHERE id=$1 RETURNING *;", 
        [data.id],
        client,
        (err, res) => {
          console.log(err);
          let updated = true;
          if (err) {
            updated = false;
          }

          if (updated) {
            console.log(201, { success: updated });
            socket.broadcast.emit('set_rooms', rooms);
          }
          else {
            console.log(200, { success: updated });
          }
        });
  },
  getRooms: async() => {
    return await client.query(
      `select *, room.id as id, subj.name as subject, lang.name as language from comunicate_room as room
      JOIN comunicate_language as lang ON lang.id = room.language_id
      JOIN comunicate_subject as subj ON subj.id = room.subject_id
      where room.active=true;`
      );
  }, 
  getRoom: async(room) => {
    return await client.query("select * from comunicate_room where name=$1", [room]);
  }, 
  getLanguage: async(language) => {
    return await client.query("select * from comunicate_language where name=$1", [language]);
  },   
  getSubject: async(subject) => {
    return await client.query("select * from comunicate_subject where name=$1", [subject]);
  }, 
  getMessges: async(room) => {
    let room_id = await self.getRoom(room);
    return await client.query("select * from comunicate_chat where room_id=$1", [room_id.rows[0].id]);
  }, 
  createRoom: async(room, data, userInfo) => {
    let language = await self.getLanguage(data.language);
    let subject = await self.getSubject(data.subject);
    let date = new Date().toLocaleString();
    let user_info = JSON.stringify(userInfo);
    queryParams(
      "INSERT INTO comunicate_room (name, created, updated, date_time, user_id, language_id, subject_id, user_info, active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);", 
      [room, date, date, date, data.ID, language.rows[0].id, subject.rows[0].id, user_info, true],
      client,
      (err, res) => {
        console.log(err);
        let created = true;
        if (err) {
          created = false;
        }

        if (created) {
          console.log(201, { success: created });
        }
        else {
          console.log(200, { success: created });
        }
      });
    return [];
  }, 

  creatMessage: async(room, data, io) => {
    let room_id = await self.getRoom(room);
    let subject = await self.getSubject(data.subject);
    let date = new Date().toLocaleString();
    let user_info = JSON.stringify(data.userInfo);
    if(data.editId) {
      await queryParams(
        "UPDATE comunicate_chat SET message=$2 WHERE id = $1 RETURNING *;", 
        [data.editId, data.message],
        client,
        (err, res) => {
          console.log(err);
          let created = true;
          if (err) {
            created = false;
          }

          if (created) {
            console.log(201, { success: created });
            io.to(room).emit('responseChat', res.rows[0], data.editId);
          }
          else {
            console.log(200, { success: created });
          }
        });
        return true;
      }
    await queryParams(
      "INSERT INTO comunicate_chat (message, created, updated, user_info, room_id, active, shared, shared_room_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;", 
      [data.message, date, date, user_info, room_id.rows[0].id, true, false, null],
      client,
      (err, res) => {
        console.log(err);
        let created = true;
        if (err) {
          created = false;
        }

        if (created) {
          console.log(201, { success: created });
          io.to(room).emit('responseChat', res.rows[0]);
        }
        else {
          console.log(200, { success: created });
        }
      });
  },

  getOrCreateRoom: async(room, data, userInfo) => {
    let res = await self.getRoom(room);
    if(res.rows.length > 0) {
      return res
    } else {
      res = self.createRoom(room, data, userInfo);
    }
  }
};
