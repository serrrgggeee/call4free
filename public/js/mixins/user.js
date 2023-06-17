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
  method.showSignOutButton('logOutMixin');
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
    logOutMixin() {
      user_functions.logOut();
      user_functions.googleSignOut();
      user_functions.djangoLogOut();
      socket.close();
    },

    googleSignOut() {
      const auth2 = gapi.auth2.getAuthInstance();
      return auth2.signOut().then(function () {
        logger(INFO, 'sign out', {error: 'Google user signed out.', userInfo}, true);
        localStorage.removeItem('token');
        user_functions.removeSignOutButton();

      });
    },

    djangoLogOut() {
      let regData = fetch('https://video.chat.vokt.ru/logout', {method: 'post'}).then(xhr => {
        const response = JSON.parse(xhr.response);
        user_functions.removeSignOutButton();
        sessionStorage.setItem('bearer_token', response['token']);
      });
    },

    getRoomRoot() {
      return document.getElementById('room');
    },
    logOut() {
      user_functions.getRoomRoot().innerHTML = '';
      user_functions.hideAuthComponent();
      user_functions.loadAuthComponent();
      localStorage.removeItem('token');
    },
    removeSignOutButton() {
      const open_room = document.getElementById('open_room');
      if(open_room){
        open_room.remove();
      }
    },
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
      console.log('userAuthenticated');
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
      socket.open();
      e.preventDefault();
      const form_data = new FormData(e.target);
      const boundary = String(Math.random()).slice(2);
      let regData = fetch(
        e.target.action, 
        {
          method: 'post',
          form_data, 
          content_type: null
        }
      ).then(xhr => {
        const response = JSON.parse(xhr.response);
        sessionStorage.setItem('bearer_token', response['token']);

        const id = response.id;
        const name = response.username;
        const email = response.email;
        const image_url = response.userprofile.avatar;
        const props = {id, name, email, image_url}
        userInfo = new getBasicProfileByEmail(props);
        user_functions.googleSignOut().then(function () {
          method.setUserInfo('django');
          localStorage.setItem('token', `initDjangoUser---${response.token.access_token}` );
          method.showOpenButton();
          method.showSignOutButton('logOutMixin');
        });
      });
    },

    hideAuthenticationForm() {
      const auth_ways = document.getElementById("auth_ways");
      auth_ways.style.display='none';
    },
    
    showAuthenticationForm() {
      const auth_ways = document.getElementById("auth_ways");
      auth_ways.style.display='getUserMediaError';
    },

    loadAuthComponent() {
      const auth_component = document.createElement("auth-component");
      // const room = method.getRoomRoot();
      console.log(auth_component);
      const body = document.body;
      body.append(auth_component);
      user_functions.loadGoogleSrcipt();
    },
    hideAuthComponent() {
      const auth_component = document.querySelector("auth-component");
      if(!auth_component) return null;
      auth_component.remove();
    },

    showSignOutButton(sign_out_method) {
      const sign_out_row = document.querySelector('.sign_out_row');
      let sign_out = document.querySelector('.sign_out');
      if(sign_out == undefined || sign_out == null) {
        sign_out = document.createElement("a");
      }
      sign_out.innerHTML = 'Sign out';
      sign_out.setAttribute('href', '#');
      sign_out.setAttribute('m-click', `${sign_out_method}()`);
      sign_out.setAttribute('class', 'sign_out');
      sign_out_row.appendChild(sign_out);

      const filter_room_event = new Event("init_filter_room");
      const langages_event = new Event("init_filter_langages");
      const categories_event = new Event("init_filter_categories");
      document.dispatchEvent(filter_room_event);
      document.dispatchEvent(langages_event);
      document.dispatchEvent(categories_event);

    },

    getProfile(location) {
        let res = fetch(`https://video.chat.vokt.ru${location}`);
        res.then(function(res){
        }).catch(function(error){
      });
    },

    loadGoogleSrcipt() {
      const newScript = document.createElement("script");
      newScript.src = 'https://apis.google.com/js/platform.js';
      newScript.async = true;
      newScript.defer = true;
      document.body.appendChild(newScript);
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

      })
      .catch(function(error){});
    },

    setAuthData() {
      const token_from_storage = localStorage.getItem('token');
      if(!token_from_storage) return null;
      const token_info = token_from_storage.split('---');
      const auth_method = token_info[0];
      const token = token_info[1];
      return {token, auth_method}
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
      const auth_data = method.setAuthData();
      console.log(url);
      return fetch(url, 
        {
          options: {method: 'get'},
          headers: {"Authorization": "Token " + auth_data.token},
        })
        .then(xhr => {
          console.log(xhr);
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
            console.log(error);
            return {};
          }
      });
    },

    showBottomMenu() {
      const navigation_bar = document.getElementById('navigation-bar');
      if(!navigation_bar) return null;
      navigation_bar.style.display = 'block';
    }

}
addMethods(method, user_functions);
