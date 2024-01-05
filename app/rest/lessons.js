
var self = module.exports = {
  updateListLessons: (lesson, io) => {
    io.sockets.emit("update_lessons", lesson);
  },
};
