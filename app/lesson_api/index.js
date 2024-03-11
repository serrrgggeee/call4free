const { DOMAIN } = require('../config');
const { fetch } = require("../helpers/fetch");


const self = module.exports = {  
    getLesson: async(id) => {
      const url = `${DOMAIN}/lessons/lesson/${id}/`;
      return fetch(url);
    },

}
