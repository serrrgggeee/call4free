let  userInfo = {};
let  userInfoOld = {};

const user_methods = {

    getRoomRoot() {
      return document.getElementById('room');
    },

    setUserParams() { 
        document.getElementById("userImg")['src'] = userInfo['img'];
        document.getElementById("userName").innerHTML = userInfo['name'];
    },

    userAuthenticated() {
      if(userInfo) {
        method.join();
        user_methods.setMainVideo();
        method.openChat();
      }
    },

    setMainVideo(){
      main_video=document.getElementById("mainVideo");
      main_video["srcObject"]=new MediaStream
    },

    registration(e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      let regData = fetch(e.target.action, {method: 'post', form_data: formData});
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
      const body = document.body;
      body.append(auth_component);
      user_functions.loadGoogleSrcipt();
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
        let res = fetch(`${BACKEND_URL}${location}`);
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

    getToken() {
      // logger(INFO, 'sign out', {error: 'Google user signed out.', userInfo}, true);
      return getCookie('token')
    },

    setUserInfo(auth_site, info) {
      if(!userInfo)return;
      userInfo["img"] = info["img"];
      userInfo["ID"] = info["ID"];
      userInfo["name"] = info["name"];
      userInfo["email"] = info["email"];
      userInfo["auth_site"] = auth_site;
      this.setUserParams();
      socket.emit('change_user', {userInfo, userInfoOld});
    },

    getUserInfo(token) {
      const url = `${BACKEND_URL}/user_info/`;
      return fetch(url, 
        {
          options: {method: 'get'},
          headers: {"Authorization": "Token " + token},
        })
        .then(xhr => {
          try {
            return JSON.parse(xhr.response);
            // if(Object.keys(userInfo).length > 0) {
            //   userInfoOld = userInfo;;
            // }
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
addMethods(method, user_methods);
