class FilterRoom extends HTMLElement {
    connectedCallback() {
      const auth_data = method.getToken();
      let filter_room = '';
      if(auth_data) {
      filter_room = `<div class="filter__wraper">
      <h3>Filter groups</h3>
      
      <div class="filter">
        <div class="form-group">
          <label for="exampleFormControlSelect1">Choose subject</label>
          <select m-change="filterSubject" id="subject_filter" class="form-control"></select>
        </div>

        <div class="form-group">
          <label for="exampleFormControlSelect1">Choose language</label>
          <select m-change="filterLanguage"  class="form-control" id="languages_filter"></select>
        </div>

        <div></div>
        <div>
          <button m-click="clear" class="btn btn-primary rooms-handle-button">Clear</button>
        </div>
        
      </div>
    </div>`;
      }
  
      this.innerHTML = 
      `${filter_room}`;
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
  
  customElements.define('filter-room-component', FilterRoom);