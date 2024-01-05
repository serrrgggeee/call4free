// let origin = window.location.origin;
const origi = "http://127.0.0.1:3000";
var socket = io.connect(origi, { transports : ['websocket'] });