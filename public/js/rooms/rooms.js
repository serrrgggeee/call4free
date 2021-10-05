let socket = io.connect(window.location.origin);

socket.on('set_rooms', function (value)  {
  data.rooms = value;
  data.count = Object.keys(data.filterd_rooms).length;
  method.filterRooms();
  method.getLanguages();
  method.getCategories();
  
});

const signin = document.getElementById("google-signin-client_id");
signin.setAttribute("content", google_sighnin_id);

method.getRoom();
window.onunload = window.onbeforeunload = function() {
    socket.close();
};
