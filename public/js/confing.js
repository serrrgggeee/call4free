const remoteVideos = document.querySelector('.remoteVideos');
const localVideo = document.querySelector('.localVideo');
let main_video = null;
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia;

const config = {
    'iceServers': [
        {'urls': [
            'turn:vokt.ru:8443'
        ],
        username: "vokt",
        credential: "vokt"
    }],
    'RtpDataChannels': true
};

const constraints = {
    audio: false
};

const room = !location.pathname.substring(1) ? 'home' : location.pathname.substring(1);

