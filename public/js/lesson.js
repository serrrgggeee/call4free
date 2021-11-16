Object.assign(data, {

});

let lesson_functions = {
  addLesson: lesson => {
    const res = `
        <h2 class="header">${lesson.title}</h2>
        <div class="articles">${lesson_functions.articles(lesson.articles)}</div>
    `

    const lesson_node = document.createElement('div');
    lesson_node.innerHTML = res;
    lesson_node.classList.add('item');
    const lessons = document.getElementById("lessons-wrapper");
    lessons.innerHTML = "";
    lessons.append(lesson_node);
    return res; 
  },

  articles(lesson_articles) {
    let articles = "";
    for (const i in lesson_articles) {
      const title = lesson_articles[i].title;
      const text = lesson_articles[i].text;
      articles += `
        <h3 class="header">${title}</h3>
        <div class="text">${text}</div>
      `
    }
    return articles;
  },

};
addMethods(method, lesson_functions);

socket.on('send_lesson', (lesson) => {
  method.addLesson(lesson);
});
