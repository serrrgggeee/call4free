const remoteVideos = document.querySelector('.remoteVideos');
const localVideo = document.querySelector('.localVideo');
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia;

const config = {
    'iceServers': [{
      'urls': ['stun:stun.l.google.com:19302']
    }],
    'RtpDataChannels': true
};

const constraints = {
    audio: false
};

const room = !location.pathname.substring(1) ? 'home' : location.pathname.substring(1);

