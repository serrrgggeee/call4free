function getTracks() {

}

localVideo.addEventListener('pause', event => {
    switchOnVideo.classList.remove("active");
});
localVideo.addEventListener('abort', event => {
    switchOnVideo.classList.remove("active");
});
localVideo.addEventListener('emptied', event => {
    switchOnVideo.classList.remove("active");
});

function newPeer(id, callback, description) {
  let peerConnection = data.peerConnections[id];
  if(peerConnection === undefined){
    peerConnection = new RTCPeerConnection(config);
    data.peerConnections[id] = peerConnection; 
  }  
  peerConnection.onicecandidate = (event) => {
    if (event.candidate  && event.candidate.relatedAddress !== null && event.candidate.relatedPort !== null) {
      const data = {socket_id: id, candidate: event.candidate, description}
      logger(ICE, 'candidate', data);
      socket.emit('candidate', id, event.candidate);
    }
  };
  callback(id, peerConnection, description);
  peerConnection.ontrack = (event) => {
    method[data.remot_track_added](event.streams, id);
  }
  peerConnection.onremovestream = (event) => method.RemoteTrackAdded(event.streams, id);
  // Listen for connectionstatechange on the local RTCPeerConnection
  peerConnection.addEventListener('connectionstatechange', event => {
      if (peerConnection.connectionState === 'connected') {
        const data = {state: peerConnection.connectionState, description: 'new peer conected'};
        logger(ICE, 'candidate conected', data);
      }else{

        const data = {state: peerConnection.connectionState, description: 'new peer not conected'};
        logger(ICE, 'candidate conected', data);
      }
  });
}


function onOffer(id, peerConnection, description) {
  method[data.tracks_callback](peerConnection, id);
  peerConnection.setRemoteDescription(description)
  .then(() => peerConnection.createAnswer())
  .then(sdp => {
    const data = {socket_id: id, description, sdp}
    logger(SDP, 'sdp offer', data);
    return peerConnection.setLocalDescription(sdp)
  })
  .then(function () {
      socket.emit('answer', id, peerConnection.localDescription);
  }).catch(function(e) {});
  // Listen for connectionstatechange on the local RTCPeerConnection
  peerConnection.addEventListener('connectionstatechange', event => {
      if (peerConnection.connectionState === 'connected') {
        const data = {state: peerConnection.connectionState, description: 'offer conected'};
        logger(ICE, 'candidate conected', data);
      }else{
        const data = {state: peerConnection.connectionState, description: 'offer not conected'};
        logger(ICE, 'candidate conected', data);
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
    logger(SDP, 'sdp on ready', data);
    return peerConnection.setLocalDescription(sdp)
  })
  .then(() => {
    socket.emit('offer', id, peerConnection.localDescription, data.tracks_callback, data.remot_track_added, userInfo);
  }).catch(function(e) {});
    // Listen for connectionstatechange on the local RTCPeerConnection
  peerConnection.addEventListener('connectionstatechange', event => {
      if (peerConnection.connectionState === 'connected') {
        const data = {state: peerConnection.connectionState, description: 'ready conected'};
        logger(ICE, 'candidate conected', data);
      }else{
        const data = {state: peerConnection.connectionState, description: 'ready not conected'};
        logger(ICE, 'candidate conected', data);
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


function  getUserMediaError(error, device) {
  const error_data = {'TypeError': error.TypeError}
  logger(INFO, 'getUserMediaError', {error: error_data, userInfo}, true);
  data.track_enabled_video = false;
  switch(error.name) {
    case 'NotFoundError': 
      const error_data =`${device} устройство не найдено возможно оно не включено`;
      logger(INFO, 'device not found', {error: error_data, userInfo}, true);
      break
    default:
      break
  }
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
// TO DO
/*  const index = peerConnectionsInited.indexOf(id);
  if (index !== -1) {
    peerConnectionsInited.splice(index, 1);
  }*/
}


function removeElement(id) {
  const el = document.getElementById(id);
  if(el) {
    return el.parentNode.removeChild(el);
  }
}

