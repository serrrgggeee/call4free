let init_rooms_functions = {
  showOpenButton() {

  },
  
  setMainVideo() {
    main_video =  document.getElementById('mainVideo');
    main_video['srcObject'] = new MediaStream();
  },

  ready() {

  }
}
addMethods(method, init_rooms_functions);

socket.on('change_user_server',(message) => {
  // console.log('change_user_server'); TO DO
  // console.log(message);
});

