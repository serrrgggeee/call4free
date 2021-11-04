let  userInfo = {};

function onSignIn(googleUser) {
  userInfo = googleUser.getBasicProfile();
  socket.emit('logging', INFO, 'sign in', userInfo);
  method.setUserInfo();
}

let user_functions = {
  setUserInfo() {
    if(userInfo) {
      userInfo["img"] = userInfo.getImageUrl();
      userInfo["ID"] = userInfo.getId();
      userInfo["name"] = userInfo.getName();
      userInfo["email"] = userInfo.getEmail();
      method.setUserParams();
    }
  },
}

addMethods(method, user_functions);