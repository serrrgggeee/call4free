function addMethods(method, functions) {
  try {
    Object.assign(method, functions);
  }catch(ex){
    console.log(ex);
    addMethods(method, functions)
  }
}