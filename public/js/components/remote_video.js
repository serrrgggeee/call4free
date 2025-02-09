class Video extends HTMLElement {
  connectedCallback() {
    const self = this;
    // https://developers.google.com/web/fundamentals/web-components/customelements
    this.innerHTML = 
    `<div class="111-111">
      <video class="remoteVideo" id="remoteVideo-${this.item}" playsinline autoplay muted></video>
      <img class="image_room" id="imgsrc-${this.item}" src="imgsrc"></img>
      <!--span id="audio_share" class="get_share" id="getAudioShare">listen</span-->
      <span  id="getImgShare-${this.item}" class="img_share get_share">watch</span>
      <!--audio class="remoteAudio" id="remoteAudio-${this.item}" controls autoplay></audio-->
    </div>`;


    this.video =  document.getElementById('remoteVideo-' + this.item);
    this.audio =  new Audio();
    this.audio.addEventListener("loadeddata", value => {
    this.audio.play();
    });

    this.video['srcObject'] = new MediaStream();
    this.video.style.display = 'none';
    this.audio['srcObject'] = new MediaStream();
    this.room = data.users_room[this.item];
    this.img =  document.getElementById('imgsrc-' + this.item);
    this.img['src'] = this.room.img;

    // Подписываемся на событие video
    this.video.addEventListener('video', (e)=> { 
      this.setVideoStream(e['detail'].video);
    });    

    // Подписываемся на событие audio
    this.video.addEventListener('audio', (e)=> { 
      this.setAudionStream(e['detail'].audio);
    });

    this.video.addEventListener('click', (e)=> { 
      main_video['srcObject'] = this.video['srcObject'];
      main_video.dataset.email = this.room.email; 
    });

  }


  static get observedAttributes() {
    return ['item'];
  }


  get item() {
    return this.getAttribute('item');
  }

  hideVideo() {
    this.video['srcObject'] = new MediaStream();
    this.video.style.display = 'none';
    this.img['src'] = this.room.img;
    this.img.style.display = 'inherit';
  }

  showVideo(track) {
    this.video['srcObject'].addTrack(track);
    this.video.style.display = 'inherit';
    this.img.style.display = 'none';
  }

  setVideoStream(track) {
    track.addEventListener('mute', (e)=> { 
      this.hideVideo();
      if(main_video.dataset.email == this.room.email) {
        main_video['srcObject'] = new MediaStream();
      }
    });    
    track.addEventListener('unmute', (e)=> { 
      this.showVideo(track)
    });
    try {
      const img_share =  document.getElementById('getImgShare-' + this.item);
      const tracks = this.video['srcObject'].getTracks()
      for (var i = 0; i < tracks.length; i++) {
        this.video['srcObject'].removeTrack(tracks[i]);
      }
      if(track.kind) {
        this.showVideo(track);
      } else {
        this.hideVideo();
      }
    } catch(e) {}
  }

  setAudionStream(track) {
    try {
      const tracks = this.audio['srcObject']['getTracks']()
      for (var i = 0; i < tracks.length; i++) {
        this.audio['srcObject']['removeTrack'](tracks[i]);
      }
      if(track.kind) {
        this.audio['srcObject']['addTrack'](track);
      } else {
        this.audio['srcObject'] = new MediaStream();
      }
    } catch(e) {}
  }


  set item(val) {
    if (val) {
      this.setAttribute('item', '');
    } else {
      this.removeAttribute('item');
    }
  }


  getAudioShare () {
    getSharedAudio();
  }


  getImgShare () {
    getSharedImage();
  }
}

customElements.define('remote-video', Video);