let functions = {
  /**
   * @param {Date} today The date
 */
  getDate: (today) => {
    return `${today.getDate()}`.padStart(2, "0")+'.'+(`${today.getMonth() + 1}`.padStart(2, "0"))+'.'+today.getFullYear();
  },
  getDateTime: () => {
    return new Date().toLocaleString();
  },
  formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

};

addMethods(method, functions);

