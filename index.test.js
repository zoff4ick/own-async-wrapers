const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const {asyncify, promisify} = require('./index');

describe('Async wrappers for switching function\' contract', () => {
  describe('asyncify', () => {
    it('should make async function from sync if correct arguments were passed', () => {
      const syncFunction = (a, b) => a + b;
      const testArguments = [5, 7];

      const syncFunctionResult = syncFunction(...testArguments);

      const asyncSum = asyncify(syncFunction);

      asyncSum(...testArguments, (err, data) => {
        expect(data).to.equal(syncFunctionResult);
        expect(err).to.equal(null);
      });
    });

    it('should throw error if argument provided to asyncify is not a function', () => {
      expect(asyncify.bind(null, 5)).to.throw('f must be a function');
    });

    it('should throw an error if callback wasn\'t passed to specified function', () => {
      const syncFunction = (a, b) => a + b;
      const testArguments = [5, 7];

      const asyncSum = asyncify(syncFunction);

      expect(asyncSum.bind(null, ...testArguments)).to.throw('Callback is required!');
    });

    it('should receive an error in callback if it occurred in wrapped sync function', () => {
      const errorMessage = 'Error occurred during syncFunctionExecution'
      const syncFunctionWithError = () => {
        throw new Error(errorMessage);
      }

      const asyncSum = asyncify(syncFunctionWithError);

      asyncSum((err, data) => {
        expect(data).to.equal(undefined);
        expect(err).to.be.an('error');
        expect(err.message).to.equal(errorMessage);
      })
    });
  });

  describe('promisify', () => {
    const notANumberErrorMessage ='\'a\' and \'b\' must be numbers!';
    const getSumWithCallback = (a, b, callBack) => {
      try {
        if (typeof a !== 'number' || typeof b !== 'number') {
          throw new Error(notANumberErrorMessage);
        }

        const result = a + b;
        callBack(null, result);
      } catch (err) {
        callBack(err);
      }
    }

    it('should throw error if argument provided to promisify is not a function', () => {
      expect(promisify.bind(null, 5)).to.throw('f must be a function');
    });

    it('should throw error if wrong number of arguments was provided to promisified function', () => {
      const promisifiedFunc = promisify(getSumWithCallback);
      expect(promisifiedFunc.bind(null)).to.throw('Wrong number of arguments');
    });

    it('should make function that return promise from function that works with callback contract', () => {
      const sumPromisified = promisify(getSumWithCallback);
      const promise = sumPromisified('some arg 1', 'some arg 2');

      return expect(promise).to.be.a('promise');
    });

    it('should return fulfilled promise if executed without error', () => {
      const sumPromisified = promisify(getSumWithCallback);
      const promise = sumPromisified(5, 7);

      expect(promise).to.be.a('promise');
      return expect(promise).to.eventually.be.fulfilled.and.equal(12);
    });

    it('should return rejected promise with correct error-message if error occurred', () => {
      const sumPromisified = promisify(getSumWithCallback);
      const failedPromise = sumPromisified(5, {a: 15});
      
      return expect(failedPromise).to.eventually.be.rejectedWith(notANumberErrorMessage)
    });
  });
});
