const http = require('http')
 

var self = module.exports = {
  getLesson: (id) => {
    const options = {
      hostname: 'http://127.0.0.1:8000',
      path: `/lessons/lesson/${id}/`,
      headers: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
      }
    }
  
    return http.get(options, (response) => {
        
    
    });

  }
}