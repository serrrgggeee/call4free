module.exports = {
  getKeyByValue(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return [array[i], i];
        }
    }
    return null;
  }
}