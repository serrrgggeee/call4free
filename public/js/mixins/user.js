let  userInfo = {};

function onSignIn(googleUser) {
  userInfo = googleUser.getBasicProfile();
  socket.emit('logging', INFO, 'sign in', userInfo);
  method.setUserInfo();
}

let user_functions = {
    setUserParams() { 
    document.getElementById("userImg")['src'] = userInfo.img;
    document.getElementById("userName").innerHTML = userInfo.name;
  }
}
addMethods(method, user_functions);
