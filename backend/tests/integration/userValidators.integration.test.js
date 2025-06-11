// tests/middlewares/userValidators.integration.test.js
const express = require('express');
const request = require('supertest');

const {
  validateProfile,
  validatePasswordChange,
  validateBio
} = require('../../middleware/validators/userValidators');

function buildApp(mw) {
  const app = express();
  // parse JSON bodies
  app.use(express.json());
  // mount the validator chain, then a dummy handler
  app.post('/test', mw, (req, res) => res.json({ ok: true }));
  return app;
}

describe('validateProfile (POST /test)', () => {
  const app = buildApp(validateProfile);

  it('rejects missing name', async () => {
    const res = await request(app)
      .post('/test')
      .send({}); // no name
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Name is required' });
  });

  it('rejects bio >500 chars', async () => {
    const res = await request(app)
      .post('/test')
      .send({ name: 'Alice', bio: 'x'.repeat(501) });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Bio must be less than 500 characters' });
  });

  it('accepts valid payload', async () => {
    const res = await request(app)
      .post('/test')
      .send({ name: 'Bob', bio: 'Hello!' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('validatePasswordChange (POST /test)', () => {
  const app = buildApp(validatePasswordChange);

  it('rejects missing oldPassword', async () => {
    const res = await request(app)
      .post('/test')
      .send({ newPassword: 'abcdef', confirmPassword: 'abcdef' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Current password is required' });
  });

  it('rejects short newPassword', async () => {
    const res = await request(app)
      .post('/test')
      .send({ oldPassword: 'old', newPassword: '123', confirmPassword: '123' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'New password must be at least 6 characters long' });
  });

  it('rejects mismatched confirmPassword', async () => {
    const res = await request(app)
      .post('/test')
      .send({ oldPassword: 'old', newPassword: 'abcdef', confirmPassword: 'ghijkl' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Passwords do not match' });
  });

  it('accepts correct payload', async () => {
    const res = await request(app)
      .post('/test')
      .send({ oldPassword: 'old', newPassword: 'abcdef', confirmPassword: 'abcdef' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('validateBio (POST /test)', () => {
  const app = buildApp(validateBio);

  it('rejects bio >200 chars', async () => {
    const res = await request(app)
      .post('/test')
      .send({ bio: 'x'.repeat(201) });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Bio must be less than 200 characters' });
  });

  it('accepts missing bio', async () => {
    const res = await request(app)
      .post('/test')
      .send({}); // no bio
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
