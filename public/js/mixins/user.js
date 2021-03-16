let  userInfo = {};

function onSignIn(googleUser) {
  userInfo = googleUser.getBasicProfile();
  method.setUserInfo();
}