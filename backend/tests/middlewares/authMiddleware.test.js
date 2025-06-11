// tests/middlewares/authMiddleware.test.js
const httpMocks = require('node-mocks-http');
const jwt       = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

const authMiddleware = require('../../middleware/auth/authMiddleware');

function mockResponse() {
  const res = httpMocks.createResponse();
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req  = httpMocks.createRequest();
    res  = mockResponse();
    next = jest.fn();
  });

  it('responds 401 when no token cookie is provided', () => {
    // req.cookies.token is undefined
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('responds 401 when jwt.verify throws', () => {
    req.cookies = { token: 'bad.token' };
    jwt.verify.mockImplementation(() => { throw new Error('fail'); });

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('bad.token', process.env.JWT_SECRET);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches decoded payload and calls next on valid token', () => {
    const payload = { id: 'user1', role: 'admin' };
    req.cookies = { token: 'good.token' };
    jwt.verify.mockReturnValue(payload);

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('good.token', process.env.JWT_SECRET);
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
