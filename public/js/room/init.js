let init_functions = {
  showOpenButton() {
    const room = document.getElementById("room");
    const button = document.createElement("button");
    button.innerHTML = 'open room';
    button.id = 'open_room';
    button.setAttribute('m-click', 'includeHTML');
    room.appendChild(button);
  },

  includeHTML() {
    const el = document.getElementById("room");
    const file = el.getAttribute("room");
    if (file) {
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {
            el.innerHTML = this.responseText;
            method.userAuthenticated();
          }
          if (this.status == 404) {el.innerHTML = "Page not found.";}
          el.removeAttribute("room");
        }
      }
      xhttp.open("GET", file, true);
      xhttp.send();
      return;
    }
  },

  initDjangoUser(token) {
      method.initDjangoUserMixin(token)
      .then(xhr => {
        method.setDjangoUserInfoRoom();
      });
  },

  initGoogleUser() {
      method.showOpenButton();
  },
  setMainVideo() {
    main_video =  document.getElementById('mainVideo');
    main_video['srcObject'] = new MediaStream();
  },

  ready() {
    method.loadGoogleSrcipt();
    const auth_data = method.setAuthData();
    if(!auth_data) return null
    try {
      init_functions[auth_data.auth_method](auth_data.token);
    } catch (error) {}

    data.canvas = document.getElementById('sharedImage');
    // data.ctx = data.canvas.getContext('2d'); TO DO
  }
}
addMethods(method, init_functions);

// socket.on('change_user_server',(message) =>{ TO DO
//   console.log('change_user_server');
//   console.log(message);
// });
