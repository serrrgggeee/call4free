
Object.assign(data, {
  isChatInit: []
});

let chat_functions = {
  sendChatMessage : (e) => {
    const chatMessage = document.getElementById("chatMessage");
    const today = new Date();
    let date_time = method.getDateTime();
    if(chatMessage['value'].length > 1) {
      socket.emit('sendChat', {userInfo, message: chatMessage['value'], date_time});
    }
    chatMessage['value'] = "";
  },

  addChat: item => {
    const today = new Date();
    const date = method.getDate(today);
    const day_time = item.date_time.split(',');
    if(date == day_time[0]) {
      item.date_time = day_time[1];
    }
    const res = `<div class="item">
        <div class="user"><img src="${item.userInfo.img}" class="paa" alt="${item.userInfo.name}" 
            title="${item.userInfo.name}">
          <div class="date-time">${item.date_time}</div>
        </div>
        <div class="message">${item.message}</div>
      </div>`
    return res; 
  },

  hideChat: () => {
    const chatWraper = document.getElementById("chat-wrapper");
    chatWraper.style.display = chatWraper.style.display == "none" ? "flex": "none";
    if(!data.isChatInit.includes(room)) {
      socket.emit('openChat');
    }

  }

};
addMethods(method, chat_functions);

socket.on('responseChat', (payload) => {
  const chat_node = document.createElement('div');
  chat_node.innerHTML = method.addChat(payload);
  const item = document.getElementById("initChatMessages");
  item.insertBefore(chat_node.firstChild, item.firstChild);
});

socket.on('initChatMessages', (payload) => {
  if(!data.isChatInit.includes(room)) {
    data.isChatInit.push(room);
  }
  const chat_node = document.createElement('div');
  method.isUserLoad(1000).then(() => {
    payload.reverse();
    payload.forEach(item=> {
      chat_node.innerHTML = method.addChat(item);
      document.getElementById("initChatMessages").appendChild(chat_node.firstChild);
    });
  });
});

