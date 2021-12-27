
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
    method.checkReadMessage();
  }, 

  checkReadMessage() {
    let retrievedObject = localStorage.getItem('chatCount');
    let retrieved_chat = JSON.parse(retrievedObject);
    if(retrieved_chat == null) {
      retrieved_chat = {};
    }
    let all_message = document.querySelectorAll(`#initChatMessages .item img:not([title*="${userInfo['name']}"])`).length;
    retrieved_chat[room] = all_message;
    localStorage.setItem('chatCount', JSON.stringify(retrieved_chat));
    this.changeDisplayCountMessages(all_message, all_message)
  },

  checkUnReadMessage() {

    let retrievedObject = localStorage.getItem('chatCount');
    let retrieved_chat = JSON.parse(retrievedObject);
    let count_read_messages = 0;
    let all_message = document.querySelectorAll(`#initChatMessages .item img:not([title*="${userInfo['name']}"])`).length;
    if(retrieved_chat) {
      count_read_messages = retrieved_chat[room]
    }

    this.changeDisplayCountMessages(all_message, count_read_messages)
    localStorage.setItem('chatCount', JSON.stringify(retrieved_chat));
  },

  changeDisplayCountMessages(all_message, count_read_messages) {
    const chat = document.getElementById('chat');
    let count_unread_message = all_message - count_read_messages;
    const chat_node = document.createElement('div');
    let count_read_messages_str = `<span id="countUnreadMessages">${count_unread_message}</span>`;
    if( count_unread_message > 0) {
      chat_node.innerHTML = count_read_messages_str;
      document.getElementById("chat_button").appendChild(chat_node.firstChild);
    } else {
      const count_unread_message_node = document.getElementById('countUnreadMessages');
      if(count_unread_message_node) {
        document.getElementById('countUnreadMessages').remove();
      }
    }
  }

};
addMethods(method, chat_functions);

socket.on('responseChat', (payload, id) => {
  const chat_node = document.createElement('div');
  chat_node.innerHTML = method.addChat(payload);
  const item = document.getElementById("initChatMessages");
  item.insertBefore(chat_node.firstChild, item.firstChild);
  const chatWraper = document.getElementById("chat-wrapper");
  if( chatWraper.style.display == 'flex') {
    method.checkReadMessage();
  } else {
    method.checkUnReadMessage();
  }
  if(id) {
    method.updateChat(payload);
    return
  }
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
    method.checkUnReadMessage();
  });
});

