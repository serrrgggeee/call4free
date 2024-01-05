let lesson_functions = {
  lessons_id: [],
  lesson_id: null,
  pageY: null,
  x: null,
  addLesson: lesson => {
    lesson_functions.lesson_id = lesson.pk;
    const res = `
      <div class="articles" id="articles">
        <h2 class="header" id="lesson_header" data-id="${lesson.pk}">${lesson.title}</h2>
        ${lesson_functions.articles(lesson.articles)}
      </div>
    `

    const lesson_node = document.createElement('div');
    lesson_node.innerHTML = res;
    
    lesson_node.classList.add('item');
    const lessons = document.getElementById("lesson-wrapper");
    lessons.innerHTML = "";
    lessons.append(lesson_node);
    method.lessons_init();
  },

  articles(lesson_articles) {
    let articles = "";
    for (const i in lesson_articles) {
      const title = lesson_articles[i].title;
      const text = lesson_articles[i].text;
      const id = lesson_articles[i].pk;
      articles += `
        <h3 class="article_header" id="article_header">${title}</h3>
        ${text}
      `
    }
    return articles;
  },

  hideLessonSocket: (payload) => {
    open = payload.open? payload.open: false;
    let buttons = "";
    const lessonsWraper = document.getElementById("lessons-wrapper");
    lessonsWraper.style.display = lessonsWraper.style.display == "none" || open ? "block": "none";
    if(lesson_functions.lessons_id.length == 0) {
      lesson_functions.getUserLesons().then(res=>{
        const data = JSON.parse(res.response);
        lesson_functions.lessons_id = data;
        for (const i in data) {
          const id = data[i].pk;
          const title = data[i].title;
          buttons += `
            <button class="button_lesson" m-click="getLesson(${id})">Показать урок ${id}</button>
          `;
        }
        const buttons_lessons = document.getElementById("buttons_lessons");
        buttons_lessons.innerHTML = "";
        buttons_lessons.innerHTML = buttons;
      });
    }
  },

  setSelectionText: (target) => {
    const payload = {};
    const s = new XMLSerializer();
    const root = document.getElementById('articles');
    const str = s.serializeToString(root);
    payload.root = str;
    socket.emit('setSelectionText', payload);
  },

  triggerEvent(element) {
    if (document.createEvent) {
        const ev = document.createEvent('HTMLEvents');
        ev.initEvent('contextmenu', true, false);
        element.dispatchEvent(ev);
    } else { // Internet Explorer
        element.fireEvent('oncontextmenu');
    }
  },

  getSelectionTextRoot(payload, target=null) {
    const root = document.getElementById('articles');
    const parser = new DOMParser();
    const doc = parser.parseFromString(payload.root, "text/html");
    const root_new = doc.getElementById("articles").outerHTML
    root.innerHTML = root_new;
  },

  getUserLesons() {
    const token = method.getToken();
    return fetch(
      `${BACKEND_URL}/lessons/lessons_user/`,
      {
        options: {method: 'get'},
        headers: {"Authorization": "Token " + token},
      }
    )
    .then(function(res){
      const lessons = JSON.parse(res.response);
    })
    .catch(function(res){
      if(res.status !== 200) {
        logger(ERROR, 'lessons', {error: res.responseText, userInfo}, true);
      }
    });
  },

  getLesson(e, id){
    socket.emit('getLesson', id);
  },

  recieveLesson(lesson) {
    const lesson_header = document.getElementById("lesson_header");
    const lessons = document.getElementById("lesson-wrapper");
    if(lesson_header) {
      const lesson_id = lesson_header.getAttribute('data-id');
      if(lesson_functions.lesson_id != lesson.pk) {
        lessons.innerHTML = "";
        method.addLesson(lesson);
      }
    } else {
      lessons.innerHTML = "";
      method.addLesson(lesson);
    }
  },

  hideLesson(e){
    const lessonsWraper = document.getElementById("lessons-wrapper");
    const open = lessonsWraper.style.display == "none" ? true: false;
    socket.emit('hideLesson', {open});
  },

  htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
  },

  getTextNodesBetween(rootNode, startNode, endNode) {
    var pastStartNode = false, reachedEndNode = false, textNodes = [];
    function getTextNodes(node) {
        if (node == startNode) {
            pastStartNode = true;
        } else if (node == endNode) {
            reachedEndNode = true;
        } else if (node.nodeType == 3) {
            if (pastStartNode && !reachedEndNode && !/^\s*$/.test(node.nodeValue)) {
                textNodes.push(node);
            }
        } else {
            for (let i = 0, len = node.childNodes.length; !reachedEndNode && i < len; ++i) {
                getTextNodes(node.childNodes[i]);
            }
        }
    }
    getTextNodes(rootNode);
    return textNodes;
  },

  clearColor() {
    const selected = document.getElementsByClassName("selected");
    for (var i = 0;  i < selected.length; ++i) {
      const element = selected[i];

      try{
        element.style.removeProperty("color");
      }catch(e) {console.log(e);}

    };
  },

  clearSelected() {
    const selected = document.getElementsByClassName("selected");
    for (var i = 0;  i < selected.length; ++i) {
      const element = selected[i];
      try{
        element.classList.remove('selected');
      }catch(e) {console.log(e);}

    };
  },
  clearSelectedSpan() {
    const selected = document.getElementsByClassName("selected");
    for (var i = 0;  i < selected.length; ++i) {
      const element = selected[i];
      try{
        // console.log(element.textContent); // TO DO
        // console.log(element.parentElement);
        // console.log(element.parentElement.textContent);
      }catch(e) {console.log(e);}

    };
  },

  getSelectionIndex(e) {
    lesson_functions.clearColor();
    lesson_functions.clearSelected();

    const selObj = window.getSelection();
    const range = selObj.getRangeAt(0);


    const startContainer = range.startContainer;
    const startOffset = range.startOffset;
    const endContainer = range.endContainer;
    const endOffset = range.endOffset;

    const root = document.getElementById('articles');
    window.getSelection().empty();

    const textContent = startContainer.textContent;
    const textContentEnd = endContainer.textContent;

    let wraped_text_start_first = lesson_functions.htmlToElement(textContent.substring(0, startOffset));
    const space_before = textContent.substring(startOffset-1, startOffset) == ' ' ?' ': '';
    const space_after = textContent.substring(endOffset, endOffset+1) == ' ' ?' ': '';
    let spam_text = textContent.substring(startOffset);
    if(startContainer == endContainer) {
      spam_text = textContent.substring(startOffset, endOffset);
    }

    const wraped_text_start_span = lesson_functions.htmlToElement(
      '<span class="start selected" style="color: red">' + space_before  + spam_text  + space_after +'</span>'
    );
    const wraped_text_start_second = lesson_functions.htmlToElement(textContent.substring(endOffset));

    startContainer.textContent = '';

    if(wraped_text_start_first != null) {
      startContainer.parentElement.insertBefore(wraped_text_start_first, startContainer);

    }

    startContainer.parentElement.insertBefore(wraped_text_start_span, startContainer);
    if(wraped_text_start_second && startContainer == endContainer) {
      startContainer.parentElement.insertBefore(wraped_text_start_second, startContainer);
    }

    if(wraped_text_start_first == null) {
      wraped_text_start_first = textContent;
    }

    if(startContainer == endContainer) return;

    const space_end_after = textContentEnd.substring(endOffset, endOffset+1) == ' ' ?' ': '';
    const wraped_text_end_first = lesson_functions.htmlToElement(
      '<span class="end selected" style="color: red">' + textContentEnd.substring(0, endOffset)  + space_end_after +'</span>');
    let wraped_text_end_second = lesson_functions.htmlToElement(
      textContentEnd.substring(endOffset)
    );

    endContainer.textContent = '';
    endContainer.parentElement.insertBefore(wraped_text_end_first, endContainer);

    if(wraped_text_end_second != null) {
      endContainer.parentElement.insertBefore(wraped_text_end_second, endContainer);
    }

    const textNodes = lesson_functions.getTextNodesBetween(root, wraped_text_start_span, wraped_text_end_first);

    for (var i = 0;  i < textNodes.length; ++i) {
      const element = textNodes[i];
      const container = lesson_functions.createText(element.textContent);
      element.parentElement.insertBefore(container, element);
      element.textContent = '';
    };

  },

  createText(text){
    const container = document.createElement("span");
    const text_node = document.createTextNode(text);
    container.appendChild(text_node);
    container.style.color = "green";
    container.classList.add("selected");
    return container;
  },

  shareSelected(e) {
    lesson_functions.getSelectionIndex(e);
    lesson_functions.setSelectionText(e.target);
    lesson_functions.hideSelectionMenu();
  },
  lessons_init() {
    const root = document.getElementById('articles');
    root.addEventListener('mouseup', e => {
      const text = window.getSelection().toString()
      if(e.which == 1 && text.length > 0){
        lesson_functions.rightClick(e);   
      }
    });

    document.oncontextmenu = (e) => {
      // e.preventDefault();
      // e.stopPropagation();
      lesson_functions.rightClick(e);
    };

    document.onselectionchange = (e) => {
      lesson_functions.hideSelectionMenu();
    };


    document.addEventListener('mousemove', onMouseUpdate, false);
    document.addEventListener('mouseenter', onMouseUpdate, false);
        
    function onMouseUpdate(e) {
      lesson_functions.x = e.pageX;
      lesson_functions.pageY = e.pageY;
      console.log(e.pageX);
    }

  },

  rightClick(e) {
    const contextMenu = document.getElementById("contextMenu")
              .style.display;
    if (contextMenu == "none"){
        const menu = document.getElementById("contextMenu")
        menu.style.display = 'block';
        const pageY = (typeof e.pageY !== "undefined" && e.pageY != undefined)? e.pageY: lesson_functions.pageY;
        menu.style.left = e.pageX + "px";
        menu.style.top = pageY -110 + "px";
    }
  },

  contextMenu(e) {
    // e.preventDefault();
    // e.stopPropagation();
  },

  hideSelectionMenu() {
      document.getElementById("contextMenu")
              .style.display = "none"
  },

  hideConversation() {
    const conversation = document.getElementById("conversation");
    conversation.style.display = "none";
  },

  showConversation() {
    const conversation = document.getElementById("conversation");
    conversation.style.display = "block";
  },

  hideBottonMenu(e) {
    console.log(e);
    const hide_bottom_menu = document.getElementById("hide-bottom-menu");

    if(hide_bottom_menu.classList.contains('shifted')) {
      hide_bottom_menu.classList.remove('shifted');
      lesson_functions.hideConversation();
    } else {
      hide_bottom_menu.classList.add('shifted');
      lesson_functions.showConversation();
    }
  },

};

addMethods(method, lesson_functions);

document.oncontextmenu = lesson_functions.contextMenu;
socket.on('send_lesson', (lesson) => {
  method.recieveLesson(lesson);
});

socket.on('hide_lesson', (payload) => {
  method.hideLessonSocket(payload);
});

socket.on('set_selection_text', (offset) => {
  method.getSelectionTextRoot(offset);
});