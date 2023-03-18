// callback of document loaded
let video_functions = {
  addUser(id, callback, description=null, userInfo) {
    data.users_room[id] = userInfo;
    newPeer(id, callback, description);
    this.users_room(id, userInfo['email']);
  },

  users_room(id, email) {
    const video =document.querySelectorAll(`[data-email="${email}"]`);
    if (video.length > 0) return;
    const video_node = document.createElement('div');
    let remote_videos_str = 
      `<div class="user__item">
        <remote-video data-email="${email}" id="${id}" item=${id} share="item['share']">ffff</remote-video>
      </div>`;
    video_node.innerHTML = remote_videos_str;
    document.getElementById("remoteVideos").appendChild(video_node.firstChild);
  },

  userTracks(peerConnection, id) {
    if(!localVideo['srcObject'])return;
    for (var key in data.sender) { 
      delete data.sender[key];
    }
    for (const track of localVideo['srcObject'].getTracks()) {
      if((track.kind == "audio" && data.track_enabled_audio) || (track.kind == "video" && data.track_enabled_video)) {
        try {
          data.sender[track.id] = peerConnection.addTrack(track, localVideo['srcObject'] );
        } catch(e) {}
      } else {
        try {

          peerConnection.removeTrack(data.sender[track.id]);
        } catch(e) {
        }
        localVideo['srcObject'].removeTrack(track);
      }
    }
  },

  RemoteTrackAdded(streams, id) {    
    if(streams) {
      for(let item in streams) {
        let  stream = streams[item];
        const tracks = stream.getTracks();
        const email = data.users_room[id]['email'];
        for (const track in tracks) {          
          const event = new CustomEvent(tracks[track].kind, {
                detail: {
                  [tracks[track].kind]: tracks[track]
                }
              });
          const video =document.querySelector(`[data-email="${email}"] video`);
          video.dispatchEvent(event);
        }
      }  
    } else {
      data.users_room[id]['video'] = {};
    }
  },

  switchOnVideo() {
    function run() {
      if(localVideo['srcObject']) {
        for (const track of localVideo['srcObject'].getTracks()) {
          if(track.kind == "video"){
            track.stop();
            localVideo['srcObject'].removeTrack(track);
          }
        }
      }
      if(display_video == 'none') {
        constraints.video = {
          width: 96,
          height: 96,
        }
        data.track_enabled_video = true;
        display_video = "inherit";
      }else{
        delete constraints.video;
        constraints.audio = true;
        data.track_enabled_video = false;
        display_video = "none";
      }

      data.tracks_callback = "userTracks";
      data.remot_track_added = "RemoteTrackAdded";

      navigator.mediaDevices.getUserMedia(constraints)
        .then(function (stream) {
          for (const track of stream.getTracks()) {
            if(!localVideo['srcObject']) {
              localVideo['srcObject'] = new MediaStream();
            }
            if(track.kind == "video"){
              track.enabled = data.track_enabled_video;
              localVideo['srcObject'].addTrack(track);
              
              track.addEventListener('unmute', (e)=> { 
                  clearTimeout(data.delay.out)
              });
              localVideo.addEventListener('suspend', (e)=> { 
                  if(data.track_enabled_video) {
                    display_video = 'none'
                    debounce(method.switchOnVideo, 5000, data.delay)();
                  }
              });
              localVideo.onloadedmetadata = (ev) => {
                if(!localVideo.srcObject.active) {
                  display_video = 'none'
                  debounce(method.switchOnVideo, 3000, data.delay)();
                }
              };
            }
          }
      })
      .then(event => {
        for (const pc in data.peerConnections) {
           newPeer(pc, onReady, null);
        }
        if(display_video == 'none') {
          localVideo.style.display = display_video;
          localVideo.srcObject.muted = true;
        } else {
          localVideo.style.display = display_video;
        }

      })
      .catch((err) => {
        getUserMediaError(err, 'video')
      });
      localVideo.addEventListener('playing', event => {
        switchOnVideo.classList.add("active");
      });
    }
    debounce(run, 1000, data.delay)();
  },

  switchOnAudio() {
    if(localVideo['srcObject']) {
      for (const track of localVideo['srcObject'].getTracks()) {
        if(track.kind == "audio") {
          track.stop();
          localVideo['srcObject'].removeTrack(track);  
        }
      }
    }
    function run() {
      const switchOnAudio =  document.getElementById('switchOnAudio');
      data.track_enabled_audio = constraints.audio = !constraints.audio;
      data.tracks_callback = "userTracks";
      data.remot_track_added = "RemoteTrackAdded";
      if(data.track_enabled_audio) {
        switchOnAudio.classList.add("active");
      } else {
        constraints.audio = false;
        constraints.video = {
            width: 96,
            height: 96,
          }
        switchOnAudio.classList.remove("active"); 
      }
      navigator.mediaDevices.getUserMedia(constraints)
        .then(function (stream) {
          for (const track of stream.getTracks()) {
            if(!localVideo['srcObject']) {
              localVideo['srcObject'] = new MediaStream();
            }

            if(track.kind == "audio") {
              track.enabled = data.track_enabled_audio;
              localVideo['srcObject'].addTrack(track);
            }
          }
        })
        .then(event =>{
        for (const pc in data.peerConnections) {
          newPeer(pc, onReady);
        }
      });
    }
    debounce(run, 1000, data.delay)();
  },

  isUserLoad(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if(data.user_load) {
          resolve("result");
        } else {
          resolve(this.isUserLoad(ms));
        }
      }, ms)
    });
  },

  join(ms=1000) {
    setTimeout(() => {
        if(data.disconnected) {
          video_functions.join(1000);
        } else {
          socket.emit('join', socket.id, room, userInfo);
          socket.emit('ready', userInfo, "userTracks", 'RemoteTrackAdded');
          data.user_load = true;
        }
      }, ms)
  },

  disconnect(){
    data.disconnected = true;
    video_functions.join();
  },

  connect(){
    data.disconnected = false;
  },
  serverReady() {
    method.showBottomMenu();
  },

  close_client(id) {
    logger(INFO, 'close_client', {id: socket.id});
    if(socket.id == id) {
      socket.emit('setclosesocketid', id);
    }
  },
  closesocketid_set() {
    socket.close();
    var win = window.open("about:blank", "_self");
    win.close();
    window.close();
  },
  openChat(ms=1000) {
    setTimeout(() => {
      if(data.disconnected) {
        video_functions.openChat();
      } else {
        socket.emit('openChat');
      }
    }, ms)

  }
}

addMethods(method, video_functions);
