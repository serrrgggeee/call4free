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
    if (event.candidate  && event.candidate.relatedAddress !== null && event.candidate.relatedPort !== null) {
      const data = {socket_id: id, candidate: event.candidate, description}
      socket.emit('logging', ICE, 'candidate', data);
      socket.emit('candidate', id, event.candidate);
    }
  };
  callback(id, peerConnection, description);
  peerConnection.ontrack = (event) => method[data.remot_track_added](event.streams, id);
  peerConnection.onremovestream = (event) => method.RemoteTrackAdded(event.streams, id);
  // Listen for connectionstatechange on the local RTCPeerConnection
  peerConnection.addEventListener('connectionstatechange', event => {
      if (peerConnection.connectionState === 'connected') {
        const data = {state: peerConnection.connectionState, description: 'new peer conected'};
        socket.emit('logging', ICE, 'candidate conected', data);
      }else{
        const data = {state: peerConnection.connectionState, description: 'new peer not conected'};
        socket.emit('logging', ICE, 'candidate conected', data);
      }
  });
}


function onOffer(id, peerConnection, description) {
  method[data.tracks_callback](peerConnection, id);
  peerConnection.setRemoteDescription(description)
  .then(() => peerConnection.createAnswer())
  .then(sdp => {
    const data = {socket_id: id, description, sdp}
      socket.emit('logging', SDP, 'sdp offer', data);
    return peerConnection.setLocalDescription(sdp)
  })
  .then(function () {
      socket.emit('answer', id, peerConnection.localDescription);
  }).catch(function(e) {});
  // Listen for connectionstatechange on the local RTCPeerConnection
  peerConnection.addEventListener('connectionstatechange', event => {
      if (peerConnection.connectionState === 'connected') {
        const data = {state: peerConnection.connectionState, description: 'offer conected'};
        socket.emit('logging', ICE, 'candidate conected', data);
      }else{
        const data = {state: peerConnection.connectionState, description: 'offer not conected'};
        socket.emit('logging', ICE, 'candidate conected', data);
      }
  });
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
  .then(sdp => {
    const data = {socket_id: id, sdp}
    socket.emit('logging', SDP, 'sdp on ready', data);
    return peerConnection.setLocalDescription(sdp)
  })
  .then(() => {
    socket.emit('offer', id, peerConnection.localDescription, data.tracks_callback, data.remot_track_added, userInfo);
  }).catch(function(e) {});
    // Listen for connectionstatechange on the local RTCPeerConnection
  peerConnection.addEventListener('connectionstatechange', event => {
      if (peerConnection.connectionState === 'connected') {
        const data = {state: peerConnection.connectionState, description: 'ready conected'};
        socket.emit('logging', ICE, 'candidate conected', data);
      }else{
        const data = {state: peerConnection.connectionState, description: 'ready not conected'};
        socket.emit('logging', ICE, 'candidate conected', data);
      }
  });
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

