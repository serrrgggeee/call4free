let functions = {
  /**
   * @param {Date} today The date
 */
  getDate: (today) => {
    return `${today.getDate()}`.padStart(2, "0")+'.'+(`${today.getMonth() + 1}`.padStart(2, "0"))+'.'+today.getFullYear();
  },
  getDateTime: () => {
    return new Date().toLocaleString();
  }
};

addMethods(method, functions);

