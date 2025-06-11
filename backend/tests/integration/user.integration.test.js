// tests/integration/user.integration.test.js
//end-to-end tests via Supertest against your Express app
jest.mock('../../models/user', () => ({
    findById: jest.fn(),
  }));
  jest.mock('../../firebase', () => ({
    storage: () => ({
      bucket: () => ({
        file: jest.fn().mockReturnValue({
          save:   jest.fn().mockResolvedValue(),
          delete: jest.fn().mockResolvedValue(),
        }),
        name: 'test-bucket',
      }),
    }),
  }));
  jest.mock('../../middleware/auth/authMiddleware', () => (req, res, next) => {
    req.user = { id: 'u1' };
    next();
  });
  jest.mock('../../middleware/imageUpload', () => ({
    validateProfileImage: () => (req, res, next) => next(),
  }));
  
  const express    = require('express');
  const request    = require('supertest');
  const bodyParser = require('body-parser');
  const User       = require('../../models/user');
  const userRoutes = require('../../routes/user.routes');
  
  const app = express();
  app.use(bodyParser.json());
  app.use(
    '/api/user',
    require('../../middleware/auth/authMiddleware'),
    // test-only middleware to inject fileBuffer/fileMeta
    (req, res, next) => {
      req.fileBuffer = Buffer.from('fake');
      req.fileMeta   = { ext: 'png', mime: 'image/png' };
      next();
    },
    require('../../middleware/imageUpload').validateProfileImage(),
    userRoutes
  );
  
  describe('POST /api/user/update-profile', () => {
    afterEach(() => jest.resetAllMocks());
  
    it('updates profile with avatar', async () => {
      const existing = { avatar: 'https://storage.googleapis.com/test-bucket/old.png' };
      const saved    = {
        ...existing,
        name: 'New Name',
        bio:  'New Bio',
        avatar: expect.stringMatching(/\/avatars\/u1\/avatar_\d+\.png$/)
      };
  
      User.findById.mockResolvedValue(existing);
      existing.save = jest.fn().mockResolvedValue(saved);
  
      const res = await request(app)
        .post('/api/user/update-profile')
        .send({ name: 'New Name', bio: 'New Bio' });
  
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, user: saved });
    });
  });
  