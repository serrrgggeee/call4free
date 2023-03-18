function debounce(fn, delay, timeoutID) {
  return function () {
    clearTimeout(timeoutID.out)
    let args = arguments
    let that = this
    timeoutID.out = setTimeout( ()=> {
      fn.apply(that, args)
    }, delay)
  }
}
