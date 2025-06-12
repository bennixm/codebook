jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto');
  return {
    ...actual,
    randomBytes: () => Buffer.alloc(20),
  };
});
jest.mock('nodemailer', () => ({
  createTransport: () => ({
    verify: () => Promise.resolve(),
    sendMail: jest.fn().mockResolvedValue({}),
  }),
}));
jest.mock('../../models/user', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../../services/mailService', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('bcrypt');

const httpMocks = require('node-mocks-http');
const {
  createUser, activateUser, resendActivation, loginUser, logoutUser,
  forgotPassword, resetPassword
} = require('../../controllers/auth.controller');
const User = require('../../models/user');
const { sendPasswordResetEmail } = require('../../services/mailService');

function mockResponse() {
  const res = httpMocks.createResponse();
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
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

  describe('forgotPassword', () => {
    it('404 if user not found', async () => {
      User.findOne.mockResolvedValue(null);
      const req = httpMocks.createRequest({ body: { email: 'no@exist.com' } });
      const res = mockResponse();
      await forgotPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('sends reset email if user exists', async () => {
      const user = { _id: 'u1', email: 'a@b.com', save: jest.fn().mockResolvedValue(true) };
      User.findOne.mockResolvedValue(user);
      const req = httpMocks.createRequest({ body: { email: user.email } });
      const res = mockResponse();
      await forgotPassword(req, res);
      expect(user.save).toHaveBeenCalled();
      expect(sendPasswordResetEmail).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Reset email sent' });
    });

    it('handles error', async () => {
      User.findOne.mockRejectedValue(new Error('fail'));
      const req = httpMocks.createRequest({ body: { email: 'fail@b.com' } });
      const res = mockResponse();
      await forgotPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong: fail' });
    });
  });

  describe('resetPassword', () => {
    it('404 if no user', async () => {
      User.findById.mockResolvedValue(null);
      const req = httpMocks.createRequest({ params: { id: 'u1', token: 'token' }, body: { password: 'newpw' } });
      const res = mockResponse();
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('400 if token is invalid or expired', async () => {
      const user = {
        passwordResetToken: 'wrong',
        passwordResetExpiresAt: new Date(Date.now() - 1000),
      };
      User.findById.mockResolvedValue(user);
      const req = httpMocks.createRequest({ params: { id: 'u1', token: 'token' }, body: { password: 'newpw' } });
      const res = mockResponse();
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token is invalid or has expired' });
    });

    it('resets password if token is valid', async () => {
      const bcrypt = require('bcrypt');
      const user = {
        passwordResetToken: 'token',
        passwordResetExpiresAt: new Date(Date.now() + 1000),
        save: jest.fn().mockResolvedValue(true),
      };
      User.findById.mockResolvedValue(user);
      const req = httpMocks.createRequest({ params: { id: 'u1', token: 'token' }, body: { password: 'pw' } });
      const res = mockResponse();
      await resetPassword(req, res);
      expect(user.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Password has been reset' });
    });

    it('handles error', async () => {
      User.findById.mockRejectedValue(new Error('err'));
      const req = httpMocks.createRequest({ params: { id: 'u1', token: 'token' }, body: { password: 'pw' } });
      const res = mockResponse();
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong: err' });
    });
  });
});
