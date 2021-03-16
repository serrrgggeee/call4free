function makeResizers(el){
  let move = false;
  let resizer_wrapper = document.createElement("div");
  resizer_wrapper.classList.add("resizer_wrapper");
  let resizers = document.createElement("div");
  resizers.classList.add("resizers");
  let resizable = document.createElement("div");
  resizable.classList.add("resizable");
  let top_left = document.createElement("span");
  top_left.classList.add("resizer", "top-left");
  top_right = document.createElement("span");
  top_right.classList.add("resizer", "top-right");
  let bottom_left = document.createElement("span");
  bottom_left.classList.add("resizer", "bottom-left");
  let bottom_right = document.createElement("span");
  let el_wrapper = document.createElement("div");
  el_wrapper.classList.add("el_wrapper")
  resizers.appendChild(top_left)
  resizers.appendChild(top_right)
  resizers.appendChild(bottom_left)
  resizers.appendChild(bottom_right)
  resizer_wrapper.appendChild(resizers);
  resizer_wrapper.appendChild(el_wrapper);
  el_wrapper.appendChild(el);
  resizer_wrapper.style.width = 300 + 'px';
  resizer_wrapper.style.height = 300 + 'px';
  resizable.appendChild(resizer_wrapper)
  document.body.appendChild(resizable);
  makeResizableDiv(resizers, el_wrapper, resizers)
  dragElement(resizable)
  resizable.addEventListener('mousedown', function(e) {
    const posClear = getMousePos( canvas, e );
    croperUp(posClear);
    move = true;
  });
  let canvas = document.getElementById("sharedImage");
  document.addEventListener('mouseup', function(e) {
    const nodename = e.target.nodeName;
    if(nodename == "SPAN") return;
    if(move) {
      const mousePos = getMousePos( canvas, e );
      cropperMoved(el, mousePos);
       move = false;
    }
  });
}

function getMousePos( canvas, evt ) {
  const rect = canvas.getBoundingClientRect();
  const targ = evt.target.getBoundingClientRect();
  return {
    left: targ.left - rect.left,
    right: targ.right - rect.left,
    top: targ.top - rect.top,
    bottom: targ.bottom - rect.top  
  };
}

function makeResizableDiv(element, el_wrapper, element_leave) {
  const resizers = element.querySelectorAll('.resizer')
  let currentResizer;
  let ev;
  let offset;
  let canvas_left;
  let canvas_top;
  let element_left;
  let element_top;
  let offsetHeight;
  for (let i = 0;i < resizers.length; i++) {
    resizers[i].addEventListener('mousedown', function(e) {
      currentResizer = e.target;
      ev = e;
      offset = element.offsetWidth;
      offsetHeight = element.offsetHeight;
      canvas_left = el_wrapper.getBoundingClientRect().left;
      canvas_top = el_wrapper.getBoundingClientRect().top;
      element_left = element.getBoundingClientRect().left;
      element_top = element.getBoundingClientRect().top;
      window.addEventListener('mouseup', stopResize.bind(this))
      window.addEventListener('mousemove', resize.bind(this))
    })
    function resize(e) {
      if (currentResizer && currentResizer.classList.contains('top-left')) {
        let shift = e.pageX - element_left;
        let top_shift = e.pageY - element_top;
        let left = e.pageX - canvas_left;
        let top = e.pageY - canvas_top;
        if(left >= 0) {
          element.style.left = left + 'px';
          element.style.top = top + 'px';
          let width = Math.abs(offset - shift) + 'px';
          let height = Math.abs(offsetHeight - top_shift) + 'px';
          element.style.width = width;
          element.style.height = height;
        }
      }
      if (currentResizer && currentResizer.classList.contains('top-right')) {
        let width = e.pageX - el_wrapper.getBoundingClientRect().left;
        if(width <= el_wrapper.offsetWidth) {
          element.style.width = width + 'px'
        }
      }
      if (currentResizer && currentResizer.classList.contains('bottom-left')) {
          
      }
      if (currentResizer && currentResizer.classList.contains('bottom-right')) {
          
      }
    }
    function stopResize() {
      window.removeEventListener('mousemove', resize)
      currentResizer = null;
    }
  }
}


function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}