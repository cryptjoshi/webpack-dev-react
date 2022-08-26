const isDebug = true
module.exports.ifDebug = (debugValue, defaultValue) => {
    if (typeof debugValue === 'undefined' && typeof defaultValue === 'undefined') {
        return isDebug
    }
    return isDebug ? debugValue : defaultValue;
  }

 // module.exports = ifDebug