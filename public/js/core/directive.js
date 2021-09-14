document.addEventListener('click', e => {
  const target = e.target;
  const str = target.getAttribute('m-click');
  try {
    let res = str.split("(");
    const m = res[0];
    let args = [];
    if(res[1]) {
      args = res[1].split(")")[0].split(",");
    }
    method[m](e, args);
  } catch(e) {}
});

document.addEventListener('change', e => {
  const target = e.target;
  const m = target.getAttribute('m-change');
  try {
    method[m](e);
  } catch(e) {}
});

document.addEventListener('keyup', e => {
  if (e.keyCode === 13) {
    e.preventDefault();
    const target = e.target;
    const m = target.getAttribute('m-keyup');
    if(m) {
      try {
        method[m](e);
      } catch(e) {}      
    }

  }
});
