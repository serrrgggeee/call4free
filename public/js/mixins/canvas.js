function shareImage(e){
    const target = e.target;
    console.log(target);
   
    const imageList = document.getElementById('image-list');
    for (let i = 0; i < target.files.length; i++) {
        const file = target.files[i];
        const url = window.URL.createObjectURL(file);
        const img = createImage(url);
        imageList.appendChild(img);
    }      
}

function createImage(url) {
    let img = document.createElement("img"); 
    img.src = url;
    img.classList.add("add_canvas");
    img.addEventListener('click', (e) => {
        addCanvasPart(e);
    });
    return img;
}

function createCanvasFromUrl(url) {
    let img  = new Image();
    img.src = url;
    img.onload = () =>{
        if(img.width > data.canvas.width) {
            let ratio = img.width/data.canvas.width;
            img.width = data.canvas.width;
            img.height = img.height/ratio;
            if(img.height > data.canvas.height) {
                let ratio = img.height/data.canvas.height;
                img.height = data.canvas.height;
                img.width = img.width/ratio;
            }
        }
        if(img.height > data.canvas.height) {
            let ratio = img.height/data.canvas.height;
            img.height = data.canvas.height;
            img.width = img.width/ratio;
            if(img.width > data.canvas.width) {
                let ratio = img.width/data.canvas.width;
                img.width = data.canvas.width;
                img.height = img.height/ratio;
            }
        }
        data.ctx.clearRect(0, 0, data.canvas.width, data.canvas.height);
        data.ctx.drawImage(img,0, 0, img.width, img.height);
        data.ctx.clearRect(0, 0, data.canvas.width, data.canvas.height);
        data.ctx.drawImage(img, 0, 0, data.canvas.width, data.canvas.height);
    }
}

function changeImage() {
    socket.emit('show_share', "img");
}

function handleReceiveMessage(event){
    if (event.data == "\n") {
        setUserCanvas();
    } else {
        data.imageData += event.data;
    }
}

function setUserCanvas() {
    let img  = new Image();
    img.src = data.imageData;
    img.onload = () =>{    
       data.ctx.drawImage(img, 0, 0, data.canvas.width, data.canvas.height);
    }
    data.imageData = "";
}

function getSharedImage() {
    
    for(let dataChannel in data.dataChannels){
        data.dataChannels[dataChannel].ondatachannel = receiveChannelCallback;
    }
    socket.emit('share_img', 'shareImgTracks', 'RemoteImgTrackAdded');
}

function onShareImg(id, peerConnection){
    peerConnection.createOffer()
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() =>{
        socket.emit('offer', id, peerConnection.localDescription, data.tracks_callback, data.remot_track_added);
    }).catch(function(e) {console.log(e)});
    for(let dataChannel in data.dataChannels){
        data.dataChannels[dataChannel].ondatachannel = receiveChannelCallback;
    }
}

function shareImgTracks(peerConnection, id) {
    // try{
    //     for (const track of img_stream.getTracks()) {
    //         peerConnection.addTrack(track,img_stream);
    //     }
    // }catch(e){console.log(e)}
}

function RemoteImgTrackAdded(streams, id) {
    // let canvasStream = data.canvas.captureStream(25);
    // let imageTrack = streams[0].getVideoTracks()[0];
    // canvasStream.addTrack( imageTrack, streams[0]);
}

