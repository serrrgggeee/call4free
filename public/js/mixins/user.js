let  userInfo = {};
let  userInfoOld = {};

function onSignIn(googleUser) {
  if(Object.keys(userInfo).length > 0) {
    userInfoOld = userInfo;
  }
  userInfo = googleUser.getBasicProfile();
  logger(INFO, 'sign in', userInfo);
  method.googleAuth(googleUser);
  method.setUserInfo('google');
  method.showOpenButton();
}

function googleSignOut() {
  const auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    logger(INFO, 'sign out', {error: 'Google user signed out.', userInfo}, true);
  });
  removeSignOutButton();
}

function removeSignOutButton() {
  const open_room = document.getElementById('open_room')
  if(open_room){
    open_room.remove();
  }
  const sign_out = document.querySelector('.sign_out')
  if(sign_out) {
    sign_out.remove()
  }
}

function djangoLogOut() {
  let regData = fetch('https://video.chat.vokt.ru/logout', {method: 'post'}).then(xhr => {
        const response = JSON.parse(xhr.response);
        removeSignOutButton();
        sessionStorage.setItem('bearer_token', response['token']);
      });
}

function getBasicProfileByEmail(props) {
    this.email = props.email;
    this.image_url = props.image_url;
    this.name = props.name;
    this.id = props.id;

    
    this.getImageUrl = function() {
      return this.image_url;
    }
    this.getId = function() {
      return this.id;
    }
    this.getName = function() {
      return this.name;
    }
    this.getEmail = function() {
      return this.email;
    }
}

let user_functions = {
    setUserParams() { 
        document.getElementById("userImg")['src'] = userInfo.img;
        document.getElementById("userName").innerHTML = userInfo.name;
    },
    registerByEmail(e) {
      const target = e.target;
      const email = target.value;
      userInfo = new getBasicProfileByEmail(email);
      logger(INFO, 'sign in', userInfo);
      method.setUserInfo('django');
    },
    userAuthenticated() {
      if(userInfo) {
        method.join();
        init_functions.setMainVideo();
        method.openChat();
      }
    },
    registration(e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      let regData = fetch(e.target.action, {method: 'post', form_data: formData});
    },
    login(e) {
      e.preventDefault();
      const form_data = new FormData(e.target);
      const boundary = String(Math.random()).slice(2);
      let regData = fetch(e.target.action, {method: 'post', form_data, content_type: null}).then(xhr => {
        const response = JSON.parse(xhr.response);
        sessionStorage.setItem('bearer_token', response['token']);
        method.showSignOutButton('djangoLogOut');
        method.showOpenButton();

        const id = response.id;
        const name = response.username;
        const email = response.email;
        const image_url = response.userprofile.avatar;
        const props = {id, name, email, image_url}
        userInfo = new getBasicProfileByEmail(props);
        method.setUserInfo('django');
        localStorage.setItem('token', `initDjangoUser---${response.token.access_token}` );

        googleSignOut();
      });
    },
    getProfile(location) {
        let res = fetch(`https://video.chat.vokt.ru${location}`);
        res.then(function(res){
        }).catch(function(error){
      });
    },
    googleAuth(googleUser) {
      const auth_response = googleUser.getAuthResponse();
      const base_response = googleUser.getBasicProfile();
      const granted = googleUser.getGrantedScopes();
      const bc = googleUser['Bc'];
      const url = `https://video.chat.vokt.ru/custom_accounts/google/login/callback/?scope=${googleUser.getGrantedScopes()}&authuser=${auth_response.session_state.extraQueryParams.authuser}&prompt=0&access_token=${bc.access_token}&expires_in=${auth_response.expires_in}&token_type=${auth_response.token_type}`;
      let googleData = fetch(url);
      googleData.then(function(res){
        const response = JSON.parse(res.response);
        localStorage.setItem('token', `initGoogleUser---${response.token.access_token}`);
        method.testauth();

      })
      .catch(function(error){});
    },
    testauth(e) {
      const url = "https://video.chat.vokt.ru/comunicate/language/";
      const token_info = localStorage.getItem('token').split('---');
      const auth_method = token_info[0];
      const token = token_info[1];
      fetch(url, 
        {method: 'get'},
        {"Authorization": "Token " + token}).then(xhr => {
        const response = JSON.parse(xhr.response);
      });
    },
    setUserInfo(auth_site) {
      if(!userInfo)return;
      userInfo["img"] = userInfo.getImageUrl();
      userInfo["ID"] = userInfo.getId();
      userInfo["name"] = userInfo.getName();
      userInfo["email"] = userInfo.getEmail();
      userInfo["email"] = userInfo.getEmail();
      userInfo["auth_site"] = auth_site;
      this.setUserParams();
      socket.emit('change_user', {userInfo, userInfoOld});
    },
    initDjangoUserMixin(token) {
      const url = "https://video.chat.vokt.ru/user_info/";
      return fetch(url, 
        {method: 'get'},
        {"Authorization": "Token " + token})
      .then(xhr => {
        try {
          const response = JSON.parse(xhr.response);
          const id = response.id;
          const name = response.username;
          const email = response.email;
          const image_url = response.userprofile.avatar;
          const props = {id, name, email, image_url}
          if(Object.keys(userInfo).length > 0) {
            userInfoOld = userInfo;;
          }
          userInfo = new getBasicProfileByEmail(props);
        } catch (error) {
          return {};
        }
      });
  },
}
addMethods(method, user_functions);
