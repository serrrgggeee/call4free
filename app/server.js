// const { updateListLessons } = require("./rest/lessons"); TODO

const io = require('socket.io')({
    cors: {
      origin: "http://127.0.0.1:3000",
      methods: ["GET", "POST"]
    }
});
const RoomService = require('./RoomService')(io);
io.listen(process.env.PORT);
io.sockets.on('connection', RoomService.listen);
io.sockets.on('error', e => console.log(e));

// TODO
//     try {
//         let pk = req.param('id', null);
//         let title = req.param('title', null);
//         updateListLessons({pk, title}, io)
//         res.send('OK');
//     } catch (e) {
//         res.status(500).send(e.toString());
//     }

