const http = require('http')
const curl = new (require( 'curl-request' ))();
 

var self = module.exports = {
  getLesson: (id) => {
    return curl.setHeaders([
        'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
    ])
    .get(`http://127.0.0.1:9091/lessons/lesson/${id}/`)
    .catch((e) => {
        console.log(e);
    });

  }
}