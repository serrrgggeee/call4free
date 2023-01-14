let init_functions = {
  initDjangoUser(token) {
      method.initDjangoUserMixin(token)
      .then(xhr => {
        method.setUserInfo();
      });
  },

  setMainVideo() {
    main_video =  document.getElementById('mainVideo');
    main_video['srcObject'] = new MediaStream();
  },

  ready() {
    const token_info = localStorage.getItem('token').split('---');
    const auth_method = token_info[0];
    const token = token_info[1];
    init_functions[auth_method](token);
  }
}
addMethods(method, init_functions);

socket.on('change_user_server',(message) => {
  // console.log('change_user_server'); TO DO
  // console.log(message);
});

