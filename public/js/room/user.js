let video_user_functions = {
  setUserInfo() {
    if(userInfo) {
      userInfo["img"] = userInfo.getImageUrl();
      userInfo["ID"] = userInfo.getId();
      userInfo["name"] = userInfo.getName();
      userInfo["email"] = userInfo.getEmail();
      method.showOpenButton();
      this.setUserParams()
      // method.loadEvent();
    }
  }
}
addMethods(method, video_user_functions);
