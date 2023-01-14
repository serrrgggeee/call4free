let video_user_functions = {
  setUserInfoRoom() {
    if(userInfo) {
      method.setUserInfo('django');
      method.showOpenButton();
      method.showSignOutButton('googleSignOut');
    }
  }
}
addMethods(method, video_user_functions);
