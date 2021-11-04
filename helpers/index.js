const fs = require('fs');

module.exports = {
  getKeyByValue(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return [array[i], i];
        }
    }
    return [];
  },

  writeFile(file, data) {
    const date = new Date().toLocaleString();
    fs.writeFile(file, date + ' ----- ' + JSON.stringify(data) + '\n', { flag: 'a+' }, (err) => {
       if (err) throw err;
   });
  }
}