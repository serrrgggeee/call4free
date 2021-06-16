// callback of document loaded
function ready() {
  video_functions.includeHTML();
  getMedia()
  data.canvas = document.getElementById('sharedImage');
  // data.ctx = data.canvas.getContext('2d'); TO DO
}


let video_functions = {
  addUser(id, callback, description=null, userInfo) {
    data.users_room[id] = userInfo;
    newPeer(id, callback, description);
    this.users_room(id);
  },

  users_room(id) {
    const video_id = document.getElementById(id);
    if (video_id) return;
    const video_node = document.createElement('div');
    let remote_videos_str = 
      `<div class="user__item">
        <remote-video id="${id}" item=${id} share="item['share']">ffff</remote-video>
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
          console.log(e)
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
        for (const track in tracks) {
          const event = new CustomEvent(tracks[track].kind, {
                detail: {
                  [tracks[track].kind]: tracks[track]
                }
              });
          const video =  document.getElementById('remoteVideo-' + id);
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

  includeHTML() {
    const signin = document.getElementById("google-signin-client_id");
    signin.setAttribute("content", google_sighnin_id);
    const el = document.getElementById("room");
    const file = el.getAttribute("room");
    if (file) {
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {
            el.innerHTML = this.responseText;
          }
          if (this.status == 404) {el.innerHTML = "Page not found.";}
          el.removeAttribute("room");
        }
      }
      xhttp.open("GET", file, true);
      xhttp.send();
      return;
    }
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
  setUserParams() { 
    document.getElementById("userImg")['src'] = userInfo.img;
    document.getElementById("userName").innerHTML = userInfo.name;
    socket.emit('ready', userInfo, "userTracks", 'RemoteTrackAdded');
    data.user_load = true;
  },

  setUserInfo() {
    if(userInfo) {
      userInfo["img"] = userInfo.getImageUrl();
      userInfo["ID"] = userInfo.getId();
      userInfo["name"] = userInfo.getName();
      userInfo["socketId"] = socket.id;
      method.setUserParams();
    } else {
      method.login(userInfo);
    }
  },

  login() {}
}

addMethods(method, video_functions);
