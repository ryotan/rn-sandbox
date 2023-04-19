import {handleError, setHandleError} from './handleError';

describe('handleError', () => {
  it('should output stacktrace to error log if error is instanceof Error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('error');
    handleError(error);
    expect(spy).toHaveBeenCalledWith(error.stack);
  });

  it('should output stringified error to error log if error is not instanceof Error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const error = undefined;
    handleError(error);
    expect(spy).toHaveBeenCalledWith(String(error));
  });
});

const original = handleError;
describe('setHandleError', () => {
  afterEach(() => {
    setHandleError(original);
  });
  it('should change handleError implementation', () => {
    const spy = jest.fn();
    const error = new Error('error');
    handleError(error);
    expect(spy).not.toHaveBeenCalled();
    setHandleError(spy);
    handleError(error);
    expect(spy).toHaveBeenCalledWith(error);
  });
});
