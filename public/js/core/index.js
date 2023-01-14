function addMethods(method, functions) {
  try {
    Object.assign(method, functions);
  }catch(ex){
    addMethods(method, functions)
  }
}

function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function htmlToElements(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.childNodes;
}


