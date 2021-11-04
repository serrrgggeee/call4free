// sockets actions
document.addEventListener("DOMContentLoaded", ready);


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
  method.connect();
  userInfo["socketId"] = socket.id;
});

socket.on('close_client',function(id){
  method.close_client(id, socket.id);
});

