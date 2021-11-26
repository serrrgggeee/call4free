socket.on('set_rooms', function (value)  {
  userInfo["socketId"] = socket.id;
  data.rooms = value;
  data.count = Object.keys(data.filterd_rooms).length;
  method.filterRooms();
  method.getLanguages();
  method.getCategories();
  
});

socket.on('add_member', function (room, userInfo, id)  {
  method.addMember(room, userInfo, id);
  
});

const signin = document.getElementById("google-signin-client_id");
signin.setAttribute("content", google_sighnin_id);

method.getRoom();
window.onunload = window.onbeforeunload = function() {
    socket.close();
};
