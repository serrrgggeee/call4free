const data = {
  rooms: {},
  filterd_rooms:{},
  count: 0,
  filters: {}
}

const method = {
  filterCategory(e){
    const value = e.target['value'];
    data.filters["category"] = value;
    this.filterRooms();
  },

  filterSubject(e){
    const value = e.target['value'];
    data.filters["subject"] = value;
    this.filterRooms();
  },

  clear(e){
    data.filters = {};
    this.filterRooms();
  },

  getDateTime() {
    return new Date().toLocaleString();
  },

  createRoom(){
    let room = this.makeid(10);
    const category = document.getElementById("new_category")['value'];
    const subject = document.getElementById("new_subject")['value'];
    const date_time = this.getDateTime();
    socket.emit('create_room', room, {category, subject, date_time}, userInfo);
    socket.emit('get_rooms');
  },  

  closeRoom(room){
    socket.emit('close_room', room[0]);
    socket.emit('get_rooms');
  },

  getRoom(){
    setTimeout(() => {
      if(data.count <= 0) {
        socket.emit('get_rooms');
        this.getRoom();
      } else {

      }
    }, 1000);
  },

  setRooms() {
    let rooms_str = "";
    for (const i in data.filterd_rooms) {
      const room = data.filterd_rooms[i];
      rooms_str += 
        `<div  class="room">
            <img m-click="closeRoom(${i})" src="/img/ico/close.png" class="close"/>
            <div class="title">
              <div class="theme">theme: ${room.category}</div>
              <div class="theme">subject: ${room.subject}</div>
              <div class="theme">created: ${room.date_time}</div>
            </div>
            <div class="body">
              <a href="${i}" class="h" target="_blank">`
              + this.members(room.members) +
              `<div class="d-flex justify-content-between align-items-center">
                <div class="btn-group">
                  <button type="button" class="btn">join</button>
                </div>
              </div>
              </a>
            </div>
        </div>`;
    }
    document.getElementById("rooms").innerHTML = rooms_str;
  },

  filterRooms(value){
    if(Object.keys(data.filters).length == 0) {
      data.filterd_rooms = data.rooms;
    } else {
      const filtering_rooms = Object.assign({}, data.rooms);
      for (const filter in data.filters) {
        const value = data.filters[filter];
        for (const room in filtering_rooms) {
            if(data.rooms[room][filter] != value) {
              delete filtering_rooms[room];
            }
        }
        data.filterd_rooms = filtering_rooms;
      }
    }
    this.setRooms();
  },

  members(room_members) {
    let members = "";
    for (const i in room_members) {
      const member = room_members[i];
      members += `<img  class="card-text" src="${ member.img }" :alt="${ member.name }">`
    }
    return members;
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
  setUserParams() {
    document.getElementById("userImg")['src'] = userInfo.img;
    document.getElementById("userName").innerHTML = userInfo.name;
  },

  makeid(length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}




let socket = io.connect(window.location.origin);

socket.on('set_rooms', function (value)  {
  data.rooms = value;
  method.filterRooms();
  data.count = Object.keys(data.filterd_rooms).length;
  
});

method.getRoom();
window.onunload = window.onbeforeunload = function() {
    socket.close();
};

