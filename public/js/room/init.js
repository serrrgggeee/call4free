let init_functions = {
  showOpenButton() {
    const room = document.getElementById("room");
    const button = document.createElement("button");
    button.innerHTML = 'open room';
    button.id = 'open_room';
    button.setAttribute('m-click', 'includeHTML');
    room.appendChild(button);
  },

  showSignOutButton(sign_out_method) {
    const sign_out_row = document.querySelector('.sign_out_row');
    let sign_out = document.querySelector('.sign_out');
    if(sign_out == undefined || sign_out == null) {
      sign_out = document.createElement("a");
    }
    sign_out.innerHTML = 'Sign out';
    sign_out.setAttribute('href', '#');
    sign_out.setAttribute('onclick', `${sign_out_method}()`);
    sign_out.setAttribute('class', 'sign_out');
    sign_out_row.appendChild(sign_out);
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
        method.setUserInfoRoom();
      });
  },

  setMainVideo() {
    main_video =  document.getElementById('mainVideo');
    main_video['srcObject'] = new MediaStream();
  },

  ready() {
    method.loadGoogleSrcipt();
    const token_info = localStorage.getItem('token').split('---');
    const auth_method = token_info[0];
    const token = token_info[1];
    try {
      init_functions[auth_method](token);
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
