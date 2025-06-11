// tests/controllers/authController.test.js
//unit-tests for  controller file
jest.mock('crypto', () => {
    const actual = jest.requireActual('crypto');
    return {
      ...actual,
      randomBytes: () => Buffer.alloc(20),
    };
  });
  jest.mock('nodemailer', () => ({
    createTransport: () => ({
      verify:   () => Promise.resolve(),
      sendMail: jest.fn().mockResolvedValue({}),
    }),
  }));
  jest.mock('../../models/user', () => ({
    findOne:  jest.fn(),
    findById: jest.fn(),
    create:   jest.fn(),
  }));
  jest.mock('../../services/mailService', () => ({
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
  }));
  jest.mock('bcrypt');
  
  const httpMocks = require('node-mocks-http');
  const { createUser, activateUser, resendActivation, loginUser, logoutUser } = require('../../controllers/auth.controller');
  const User               = require('../../models/user');
  
  function mockResponse() {
    const res = httpMocks.createResponse();
    res.status      = jest.fn().mockReturnValue(res);
    res.json        = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    res.cookie      = jest.fn().mockReturnValue(res);
    return res;
  }
  
  describe('Auth Controller (unit)', () => {
    beforeEach(() => jest.resetAllMocks());
  
    describe('createUser (error paths only)', () => {
      it('returns 400 if email registered', async () => {
        const req = httpMocks.createRequest({ body: { email: 'a@b.com' } });
        const res = mockResponse();
        User.findOne.mockResolvedValueOnce({});
        await createUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Email is already registered' });
      });
  
      it('returns 400 if username taken', async () => {
        const req = httpMocks.createRequest({ body: { email: 'a@b.com', username: 'user1' } });
        const res = mockResponse();
        User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({});
        await createUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Username is already taken' });
      });
  
      it('handles unexpected errors with 500', async () => {
        const req = httpMocks.createRequest({ body: {} });
        const res = mockResponse();
        User.findOne.mockRejectedValue(new Error('DB down'));
        await createUser(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          error: expect.stringContaining('Something went wrong')
        }));
      });
    });
  
    describe('activateUser', () => {
      it('404 if no user', async () => {
        const req = httpMocks.createRequest({ params: { userId: 'x', token: 't' } });
        const res = mockResponse();
        User.findById.mockResolvedValue(null);
        await activateUser(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
      });
  
      it('400 if invalid token', async () => {
        const user = { isVerified: false, resetToken: 'bad', resetTokenExpires: Date.now() - 1 };
        const req = httpMocks.createRequest({ params: { userId: 'x', token: 't' } });
        const res = mockResponse();
        User.findById.mockResolvedValue(user);
        await activateUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
      });
    });
  
    describe('resendActivation (error paths only)', () => {
      it('404 if no user', async () => {
        const req = httpMocks.createRequest({ body: { email: 'a@b.com' } });
        const res = mockResponse();
        User.findOne.mockResolvedValue(null);
        await resendActivation(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
      });
  
      it('400 if already verified', async () => {
        const req = httpMocks.createRequest({ body: { email: 'a@b.com' } });
        const res = mockResponse();
        User.findOne.mockResolvedValue({ isVerified: true });
        await resendActivation(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
      });
  
      it('handles unexpected errors with 500', async () => {
        const req = httpMocks.createRequest({ body: { email: 'a@b.com' } });
        const res = mockResponse();
        User.findOne.mockRejectedValue(new Error('DB down'));
        await resendActivation(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  
    describe('loginUser', () => {
      it('400 if no user', async () => {
        const req = httpMocks.createRequest({ body: { email: 'x', password: 'pw' } });
        const res = mockResponse();
        User.findOne.mockResolvedValue(null);
        await loginUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
      });
  
      it('400 if wrong pass', async () => {
        const req = httpMocks.createRequest({ body: { email: 'x', password: 'pw' } });
        const res = mockResponse();
        User.findOne.mockResolvedValue({ password: 'h', isVerified: true });
        const bcrypt = require('bcrypt');
        bcrypt.compare.mockResolvedValue(false);
        await loginUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
      });
    });
  
    describe('logoutUser', () => {
      it('200 on logout', () => {
        const req = httpMocks.createRequest();
        const res = mockResponse();
        logoutUser(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
      });
    });
  });
  