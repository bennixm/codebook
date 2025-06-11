// tests/middlewares/authValidators.test.js
const httpMocks = require('node-mocks-http');

// 1) Mock express-validator BEFORE requiring your validators module:
jest.mock('express-validator', () => {
  // a fake "chainable" body() builder
  const chain = {
    notEmpty()    { return this },
    isEmail()     { return this },
    isLength()    { return this },
    matches()     { return this },
    custom()      { return this },
    withMessage() { return this }
  };
  return {
    body:             () => chain,
    validationResult: jest.fn()
  };
});

const { validationResult } = require('express-validator');
const { validateUser }     = require('../../middleware/validators/authValidators');

describe('validateUser middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req  = httpMocks.createRequest();
    res  = httpMocks.createResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    next       = jest.fn();
    jest.clearAllMocks();
  });

  it('calls next() when there are no validation errors', () => {
    validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });

    validateUser(req, res, next);

    expect(validationResult).toHaveBeenCalledWith(req);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('returns 400 and error array when validationResult reports errors', () => {
    const fakeErrors = [{ msg: 'Email is required', param: 'email' }];
    validationResult.mockReturnValue({ isEmpty: () => false, array: () => fakeErrors });

    validateUser(req, res, next);

    expect(validationResult).toHaveBeenCalledWith(req);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: fakeErrors });
    expect(next).not.toHaveBeenCalled();
  });
});
