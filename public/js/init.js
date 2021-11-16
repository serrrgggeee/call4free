let init_functions = {
  showOpenButton() {
    document.getElementById("open_room").style.display = 'block';
  },

  includeHTML() {
    const el = document.getElementById("room");
    const file = el.getAttribute("room");
    if (file) {
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {
            el.innerHTML = this.responseText;
            method.join();
            getMedia()
          }
          if (this.status == 404) {el.innerHTML = "Page not found.";}
          el.removeAttribute("room");
        }
      }
      xhttp.open("GET", file, true);
      xhttp.send();
      return;
    }
  },

  initGoogleUser() {
    const signin = document.getElementById("google-signin-client_id");
    signin.setAttribute("content", google_sighnin_id);
  },
  ready() {
    init_functions.initGoogleUser()
    
    /*data.canvas = document.getElementById('sharedImage');*/
    // data.ctx = data.canvas.getContext('2d'); TO DO
  }
}
addMethods(method, init_functions);