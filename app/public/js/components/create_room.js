class CreateRoom extends HTMLElement {
    connectedCallback() {
      const auth_data = null;
      let create_room = '';
      if(auth_data) {
      create_room = `<div class="create-room__wrapper">
        <h3>Create group</h3>
            <div class="create-room">
                <div class="form-group">
                <label for="exampleFormControlSelect1">Choose subject</label>
                <select id="new_subject" class="form-control">
                    <option>language</option>
                    <option>programmin</option>
                    <option>scient</option>
                </select>
                </div>
                <div class="form-group">
                <label for="exampleFormControlSelect1">Choose language</label>
                <select class="form-control" id="languages"></select>
                </div>
                <div></div>
                <div>
                <button m-click="createRoom" id="create-room" class="btn btn-primary rooms-handle-button">Create Room</button>
                </div>
            </div>
        </div>`;
      }
  
      this.innerHTML = 
      `${create_room}`;
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
  
  customElements.define('create-room-component', CreateRoom);