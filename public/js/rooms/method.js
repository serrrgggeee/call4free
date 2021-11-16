const method = {
  filterSubject(e){
    const value = e.target['value'];
    data.filters["subject"] = value;
    if(value.length == 0) {
      delete data.filters["subject"];
    }
    this.filterRooms();
  },

  filterLanguage(e){
    const value = e.target['value'];
    data.filters["language"] = value;
    if(value.length == 0) {
      delete data.filters["language"];
    }
    this.filterRooms();
  },

  clear(e){
    data.filters = {};
    this.filterRooms();
    const subject = document.getElementById("subject_filter");
    const language = document.getElementById("languages_filter");
    subject['selectedIndex'] = 0;
    language['selectedIndex'] = 0;
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
  },  

  closeRoom(e, room){
    socket.emit('close_room', room[0]);
  },

  getRoom(){
    socket.emit('get_rooms');
  },

  disconnect(){
    data.disconnected = true;
  },

  connect(){
    data.disconnected = false;
  },


  setRooms() {
    let rooms_str = "";
    for (const i in data.filterd_rooms) {
      const room = data.filterd_rooms[i];
      // if(room.privet) break;
      const created = (new Date(room.created));
      rooms_str += 
        `<div  class="room">
            <img m-click="closeRoom(${room.name})" src="/img/ico/close.png" class="close"/>
            <div class="title">
              <div class="theme">theme: ${room.subject}</div>
              <div class="theme">language: ${room.language}</div>
              <div class="theme">created: ${method.getDate(created)} ${method.formatAMPM(created)}</div>
            </div>
            <div class="body">
              <a href="${room.name}"  id="room_${room.id}" class="h" target="_blank">
              <span id="room_members_${room.id}">${this.members(room.members)}</span>
              <div class="d-flex justify-content-between align-items-center">
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

  addMember(room, member, id) {
    const member_id = document.getElementById(`user_id_${id}`);
    if(member_id) return;
    const memb = `<img  class="member_item" id="user_id_${id}" src="${ member.img }" :alt="${ member.name }">`
    const members = document.getElementById(`room_members_${room.id}`);
    members.appendChild(htmlToElements(memb)[0]);
  },

  filterRooms(value){
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
      const member = room_members[i].user_info;
      const user_id = room_members[i].id;
      members += `<img id="user_id_${user_id}" class="member_item" src="${ member.img }" :alt="${ member.name }">`
    }
    return members;
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
       data.languages += 
          `<option value>---select language---</option>`;
      for (const i in languages) {
        const language = languages[i];
        data.languages += 
          `<option value="${language.pk}">${language.name}</option>`;
      }
      document.getElementById("languages").innerHTML = data.languages;
      document.getElementById("languages_filter").innerHTML = data.languages;
    }).catch(function(error){
    });
  },

  getCategories() {
    let categoriesData = fetch('https://video.chat.vokt.ru/comunicate/subject/');


    categoriesData.then(function(res){
      if(data.categories.length > 0) {
        return data.categories;
      }
      const categories = JSON.parse(res.response);
      data.categories += 
          `<option value>--select subject---</option>`;
      for (const i in categories) {
        const subject = categories[i];
        data.categories += 
          `<option value="${subject.pk}"> ${subject.name} </option>`;
      }
      document.getElementById("new_subject").innerHTML = data.categories;
      document.getElementById("subject_filter").innerHTML = data.categories;
    }).catch(function(error){
    });
  }
}
