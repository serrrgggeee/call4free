const method = {
  filterSubject(e){
    const value = e.target['value'];
    data.filters["subject"] = value;
    this.filterRooms();
  },

  filterLangauge(e){
    const value = e.target['value'];
    data.filters["language"] = value;
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
    const subject = document.getElementById("new_subject")['value'];
    const language = document.getElementById("languages")['value'];
    const date_time = this.getDateTime();
    socket.emit('create_room', room, {subject, language, date_time}, userInfo);
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
      // if(room.privet) break;
      rooms_str += 
        `<div  class="room">
            <img m-click="closeRoom(${i})" src="/img/ico/close.png" class="close"/>
            <div class="title">
              <div class="theme">theme: ${room.subject}</div>
              <div class="theme">language: ${room.language}</div>
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
    console.log(data.filters);
    if(Object.keys(data.filters).length == 0) {
      data.filterd_rooms = data.rooms;
    } else {
      const filtering_rooms = Object.assign({}, data.rooms);
      for (const filter in data.filters) {
        const value = data.filters[filter];
        for (const room in filtering_rooms) {
            if(data.rooms[room][filter].toLowerCase() != value.toLowerCase()) {
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
  },

  getLanguages() {
    let languagesData = fetch('https://video.chat.vokt.ru/comunicate/language/');


    languagesData.then(function(res){
      if(data.languages.length > 0) {
        return data.languages;
      }
      const languages = JSON.parse(res.response);
      for (const i in languages) {
        const language = languages[i];
        data.languages += 
          `<option>` + language.name + `</option>`;
      }
      document.getElementById("languages").innerHTML = data.languages;
      document.getElementById("languages_filter").innerHTML = data.languages;
    }).catch(function(error){
      console.log(error);
    });
  },

  getCategories() {
    let categoriesData = fetch('https://video.chat.vokt.ru/comunicate/subject/');


    categoriesData.then(function(res){
      if(data.categories.length > 0) {
        return data.categories;
      }
      const categories = JSON.parse(res.response);
      for (const i in categories) {
        const subject = categories[i];
        data.categories += 
          `<option>` + subject.name + `</option>`;
      }
      document.getElementById("new_subject").innerHTML = data.categories;
      document.getElementById("subject_filter").innerHTML = data.categories;
    }).catch(function(error){
      console.log(error);
    });
  }
}
