// sockets actions

socket.on('full', function(room) {
    alert('Room ' + room + ' is full');
});


socket.on('bye', function(id) {
    handleRemoteHangup(id);
    removeElement(id);
    
});


socket.on('ready', (id, tracks_callback, remot_track_added, userInfo) => {
  data.tracks_callback = tracks_callback;
  data.remot_track_added = remot_track_added;
  method.addUser(id, onReady, null, userInfo);
});


socket.on('serverReady', function(id, candidate) {
  method.serverReady();
});


socket.on('offer', (id, description, tracks_callback, remot_track_added, userInfo) =>{
  data.tracks_callback = tracks_callback;
  data.remot_track_added = remot_track_added;
  method.addUser(id, onOffer, description, userInfo);
});



socket.on('candidate', function(id, candidate) {
  data.peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => {});
});


socket.on('answer', function(id, description) {
  data.peerConnections[id].setRemoteDescription(description);
});

socket.on('disconnect',function(){
  method.disconnect();
});

socket.on('connect',function(){
  userInfo["socketId"] = socket.id;
  method.connect();
});

socket.on('closeclient',function(id){
  method.close_client(id);
});

socket.on('closesocketidset', () => {
  method.closesocketid_set();
});

socket.on('update_lessons', (payload) => {

});

socket.on('login',function(){
  method.hideAuthenticationForm();
});

// Object.keys(window).forEach(key => {
//     if (/^on/.test(key)) {
//         localVideo.addEventListener(key.slice(2), event => {
//             console.log(event);
//         });
//     }
// });
