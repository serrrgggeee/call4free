/** @type {SocketIO.Server} */
const SDP = 'sdp';
const ICE = 'ice';
const fs = require('fs');
const { getOrCreateRoom, creatMessage, getMessges, getRooms, 
  closeRoom, getOrCreateMember, hideMember } = require("./room_api");

const { getLesson } = require("./lesson_api");
const { getKeyByValue, writeLogger, INFO, ERROR} = require("./helpers");
let _io;
const MAX_CLIENTS = 3;
let chat_opend = false;
let rooms = [];

function get_rooms() {
  getRooms().then((res)=> {
    rooms = res.data
  });
  
}

get_rooms();
// clearRooms();

/** @param {SocketIO.Socket} socket */
async function listen(socket) {
  const io = _io;
  socket.on('get_rooms', function() {
    socket.emit('set_rooms', rooms);
  })

  socket.on('chat_opend', value => {
    chat_opend = value;
  });

  socket.on('logging', (type, message, value, trace) => {
    writeLogger(`${type}.txt`, {type, message, value}, true, trace)
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

  // сначала join а потом что бы проинициализировать все события, до это они не доступны
  socket.on('join', function(socket_id, room, userInfo) {
    let socketid = null;
  
    let numClients = 0;
    let is_in_room = false;

    if (numClients < MAX_CLIENTS) {
      socket.on('ready', function(userInfo, tracks_callback, remot_track_added) {
        getOrCreateMember(room, userInfo).then(result => {
          const data = result.data;
          if('errors' in data) {
            socket.emit('serverNotReady', data['errors'])
            return
          }

          writeLogger("server_logs.txt", {'type': 'members', 'room':room, 'members': room["members"]}, true);

          is_in_room = data.is_in_room;
          if(data.is_in_room == false) {

            // socket.broadcast.emit('add_member', data['room'], data['user_info'], data['pk']);
            getRooms().then((res)=> {
              rooms = res.data
              socket.broadcast.emit('set_rooms', rooms);
            });
            socket.broadcast.to(room).emit('ready', socket.id, tracks_callback, remot_track_added, userInfo);
            socket.emit('serverReady', 'enjoy the game')
          } else {
            const payload = {'info': 'максимальное количество возможных подключений'};
            writeLogger(`server_logs.txt`, {'type': 'serverNotReady', 'room':room, 'member_id': data['pk'], 'info':  payload}, true);

            socket.emit('serverNotReady', payload)
          }
        });
      });

      socket.on('openChat', async() => {
        const res = await getMessges(333);
        room.chat = res.rows;
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
      // socket.on('candidate', function (id, message) {
      //   socket.to(id).emit('candidate', socket.id, message);
      // });
      socket.on('getLesson', function (id) {
        getLesson(id).then(({statusCode, body, headers}) => {
          io.emit('send_lesson', body);
          io.emit('hide_lesson', {open: true});
        })
      });
      socket.on('hideLesson', function (payload) {
        io.emit('hide_lesson',  payload);
      });

      socket.on('setSelectionText', function (payload) {
        // io.emit('set_selection_text', payload);
        socket.broadcast.to(room).emit('set_selection_text', payload);
      });

      socket.on('remoteVideo', function (message) {
      });
      socket.on('sendChat', async function(payload) {
        creatMessage(room, payload, io);
      });
      socket.on('disconnect', disconect);
      socket.on('login', ()=> {
        socket.broadcast.to(room).emit('login', {});
      });
      socket.join(room);
    } else {
      socket.emit('full', room);
    }
    function disconect(info) {
        if(is_in_room == true) return;
        socket.broadcast.to(room).emit('bye', socket.id);
        try {
          
          const data = {info: info, id: socket.id, userInfo, socketid};
          writeLogger(`${INFO}.txt`, {type: ERROR, message: 'disconnect', data})
          hideMember(room, userInfo).then((res)=>{
            // hideMember(user_id);
            getRooms().then((res)=> {
              rooms = res.data
              socket.broadcast.emit('set_rooms', rooms);
  
            });
            
          });

        } catch(e) {
        }
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
