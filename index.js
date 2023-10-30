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

const promisifySync = (f) => {
  if (typeof f !== 'function') throw new Error('f must be a function');

  return (...args) => {
    try {
      const result = f(...args);
      if (result instanceof Error) return Promise.reject(result);

      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

const callbackify = (f) => {
  if (typeof f !== 'function') throw new Error('f must be a function');

  return (...args) => {
    const wrappyArgsNumberWithCallback = f.length + 1;
    if (args.length !== wrappyArgsNumberWithCallback) {
      throw new Error('Wrong number of arguments');
    }

    const callback = args.pop();
    if (typeof callback !== 'function') {
      throw new Error('Callback is required!');
    }

    f(...args)
      .then(res => callback(null, res))
      .catch(err => callback(err));
  }
}

const expirify = (f, timeout) => {
  if (!f || !timeout) {
    throw new Error('Both arguments are required!');
  }

  if (typeof f !== 'function') {
    throw new Error('f must be a function');
  }

  if (typeof timeout !== 'number') {
    throw new Error('timeout must be type number');
  }

  let targetFunction = f;

  setTimeout(() => targetFunction = null, timeout);

  return (...args) => {
    if (typeof targetFunction === 'function') {
      return targetFunction(...args);
    }
  }
}

const cancelable = (f) => {
  if (typeof f !== 'function') {
    throw new Error('f must be a function');
  }

  let targetFunction = f;
  let canceled = null;

  const functionToReturn = (...args) => {
    if (typeof targetFunction === 'function') {
      return targetFunction(...args);
    }
  };

  functionToReturn.cancel = () => {
    targetFunction = null;
    canceled = true;
  }

  return functionToReturn;
}

const once = (f) => {
  if (typeof f !== 'function') {
    throw new Error('f must be a function');
  }

  let targetFunction = f;

  return (...args) => {
    if (typeof targetFunction === 'function') {
      const targetFunctionCopy = targetFunction
      targetFunction = null;

      return targetFunctionCopy(...args);
    }
  };
}

module.exports = {asyncify, promisify, promisifySync, callbackify, expirify, cancelable, once};