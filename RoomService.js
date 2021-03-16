/** @type {SocketIO.Server} */
const fs = require('fs');
let _io;
const MAX_CLIENTS = 3;
let chat_opend = false;
let rooms = {};
fs.readFile('rooms.json', { flag: 'a+' }, (err, data) => {
  if (err) throw err;
  try {
    rooms = JSON.parse(data);
  } catch {}

});

function changeRooms() {
  let data = JSON.stringify(rooms, null, 2);
  fs.writeFile('rooms.json', data, { flag: 'w' }, (err) => {
      if (err) throw err;
  });
}

/** @param {SocketIO.Socket} socket */
function listen(socket) {
  const io = _io;
  const listeners = io.nsps['/'].adapter.rooms;

  socket.on('get_rooms', function() {
    socket.emit('set_rooms', rooms);
  });

  socket.on('chat_opend', value => {
    chat_opend = value;
  });

  socket.on('create_room', (room, data, userInfo) => {
    room = "room/" + room;
    rooms[room] = data;
    rooms[room].chat = [];
    rooms[room].ID = userInfo.ID;
    changeRooms();
    socket.broadcast.emit('set_rooms', rooms);
  });

  socket.on('close_room', (room) => {
    if(!rooms[room]["members"] || (rooms[room]["members"] && rooms[room]["members"].length < 1)) {
      delete rooms[room];
      socket.broadcast.emit('set_rooms', rooms);
    }
  });

  socket.on('swithOnRemoteVideo', (room) => {
      socket.broadcast.to(room).emit('swithOnRemoteVideo');
  })
  socket.on('send', (id, message) => {   
      socket.to(id).emit('send', message);
  });  


  socket.on('join', function(room) {
    if(!rooms[room])return;
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
        changeRooms();
      });
      socket.on('openChat', () => {   
        socket.emit('initChatMessages', rooms[room].chat);
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
      socket.on('sendChat', function(payload) {
        rooms[room].chat.push(payload)
        changeRooms();
        io.to(room).emit('responseChat', payload);
      });
      socket.on('disconnect', function() {
        socket.broadcast.to(room).emit('bye', socket.id);
        try {
          const index = rooms[room]["members"].findIndex(member => {
            return "/#" + member.socketId == socket.id;
          });
          rooms[room]["members"].splice(index, 1);
          changeRooms();
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