/** @type {SocketIO.Server} */
const INFO = 'info';
const WARNING = 'warning';
const ERROR = 'error';
const SDP = 'sdp';
const ICE = 'ice';
const fs = require('fs');
const { getOrCreateRoom, creatMessage, getMessges, getRooms, 
  closeRoom, getOrCreateMember, hideMember, clearRooms } = require("./room_api");

const { getLesson } = require("./lesson_api");
const { getKeyByValue, writeLogger } = require("./helpers");
let _io;
const MAX_CLIENTS = 3;
let chat_opend = false;
let rooms = [];
clearRooms();
getRooms().then((res)=> {
  rooms = res.rows;
});

/** @param {SocketIO.Socket} socket */
async function listen(socket) {
  const io = _io;
  socket.on('get_rooms', function() {
    socket.emit('set_rooms', rooms);
  })

  socket.on('chat_opend', value => {
    chat_opend = value;
  });

  socket.on('logging', (type, message, value) => {
    writeLogger(`${type}.txt`, {type, message, value}, true)
  });

  socket.on('senAdminChat', async function(payload) {
    const [room, index] = getKeyByValue(rooms, 'name', payload.room);
    creatMessage({name: payload.room}, payload, io);
 });

  socket.on('create_room', async (room, data, userInfo) => {
    room = "room/" + room;
    data.ID = userInfo.ID;
    getOrCreateRoom(room, data, userInfo)
    .then(r => 
    {
      rooms.push(r.rows[0]);
    })
    .then(()=> {
      io.emit('set_rooms', rooms);
    })
  });

  socket.on('close_room', (r) => {
    const [room, index] = getKeyByValue(rooms, 'name', r);
    if(!room["members"] || (room["members"] && room["members"].length < 1)) {
      rooms.splice(index, 1);
      closeRoom(room)
      .then(res=> {
           io.emit('set_rooms', rooms);
            
      })
      .catch(err => {
        writeLogger(`${INFO}.txt`, {type: ERROR, message: 'close_room', err})
      });
    }
  });

  socket.on('swithOnRemoteVideo', (room) => {
      socket.broadcast.to(room).emit('swithOnRemoteVideo');
  })

  socket.on('change_user', async function(payload) {
    socket.broadcast.emit('change_user_server', payload);
  });

  socket.on('join', function(socket_id, room, userInfo) {
    let socketid = null;
    const [r, index] = getKeyByValue(rooms, 'name', room);
    if(r == undefined) return;
    if(r !== undefined) {
      r['privet'] = false;
    };
    let numClients = 0;
    let member_exist = false;
    if (numClients < MAX_CLIENTS) {
      socket.on('ready', function(userInfo, tracks_callback, remot_track_added) {
        getOrCreateMember(r, userInfo).then(result => {
          const {res, created} = result;
          try{
            if(!r["members"]) {
              r["members"] = [];
            }
            writeLogger("server_logs.txt", {'type': 'members', 'room':r, 'members': r["members"]}, true);
            const id = res.rows? res.rows[0].id: res[0].id; 
            const [m, index] = getKeyByValue(r["members"], 'id', id);
            if(index === undefined) {
              r["members"].push({'id': id, 'user_info': userInfo});
              socket.broadcast.emit('add_member', r, userInfo, id);
              socket.broadcast.to(room).emit('ready', socket.id, tracks_callback, remot_track_added, userInfo);
            } else {
              writeLogger(`server_logs.txt`, {'type': 'closeclient', 'room':r, 'member_id': id}, true);
              io.to(socket_id).emit('closeclient', socket_id);
            }
          }catch(e){
            rooms[room] = {};
          }
        });
      });

      socket.on('openChat', async() => {
        const res = await getMessges(r.id);
        rooms[index].chat = res.rows;
        await socket.emit('initChatMessages', res['rows']);
      });

      socket.on('setclosesocketid', value => {
        socketid = value;
        io.to(socket_id).emit('closesocketidset');
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
      socket.on('getLesson', function (id) {
        getLesson(id).then(({statusCode, body, headers}) => {
          socket.emit('send_lesson', body);
        })
      });
      socket.on('remoteVideo', function (message) {
      });
      socket.on('sendChat', async function(payload) {
        creatMessage(r, payload, io);
      });
      socket.on('disconnect', function(info) {
        socket.broadcast.to(room).emit('bye', socket.id);
        try {
          const index = r["members"].findIndex(member => {
            return member.user_info.email == userInfo.email &&  member.user_info.name == userInfo.name;
          });
          const data = {info: info, id: socket.id, userInfo, socketid};
          writeLogger(`${INFO}.txt`, {type: ERROR, message: 'disconnect', data})
          if(socketid == socket_id) return;
          if(index > -1) {
            const user_id = r["members"][index].id;
            r["members"].splice(index, 1);
            hideMember(user_id);
          }
          socket.broadcast.emit('set_rooms', rooms);

        } catch(e) {
        }
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
