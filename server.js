var custom_config = require('./server_config');
const credentials = require('./credentials');
const express = require('express');
const app = express();
var router = express.Router();

let server;
let port;
if (credentials.key && credentials.cert) {
  const https = require('https');
  server = https.createServer(credentials, app);
  port = 443;
} else {
  const http = require('http');
  server = http.createServer(app);
  port = custom_config.port;
}
const io = require('socket.io')(server);
const RoomService = require('./RoomService')(io);
app.use('/static', express.static(__dirname + '/public/img'));
io.sockets.on('connection', RoomService.listen);
io.sockets.on('error', e => console.log(e));
app.use('/', router);
router.get('/', function(req, res) {
    res.sendFile(`${__dirname}/public/index.html`);
});
app.use(express.static(__dirname + '/public'));

router.get('/video.html', function(req, res) {
    res.sendFile(`${__dirname}/public/video.html`);
})
router.get('/room/*', function(req, res) {
    res.sendFile(`${__dirname}/public/room.html`);
})
server.listen(port, () => console.log(`Server is running on port ${port}`));

