
Object.assign(data, {
  isChatInit: []
});

let chat_functions = {
  sendChatMessage : (e) => {
    const chatMessage = document.getElementById("chatMessage");
    const editId = chatMessage.dataset.editId
    delete chatMessage.dataset.editId;
    const today = new Date();
    let date_time = method.getDateTime();
    if(chatMessage['value'].length > 1) {
      socket.emit('sendChat', {userInfo, message: chatMessage['value'], date_time, editId});
    }
    chatMessage['value'] = "";
  },

  editChatMessage : (e, args) => {
    const id  = args[0];
    const message = document.getElementById("message_" + id);
    const chatMessage = document.getElementById("chatMessage");
    chatMessage.dataset.editId = id;
    const today = new Date();
    
    if(message.textContent.length > 1) {  
      chatMessage['value'] = message.textContent;
    }
  },

  addChat: item => {
    const today = new Date();
    const date = method.getDate(today);
    const created = (new Date(item.created));
    if(date == method.getDate(created)) {
      item.datetime = method.formatAMPM(created);    
    } else {
      item.datetime =  `${method.getDate(created)} ${method.formatAMPM(created)}`;
    }

    const res = `<div class="item">
        <div class="user"><img src="${item.user_info.img}" class="paa" alt="${item.user_info.name}" 
            title="${item.user_info.name}">
          <div class="date-time">${item.datetime}</div>
          <div class="edit-message" m-click="editChatMessage(${item.id})">edit</div>
        </div>
        <div id="message_${item.id}" class="message">${item.message}</div>
      </div>`
    return res; 
  },

  updateChat: item => {
    const chatWraper = document.getElementById(`message_${item.id}`).innerHTML = item.message;
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

socket.on('responseChat', (payload, id) => {
  if(id) {
    method.updateChat(payload);
    return
  }
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

