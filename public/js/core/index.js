function getMedia(callback) {
  if(localVideo['srcObject']) {
    for (const track of localVideo['srcObject'].getTracks()) {
      track.stop();
      localVideo['srcObject'].removeTrack(track);
    }
  }
  return navigator.mediaDevices.getUserMedia(constraints)
  .then(stream => { 
    for (const track of stream.getTracks()) {
      if(!localVideo['srcObject']) {
        localVideo['srcObject'] = new MediaStream();
      }

      if(track.kind == "video"){
        track.enabled = data.track_enabled_video;
        localVideo['srcObject'].addTrack(track);
      }

      if(track.kind == "audio") {
        track.enabled = data.track_enabled_audio;
        localVideo['srcObject'].addTrack(track);
      }
    }
  })
  .catch(getUserMediaError);
}


function newPeer(id, callback, description, emiter) {
  let peerConnection = data.peerConnections[id];
  if(peerConnection === undefined){
    peerConnection = new RTCPeerConnection(config);
    data.peerConnections[id] = peerConnection; 
  }  
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('candidate', id, event.candidate);
    }
  };
  callback(id, peerConnection, description);
  peerConnection.ontrack = (event) => method[data.remot_track_added](event.streams, id);
  peerConnection.onremovestream = (event) => method.RemoteTrackAdded(event.streams, id);
}


function onOffer(id, peerConnection, description) {
  method[data.tracks_callback](peerConnection, id);
  peerConnection.setRemoteDescription(description)
  .then(() => peerConnection.createAnswer())
  .then(sdp => peerConnection.setLocalDescription(sdp))
  .then(function () {
      socket.emit('answer', id, peerConnection.localDescription);
  }).catch(function(e) {});
  try {
    let dataChannel = peerConnection.createDataChannel("myLabel");  
    data.dataChannels[id] = dataChannel;
    dataChannel.onopen = handleReceiveChannelStatusChange;
    dataChannel.onmessage = handleReceiveMessage;
  }catch(ex){}
}


function onReady(id, peerConnection) {
  method[data.tracks_callback](peerConnection, id);
  peerConnection.createOffer()
  .then(sdp => peerConnection.setLocalDescription(sdp))
  .then(() => {
    socket.emit('offer', id, peerConnection.localDescription, data.tracks_callback, data.remot_track_added, userInfo);
  }).catch(function(e) {});
  try {
    let dataChannel = peerConnection.createDataChannel("myLabel");  
    data.dataChannels[id] = dataChannel;
    dataChannel.onopen = handleReceiveChannelStatusChange;
    dataChannel.onmessage = handleReceiveMessage;
  }catch(e){}
}

function handleReceiveChannelStatusChange(event) {
  let receiveChannel = event.target;
  if (receiveChannel) {
     let state = receiveChannel.readyState;
     console.log(state);
  }
}


function  getUserMediaError(error, stream) {
  data.track_enabled_video = false;
  try{
    for (const track of localVideo['srcObject'].getTracks()) {
      track.enabled = data.track_enabled_video;
    }
  }catch(e){}
}


function handleRemoteHangup(id) {
  const key = id;
  data.peerConnections[id] && data.peerConnections[id].close();
  delete data.peerConnections[id];
  delete data.users_room[key];
}


function removeElement(id) {
  const el = document.getElementById(id);
  if(el) {
    return el.parentNode.removeChild(el);
  }
}

