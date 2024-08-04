/** @type {SocketIO.Server} */
const { MAX_CLIENTS } = require('./config');
const fs = require('fs');
const { getKeyByValue, writeLogger, INFO, ERROR} = require("./helpers");
const { getLesson } = require("./lesson_api");
const { createRoom, getRoom, creatMessage, getMessges, getRooms, 
  closeRoom, getMember, createMember, hideMember} = require("./room_api");



let _io;
let rooms = [];
const user_in_rooms = {};


getRooms().then((res)=>   {
    rooms = res.data
});

/** @param {SocketIO.Socket} socket */
async function listen(socket) {
  if(typeof rooms == 'undefined') {
    getRooms().then((res)=>   {
      rooms = res.data
    });
  }
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

  socket.on('sendAdminChat', async function(payload) {
    const [room, index] = getKeyByValue(rooms, 'name', payload.room);
    creatMessage({name: payload.room}, payload, io);
 });

 socket.on('sendAdminRoom', async function(payload) {
    console.log(payload)
    socket.disconnect();
});
 
  socket.on('updateAdminLesson', async function(payload) {
    io.sockets.emit("update_lessons", payload);
 });

  socket.on('updateAdminArticle', async function(payload) {
    io.sockets.emit("update_article", payload);
 });

  socket.on('create_room', async (room, data, userInfo) => {
    data['name'] = room
    createRoom(data)
    .then(r => 
      {
        try {
          const id = r.data['pk'];
          getRoom(id).then((res)=>   {
            rooms.push(res.data);
            io.emit('set_rooms', rooms);
          });
        } catch (err) {
          writeLogger("server_logs.txt", {data, err: err.toString(),  message: 'create room'}, true);
        }
      });
  });

  socket.on('close_room', (id) => {
      closeRoom(id)
      .then(res=> {
        const id = res?.data['pk'];
        const [room, index] = getKeyByValue(rooms, 'pk', id);
        rooms.splice(index, 1);
        io.emit('set_rooms', rooms);
      })
      .catch(err => {
        writeLogger(`${INFO}.txt`, {type: ERROR, message: 'close_room', err})
      });
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
        clients = io.in(room).fetchSockets();
        getMember(room, userInfo).then(result => {
          if(result.code == 'ERR_BAD_REQUEST') {
          }
          result = result.response? result.response: result;
          if(result.status == 404) {
            create_member(tracks_callback, remot_track_added)
          }else {
            is_in_room = check_user_in_room(room, userInfo["ID"]);
            if(!is_in_room) add_user_to_room(room, userInfo["ID"]);
            enter_to_room(result, is_in_room, tracks_callback, remot_track_added)
          }
        });
      });

      function check_user_in_room(room, user_id) {
        try {
          return user_in_rooms[room].includes(user_id)
        } catch (e) {
          user_in_rooms[room] = [];
          return false;
        }
      }

      function add_user_to_room(room, user_id) {
        user_in_rooms[room].push(user_id)
      }

      function remove_user_from_room_by_index(room, user_index) {
        user_in_rooms[room].splice(user_index, 1)
      }
      function create_member(tracks_callback, remot_track_added) {
        is_in_room = false;
        createMember(room, userInfo).then(res=>{
          result = res
          data = result.data;
          enter_to_room(result, is_in_room, tracks_callback, remot_track_added)
        });
      }

      function enter_to_room(result, is_in_room, tracks_callback, remot_track_added) {
        try {
          if('errors' in result) {
            socket.emit('serverNotReady', data['errors'])
            return
          }
        }catch (err) {
          writeLogger("server_logs.txt", {'type': 'members', 'room':room, 'members': room["members"], err: err.toString()}, true);
          const payload = {'info': 'максимальное количество возможных подключений'};
          socket.emit('serverNotReady', payload)
          return;
        }

        writeLogger("server_logs.txt", {'type': 'members', 'room':room, 'members': room["members"]}, true);
        data = result.data;
        if(is_in_room == false) {
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
      }

      socket.on('openChat', async() => {
        const res = await getMessges(room);
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
      socket.on('getLesson', function (id) {
        getLesson(id).then((res) => {
          const lesson = res.data;
          if(res.code == 'ERR_BAD_REQUEST') {
            io.emit('send_lesson', null);
          }else {
            io.emit('send_lesson', lesson);
            io.emit('hide_lesson', {open: true});

          }
        })
      });
      socket.on('hideLesson', function (payload) {
        io.emit('hide_lesson',  payload);
      });

      socket.on('setSelectionText', function (payload) {
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
        socket.broadcast.to(room).emit('bye', socket.id);
        try {
          const data = {info: info, id: socket.id, userInfo, socketid};
          writeLogger(`${INFO}.txt`, {type: ERROR, message: 'disconnect', data})
          hideMember(room, userInfo).then((res)=>{
            getRooms().then((res)=> {
              rooms = res.data
              socket.broadcast.emit('set_rooms', rooms);
            });
            getKeyByValue(user_in_rooms, )
            try {
              user_index = user_in_rooms[room].findIndex((x) => x === userInfo["ID"])
              if(user_index > -1) {
                remove_user_from_room_by_index(room, user_index);
              }
              
            } catch (error) {}
          
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


