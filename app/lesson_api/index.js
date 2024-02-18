const {fetch} = require("../helpers/fetch");


const self = module.exports = {  
    getLesson: async(id) => {
      const url = `${process.env.DOMAIN}/lessons/lesson/${id}/`;
      return fetch(url);
    },

}
