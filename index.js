// Convert synchronous function to callback-last function
const asyncify = (f) => {
  if (typeof f !== 'function') throw new Error('f must be a function');

  return (...args) => {
    const callback = args.pop();

    if (typeof callback !== 'function') {
      throw new Error('Callback is required!');
    }

    try {
      const result = f(...args);
      callback(null, result);
    } catch (e) {
      callback(e);
    }
  }
}

// Convert callback-last function to Promise-returning
const promisify = (f) => {
  if (typeof f !== 'function') throw new Error('f must be a function');

  return (...args) => {
    const wrappyArgsNumberWithoutCallback = f.length - 1;
    if (args.length !== wrappyArgsNumberWithoutCallback) {
      throw new Error('Wrong number of arguments');
    }

    return new Promise((res, rej) => {
      const callBack = (err, data) => {
        if (err) {
          return rej(err);
        }
        return res(data);
      };

      return f(...args, callBack);
    });
  }
}

module.exports = {asyncify, promisify};