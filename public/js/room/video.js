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
      let display_video = "inherit";
      const switchOnVideo = document.getElementById('switchOnVideo');
      if(!constraints.video) {
        constraints.video = {
          width: 96,
          height: 96,
        }
        data.track_enabled_video = true;
        switchOnVideo.classList.add("active");
      }else{
        data.track_enabled_video = false;
        delete constraints.video;
        switchOnVideo.classList.remove("active");
        display_video = "none";
      }

      data.tracks_callback = "userTracks";
      data.remot_track_added = "RemoteTrackAdded";

      getMedia().then(event => {
        for (const pc in data.peerConnections) {
           newPeer(pc, onReady, null);
        }
        localVideo.style.display = display_video;
      });
    }
    debounce(run, 1000, data.delay)();
  },

  switchOnAudio() {
    const switchOnAudio =  document.getElementById('switchOnAudio');
    data.track_enabled_audio = constraints.audio = !constraints.audio;
    data.tracks_callback = "userTracks";
    data.remot_track_added = "RemoteTrackAdded";

    if(data.track_enabled_audio) {
      switchOnAudio.classList.add("active");
    } else {
      constraints.audio = false;
      switchOnAudio.classList.remove("active"); 
    }
    getMedia().then(event =>{
      for (const pc in data.peerConnections) {
        newPeer(pc, onReady);
      }
    });
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

  // callback of google login

  loadEvent() {
    var script = document.createElement('script');
    script.onload = function () {
    };
    script.src = '/js/confing.js';

    document.head.appendChild(script); //or something of the likes
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

  close_client(id) {
    logger(INFO, 'close_client', {id: socket.id});
    if(socket.id == id) {
      socket.emit('setclosesocketid', id);
    }
  },
  getLesson(e, id){
    socket.emit('getLesson', id);
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
