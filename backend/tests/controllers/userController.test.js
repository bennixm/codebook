// tests/controllers/userController.test.js
//unit-tests for  controller file
jest.mock('bcrypt');
jest.mock('../../models/user', () => ({ findById: jest.fn() }));
jest.mock('../../services/mailService', () => ({
  sendPasswordChangedEmail: jest.fn().mockResolvedValue(undefined),
}));

const bcrypt       = require('bcrypt');
const httpMocks    = require('node-mocks-http');
const User         = require('../../models/user');
const { sendPasswordChangedEmail } = require('../../services/mailService');
const {
  getProfile,
  changePassword,
  setBio
} = require('../../controllers/user.controller');

function mockResponse() {
  const res = httpMocks.createResponse();
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

describe('User Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getProfile', () => {
    it('404 if not found', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
      const req = httpMocks.createRequest({ user: { id: 'u1' } });
      const res = mockResponse();
      await getProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('200 with user data', async () => {
      const data = { _id: 'u1', name: 'Alice' };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(data)
      });
      const req = httpMocks.createRequest({ user: { id: 'u1' } });
      const res = mockResponse();
      await getProfile(req, res);
      expect(res.json).toHaveBeenCalledWith(data);
    });

    it('500 on exception', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('db error'))
      });
      const req = httpMocks.createRequest({ user: { id: 'u1' } });
      const res = mockResponse();
      await getProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error: db error' });
    });
  });

  describe('changePassword', () => {
    it('404 if no user', async () => {
      User.findById.mockResolvedValue(null);
      const req = httpMocks.createRequest({
        user: { id: 'u1' },
        body: { oldPassword: 'a', newPassword: 'b' }
      });
      const res = mockResponse();
      await changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('401 if old password incorrect', async () => {
      User.findById.mockResolvedValue({ password: 'hash' });
      bcrypt.compare.mockResolvedValue(false);
      const req = httpMocks.createRequest({
        user: { id: 'u1' },
        body: { oldPassword: 'a', newPassword: 'b' }
      });
      const res = mockResponse();
      await changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Current password is incorrect' });
    });

    it('400 if new password same', async () => {
      User.findById.mockResolvedValue({ password: 'hash' });
      bcrypt.compare.mockResolvedValueOnce(true).mockResolvedValueOnce(true);
      const req = httpMocks.createRequest({
        user: { id: 'u1' },
        body: { oldPassword: 'a', newPassword: 'a' }
      });
      const res = mockResponse();
      await changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Your new password must be different from your current one.'
      });
    });

    it('200 on success', async () => {
      const user = { password: 'hash', save: jest.fn().mockResolvedValue(true) };
      User.findById.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
      const req = httpMocks.createRequest({
        user: { id: 'u1' },
        body: { oldPassword: 'a', newPassword: 'b' }
      });
      const res = mockResponse();
      await changePassword(req, res);
      expect(user.password).toBe('b');
      expect(user.save).toHaveBeenCalled();
      expect(sendPasswordChangedEmail).toHaveBeenCalledWith(user);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password updated successfully'
      });
    });

    it('500 on exception', async () => {
      User.findById.mockRejectedValue(new Error('oops'));
      const req = httpMocks.createRequest({
        user: { id: 'u1' },
        body: { oldPassword: 'a', newPassword: 'b' }
      });
      const res = mockResponse();
      await changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong: oops' });
    });
  });

  describe('setBio', () => {
    it('404 if user not found', async () => {
      User.findById.mockResolvedValue(null);
      const req = httpMocks.createRequest({
        user: { id: 'u1' },
        body: { bio: 'hi' }
      });
      const res = mockResponse();
      await setBio(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('200 on success', async () => {
      const user = { save: jest.fn().mockResolvedValue(true) };
      User.findById.mockResolvedValue(user);
      const req = httpMocks.createRequest({
        user: { id: 'u1' },
        body: { bio: 'hello' }
      });
      const res = mockResponse();
      await setBio(req, res);
      expect(user.bio).toBe('hello');
      expect(user.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, user });
    });

    it('500 on exception', async () => {
      User.findById.mockRejectedValue(new Error('fail'));
      const req = httpMocks.createRequest({
        user: { id: 'u1' },
        body: { bio: 'x' }
      });
      const res = mockResponse();
      await setBio(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update bio' });
    });
  });
});
