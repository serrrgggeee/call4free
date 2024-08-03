const { PORT } = require('./config');
const io = require('socket.io')({
    cors: {
      origin: "http://127.0.0.1:3000",
      methods: ["GET", "POST"]
    }
});
const RoomService = require('./RoomService')(io, { origins: '*:*'});
io.listen(PORT);
io.sockets.on('connection', RoomService.listen);
io.sockets.on('error', e => console.log(e));
