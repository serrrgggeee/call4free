const fs = require('fs');

const INFO = 'info';
const WARNING = 'warning';
const ERROR = 'error';

module.exports = {
  getKeyByValue(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return [array[i], i];
        }
    }
    return [];
  },

  writeLogger(file, data, logging=false, trace=null) {
    if(logging) {
      const date = new Date().toLocaleString();
      const stack = trace?trace:new Error().stack
      fs.writeFile(file, date + "\n" +'trace: ' + JSON.stringify(stack) + "\n" + JSON.stringify(data) + "\n", { flag: 'a+' }, (err) => {
         if (err) throw err;
     });

    }
  },
  INFO, WARNING, ERROR
}