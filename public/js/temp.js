socket.on('share_audio', (id, tracks_callback, remot_track_added) => {
    data.tracks_callback = tracks_callback;
    data.remot_track_added = remot_track_added;
    newPeer(id, onShareAudio);
});

socket.on('share_img', (id, tracks_callback, remot_track_added) => {
    data.tracks_callback = tracks_callback;
    data.remot_track_added = remot_track_added;
    newPeer(id, onShareImg);
    let promise = new Promise(function(resolve, reject) {
        setTimeout(() => {
            if(data.dataChannels[id].readyState == "open"){
                resolve(true);
            }
        }, 1000);
    });
    promise.then(function(result){
        let url_data = canvas.toDataURL("image/jpeg", 1.0);
        let delay = 10;
        let charSlice = 100000;
        let terminator = "\n";
        let dataSent = 0;
        let intervalID = setInterval(function(){
            let slideEndIndex = dataSent + charSlice;
            if (slideEndIndex > url_data.length) {
                slideEndIndex = url_data.length;
            }
            if (dataSent + 1 >= url_data.length) {
                socket.emit('send', id, {"data":"\n"});
                clearInterval(intervalID);
            }else{
                let slice = url_data.slice(dataSent, slideEndIndex);
                try{
                    socket.emit('send', id, {"data": slice});
                    dataSent = slideEndIndex;
                }catch(ex){console.log(ex)}
            }
        }, delay);
    });
});

socket.on('show_share', (id, type) => {
    // let key = id.replace(/[^a-zA-Z]+/g, "").toLowerCase();
    const key = id;
    data.users_room[key]["share"] = type;
    users_room();
});

const canvas = document.getElementById("sharedImage");
const image_wrapper = document.getElementById("image-wrapper");
let ctx = canvas.getContext("2d");

ctx.canvas.height = 500;

function shareFileAudio(e) {
  const target = e.target;
  const shareFile = document.getElementById('shareFileAudio');
  let audio = document.getElementById('shareAudio');
  let url = window.URL.createObjectURL(shareFile.files[0]);
  audio.src = url;
  audio.load();
  audio.onloadeddata = () =>{
    data.audio_stream = audio.captureStream();
    socket.emit('show_share', "audio");
  }
}

function getSharedAudio() {
  socket.emit('share_audio', 'shareAudioTracks', 'RemoteAudioTrackAdded');
}


function onShareAudio(id, peerConnection){
  window[data.tracks_callback](peerConnection, id);
  peerConnection.createOffer()
  .then(sdp => peerConnection.setLocalDescription(sdp))
  .then(() =>{
     socket.emit('offer', id, peerConnection.localDescription, data.tracks_callback, data.remot_track_added);
  }).catch(function(e) {console.log(e)});
}


function cropperMoved(el, pos) {
  image_wrapper.style.display = "block";
  var img = new Image(300, 300);
  img.src = el.src;
  img.onload = () => {
    ctx.drawImage(img,pos.left, pos.top, 300, 300);
  }
  const parent = el.parentNode.parentNode;
}

function croperUp(pos) {
    image_wrapper.style.display = "none";
    ctx.clearRect(pos.left, pos.top, 300, 300);
}

function addCanvasPart(e){
  const target = e.target;
  var img = new Image();
  img.onload = function(){
    img.width = 300;
    img.height = 300;
  }
  const urlCreator = window.URL || window.webkitURL;
  img.src = target.src;
  makeResizers(img);
}



function setHeight(){
  let mainWorkSpace = document.getElementById("main__work-space");
  let navigationBar = document.getElementById("navigation-bar");
  let authenticator = document.getElementById("authenticator");
  let clientHeight = document.documentElement.clientHeight;
  mainWorkSpace.style.height = (clientHeight - navigationBar.offsetHeight - authenticator.offsetHeight) + "px";
}


function receiveChannelCallback(event) {
  let receiveChannel = event.target;
}


function RemoteAudioTrackAdded(streams, id) {
  if(streams[0].getVideoTracks().length ==  0){
    let audio = document.getElementById('sharedAudio');
    audio.srcObject = streams[0];
  }
}

function shareAudioTracks(peerConnection, id) {
  try{
    for (const track of data.audio_stream.getTracks()) {
      peerConnection.addTrack(track,data.audio_stream);
    }
  }catch(e){
    // console.log(e)
  }
}


socket.on('send', function(message) {
    handleReceiveMessage(message);
});


document.addEventListener('change', e => {
  console.log(e);
  const id = e.target['id'];
  window[id](e);  
});


const cutPx = (str, debug) => {
    try{
        if(debug){}
        return +str.replace('px', '');

    }catch(e){
        return str;
    }
}