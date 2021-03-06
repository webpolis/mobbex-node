function paramsCheck(param) {
  if (typeof param !== 'string') {
    if (typeof param === 'undefined') {
      throw new TypeError('Missing argument')
    }
    throw new TypeError('Wrong type argument. ' + param + ' must be string, is ' + typeof param)
  }
}

module.exports = paramsCheck
