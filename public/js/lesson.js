var start_selection = null;
var start_selection_index = null;
var end_selection = null;
var end_selection_index = null;
var start_selection_started = false;

const rng = document.createRange();

let lesson_functions = {
  lessons_id: [{pk: 1}, {pk: 2}, {pk: 3}, {pk: 4}, {pk: 5}],
  addLesson: lesson => {
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

  hideLessonSocket: (open=false) => {
    let buttons = "";
    const lessonsWraper = document.getElementById("lessons-wrapper");
    lessonsWraper.style.display = lessonsWraper.style.display == "none" || open ? "grid": "none";
    if(!lesson_functions.lessons_id.length == 0) {
      lesson_functions.getUserLesons().then(res=>{
        const data = JSON.parse(res.response);
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
  getSelectionData: (selection, selection_index) => {
    if(!selection)return; //|| !selection.hasOwnProperty('localName')
    const localNames = ["h1", "h2", "h3", "p"];
    if(!localNames.includes(selection.localName)) return;
    const lis = [...document.querySelectorAll(`#articles ${selection.localName}`)];
    const index = lis.indexOf(selection);
    return selection = {
      'localName': selection.localName,
      'nodeType': selection.nodeType,
      'childElementCount': selection.childElementCount,
      index,
      selection_index
    };
  },

  setSelectionText: (target) => {
    const offsets = lesson_functions.getSelectionTextOffset();
    const payload = offsets;
    let lis = [...document.querySelectorAll(`#articles ${start_selection.localName}`)];
    const start_index = lis.indexOf(start_selection);

    payload.start_selection = lesson_functions.getSelectionData(start_selection, start_selection_index);
    payload.end_selection =  lesson_functions.getSelectionData(end_selection, end_selection_index);
    socket.emit('setSelectionText', payload);
  },

  getSelectionTextOffset() {
    const offset = {};
    if (window.getSelection) {
        const selection = window.getSelection();
        const text = selection.toString();
        const start_offset = selection.anchorOffset;
        const end_offset = selection.focusOffset;
        offset.start_offset = start_offset;
        offset.end_offset = end_offset;
    }
    return offset;
  },

  getSelectionTextRoot(payload, target=null) {
    const root = document.getElementById('articles');
    if(!payload.start_selection || !payload.end_selection) return;
    const sel = window.getSelection();

    const start = root.getElementsByTagName(
      payload.start_selection.localName)[payload.start_selection.index].childNodes.item(payload.start_selection.selection_index
    );

    const end = root.getElementsByTagName(
      payload.end_selection.localName)[payload.end_selection.index].childNodes.item(payload.end_selection.selection_index
    );

    if(!start || !end) return;
    rng.setStart(start, payload.start_offset);
    rng.setEnd(end, payload.end_offset);
    sel.removeAllRanges();
    sel.addRange(rng);

  },

  getUserLesons() {
    const auth_data = method.setAuthData();
    return fetch(
      'https://video.chat.vokt.ru/lessons/lessons_user/',
      {
        options: {method: 'get'},
        headers: {"Authorization": "Token " + auth_data.token},
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
      lessons.innerHTML = "";
      if(lesson_id != lesson.pk) {
        method.addLesson(lesson);
      }
    } else {
      lessons.innerHTML = "";
      method.addLesson(lesson);
    }
  },

  hideLesson(e){
    socket.emit('hideLesson');
  },
  getSelectionIndex(e, container) {
    const selObj = window.getSelection();
    const range = selObj.getRangeAt(0);
    if(!selObj.baseNode) return;
    for (const i in e.target.childNodes) {
      const element  = e.target.childNodes[i];
      if(element.nodeType && element.textContent == range[container].data) {

        switch(container) {
          case 'endContainer':
            end_selection_index = i;
            return;

          case 'startContainer':
            start_selection_started = false;
            start_selection_index = i;
            return;
        }
      }

    }
  },
  lessons_init() {
    const root = document.getElementById('articles');
    root.addEventListener("mousemove", e => {
      if(start_selection_started) {
        start_selection = e.target;
        lesson_functions.getSelectionIndex(e, 'startContainer');
      }
    });

    root.addEventListener('mousedown', e => {
      start_selection_started = true;
    });

    root.addEventListener('mouseup', e => {
      end_selection = e.target;
      lesson_functions.getSelectionIndex(e, 'endContainer');
      lesson_functions.setSelectionText(e.target);
    });

    root.addEventListener('touchend', e => {
      end_selection = e.target;
      lesson_functions.getSelectionIndex(e, 'endContainer');
      lesson_functions.setSelectionText(e.target);
    });
  }

};
addMethods(method, lesson_functions);

socket.on('send_lesson', (lesson) => {
  method.recieveLesson(lesson);
});

socket.on('hide_lesson', (open) => {
  method.hideLessonSocket(open);
});

socket.on('set_selection_text', (offset) => {
  method.getSelectionTextRoot(offset);
});

