/** @type {SocketIO.Server} */
const fs = require('fs');
const { getOrCreateRoom, creatMessage, getMessges, getRooms, closeRoom } = require("./room_api");
const { getKeyByValue } = require("./helpers");
let _io;
const MAX_CLIENTS = 3;
let chat_opend = false;
let store_rooms = {};
let rooms = [];
getRooms().then((res)=> {
  rooms = res.rows;
});

/** @param {SocketIO.Socket} socket */
async function listen(socket) {
  const io = _io;
  socket.on('get_rooms', function() {
    socket.emit('set_rooms', rooms);
  });

  socket.on('chat_opend', value => {
    chat_opend = value;
  });

  socket.on('senAdminChat', async function(payload) {
    rooms[payload.room].chat.push(payload)
    creatMessage(payload.room, payload, io);
 });

  socket.on('create_room', (room, data, userInfo) => {
    room = "room/" + room;
    data.ID = userInfo.ID;
    rooms.push(data);
    socket.broadcast.emit('set_rooms', rooms);
    getOrCreateRoom(room, data, userInfo);
  });

  socket.on('close_room', (r) => {
    console.log(rooms);
    console.log(r);
    const [room, index] = getKeyByValue(rooms, 'name', r);
    if(!room["members"] || (room["members"] && room["members"].length < 1)) {
      rooms.splice(index, 1);
      closeRoom(room, rooms, socket);
    }
  });

  socket.on('swithOnRemoteVideo', (room) => {
      socket.broadcast.to(room).emit('swithOnRemoteVideo');
  })
  socket.on('send', (id, message) => {   
      socket.to(id).emit('send', message);
  });  

  socket.broadcast.emit('connecting', 'rooms');
  socket.on('sendChat', async function(payload) {
   
  });

  socket.on('join', function(room) {
    if(rooms[room] !== undefined) {
      rooms[room]['privet'] = false;
      if(store_rooms[room]) {
        rooms[room] = store_rooms[room]
      } else {
        rooms[room] = {};
        rooms[room].chat = [];
        // rooms[room]['privet'] = true;
      }
    };
    let numClients = 0;
    let member_exist = false;

    if (numClients < MAX_CLIENTS) {
      socket.on('ready', function(userInfo, tracks_callback, remot_track_added) {
        try{
          if(rooms[room]["members"]) {
            member_exist = rooms[room]["members"].find(member => {
              return member.ID == userInfo.ID;
            });
          } else {
            rooms[room]["members"] = [];
          }
          if(true || !member_exist) {
            rooms[room]["members"].push(userInfo);
            socket.broadcast.emit('set_rooms', rooms);
            socket.broadcast.to(room).emit('ready', socket.id, tracks_callback, remot_track_added, userInfo);
          }
        }catch(e){
          rooms[room] = {};
        }
      });
      socket.on('openChat', async() => { 
        const res = await getMessges(room);
        await socket.emit('initChatMessages', res['rows']);
      });
      socket.on('share_audio', function(tracks_callback, remot_track_added) {
        socket.broadcast.to(room).emit('share_audio', socket.id, tracks_callback, remot_track_added);
      });
      socket.on('share_img', function(tracks_callback, remot_track_added) {
        socket.broadcast.to(room).emit('share_img', socket.id, tracks_callback, remot_track_added);
      });
      socket.on('show_share', function(type) {
        socket.broadcast.to(room).emit('show_share', socket.id, type);
      });
      socket.on('offer', function (id, message, tracks_callback, remot_track_added, userInfo) {
        socket.to(id).emit('offer', socket.id, message, tracks_callback, remot_track_added, userInfo);
      });
      socket.on('answer', function (id, message) {
        socket.to(id).emit('answer', socket.id, message);
      });
      socket.on('candidate', function (id, message) {
        socket.to(id).emit('candidate', socket.id, message);
      });
      socket.on('remoteVideo', function (message) {
      });
      socket.on('sendChat', async function(payload) {
        rooms[room].chat.push(payload)
        creatMessage(room, payload, io);
      });
      socket.on('disconnect', function() {
        socket.broadcast.to(room).emit('bye', socket.id);
        try {
          const index = rooms[room]["members"].findIndex(member => {
            return "/#" + member.socketId == socket.id;
          });
          rooms[room]["members"].splice(index, 1);
          socket.broadcast.emit('set_rooms', rooms);

        } catch(e) {}
      });
      socket.join(room);
    } else {
      socket.emit('full', room);
    }
  });
}


/** @param {SocketIO.Server} io */
module.exports = function(io) {
  _io = io;
  return {listen};
};




// socket.emit('message', "this is a test"); //sending to sender-client only
// socket.broadcast.emit('message', "this is a test"); //sending to all clients except sender
// socket.broadcast.to('game').emit('message', 'nice game'); //sending to all clients in 'game' room(channel) except sender
// socket.to('game').emit('message', 'enjoy the game'); //sending to sender client, only if they are in 'game' room(channel)
// socket.broadcast.to(socketid).emit('message', 'for your eyes only'); //sending to individual socketid
// io.emit('message', "this is a test"); //sending to all clients, include sender
// io.in('game').emit('message', 'cool game'); //sending to all clients in 'game' room(channel), include sender
// io.of('myNamespace').emit('message', 'gg'); //sending to all clients in namespace 'myNamespace', include sender
// socket.emit(); //send to all connected clients
// socket.broadcast.emit(); //send to all connected clients except the one that sent the message
// socket.on(); //event listener, can be called on client to execute on server
// io.sockets.socket(); //for emiting to specific clients
// io.sockets.emit(); //send to all connected clients (same as socket.emit)
// io.sockets.on() ; //initial connection from a client.
