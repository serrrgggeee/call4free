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
    return res; 
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
      const chapters = document.querySelectorAll('#lesson-wrapper p');
      for (let i = 0; i < chapters.length; i++) {

        chapters[i].addEventListener('mouseup', e => {
          const target = e.target;
          lesson_functions.setSelectionText(target);
        })
      }
    }
  },

  setSelectionText: (target) => {
    const offsets = lesson_functions.getSelectionTextOffset();
    socket.emit('setSelectionText', offsets);
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

  getSelectionTextRoot(offset, target=null) {
    const root = document.getElementById('articles');
    const rng = document.createRange();
    const start = root.getElementsByTagName('h2')[0].firstChild;
    const end_index = root.getElementsByTagName('p').length - 1;
    const end = root.getElementsByTagName('p')[0].firstChild;
    const sel = window.getSelection();
    rng.setStart(start, offset.start_offset);
    rng.setEnd(end, offset.end_offset);
    sel.removeAllRanges();
    sel.addRange(rng);

  },

  // getElementsByText(str, tag = 'a') {
  //   return Array.prototype.slice.call(document.getElementsByTagName(tag)).filter(el => el.textContent.trim() === str.trim());
  // },

  // let target = getElementsByText(text, 'h3')[0];
  // selectText(text, target) {
  //   var rng, sel;
  //   if (document.createRange) {
  //     rng = document.createRange();
  //     rng.selectNode(target)
  //     sel = window.getSelection();
  //     sel.removeAllRanges();
  //     sel.addRange(rng);
  //   } else {
  //     var rng = document.body.createTextRange();
  //     rng.moveToElementText(target);
  //     rng.select();
  //   }
  // },

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
