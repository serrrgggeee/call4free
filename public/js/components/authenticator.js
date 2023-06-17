class Authenticator extends HTMLElement {
  connectedCallback() {
    this.innerHTML = 
    `<nav id="authenticator" class="menu">
      <div class="container">
        <div class="row"><a class="go-rooms" href="/">Go at rooms</a></div>
        <div class="row sign_out_row"></div>
        <div class="row"> 
          <img id="userImg" class="paa" alt="">
          <h3 id="userName" class="ig"></h3>
          <div id="google_login"></div>
        </div>
        <div class="video__wrapper">
          <video class="localVideo" playsinline autoplay muted></video>
        </div>
      </div>
    </nav>`;
  }


  static get observedAttributes() {
    return ['item'];
  }


  get item() {
    return this.getAttribute('item');
  }

  set item(val) {
    if (val) {
      this.setAttribute('item', '');
    } else {
      this.removeAttribute('item');
    }
  }

}

customElements.define('authenticator-component', Authenticator);