class Auth extends HTMLElement {
  connectedCallback() {
    const self = this;
    const auth_data = method.setAuthData();
    // let auth_ways = '';
    // if(!auth_data) {
    const auth_ways = `<div class="auth_ways" id="auth_ways">
        <div class="auth_way">
          <div class="auth_by_google_account" class="row"> 
            <div class="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></div>
          </div>
        </div>
        <div class="auth_way">
          <div class="row" id="register_by_email">
            <form m-submit="registration" id="registration" action="https://video.chat.vokt.ru/auth/registration/" method="POST">
              <input type="text" m-change1="registerByEmail" name="email" placeholder="E-mail">
              <input type="password" name="password1" placeholder="password1">
              <input type="password" name="password2" placeholder="password2">
              <button type="submit">Зарегистрироваться</button>
            </form>
        </div>
        </div>
        <div class="auth_way">
          <div class="row" id="auth_by_email">
            <form m-submit="login" id="registration" action="https://video.chat.vokt.ru/login" method="POST">
              <input type="text" name="username" placeholder="username">
              <input type="password" name="password" placeholder="password">
              <button type="submit">Авторизоваться</button>
            </form>
          </div>
        </div> 
      </div>`;
    // }
    // else{
    //   auth_ways = `<div class="auth_way" style="display: none;">
    //       <div class="auth_by_google_account" class="row"> 
    //         <div class="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></div>
    //       </div>
    //     </div>`;
    // }

    this.innerHTML = 
    `${auth_ways}`;
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

customElements.define('auth-component', Auth);