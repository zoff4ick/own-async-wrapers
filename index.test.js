const {expect} = require('chai');

const {asyncify} = require('./index');

describe('Async wrappers for switching function\' contract', () => {
  describe('asyncify', () => {
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
});
