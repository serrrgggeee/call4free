let lesson_functions = {
  lessons_id: [{pk: 1}, {pk: 2}, {pk: 3}, {pk: 4}, {pk: 5}],
  addLesson: lesson => {
    const res = `
        <h2 class="header" id="lesson_header" data-id="${lesson.pk}">${lesson.title}</h2>
        <div class="articles">${lesson_functions.articles(lesson.articles)}</div>
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
        <div class="text">${text}</div>
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
