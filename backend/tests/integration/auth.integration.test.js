// tests/integration/auth.integration.test.js
//end-to-end tests via Supertest against your Express app
const express    = require('express');
const request    = require('supertest');
const bodyParser = require('body-parser');

jest.mock('../../models/user', () => ({
  findOne: jest.fn(),
  create:  jest.fn(),
}));
jest.mock('../../services/mailService', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(),
}));

const User       = require('../../models/user');
const authRoutes = require('../../routes/auth.routes');

const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

describe('POST /api/auth/register', () => {
  afterEach(() => jest.resetAllMocks());

  it('registers a new user and returns 201', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: '12345', save: jest.fn().mockResolvedValue(true) });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name:     'Test User',
        email:    'test@example.com',
        username: 'longusername',    
        password: 'P@ssw0rd!',
        accepted: true              
      });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      message: 'User registered successfully',
      userId:  '12345'
    });
  });
});
