// tests/routes/user.routes.test.js
const router = require('../../routes/user.routes');
const auth   = require('../../middleware/auth/authMiddleware');
const imgMw  = require('../../middleware/imageUpload').validateProfileImage;
const {
  getProfile,
  updateProfile,
  changePassword,
  setBio,
} = require('../../controllers/user.controller');

function findRoute(path, method) {
  return router.stack
    .filter(layer => layer.route)
    .find(layer =>
      layer.route.path === path &&
      layer.route.methods[method]
    );
}

describe('User Routes wiring', () => {
  it('GET  /profile → auth → getProfile', () => {
    const layer = findRoute('/profile', 'get');
    expect(layer).toBeDefined();
    const handlers = layer.route.stack.map(l => l.handle);
    expect(handlers[0]).toBe(auth);
    expect(handlers[handlers.length - 1]).toBe(getProfile);
  });

  it('POST /update-profile → auth → … → updateProfile', () => {
    const layer = findRoute('/update-profile', 'post');
    expect(layer).toBeDefined();
    const handlers = layer.route.stack.map(l => l.handle);
    expect(handlers[0]).toBe(auth);
    expect(handlers[handlers.length - 1]).toBe(updateProfile);
    
    expect(handlers.some(fn => fn.name === imgMw().name)).toBe(true);
  });

  it('POST /change-password → auth → … → changePassword', () => {
    const layer = findRoute('/change-password', 'post');
    expect(layer).toBeDefined();
    const handlers = layer.route.stack.map(l => l.handle);
    expect(handlers[0]).toBe(auth);
    expect(handlers[handlers.length - 1]).toBe(changePassword);
  });

  it('POST /set-bio → auth → … → setBio', () => {
    const layer = findRoute('/set-bio', 'post');
    expect(layer).toBeDefined();
    const handlers = layer.route.stack.map(l => l.handle);
    expect(handlers[0]).toBe(auth);
    expect(handlers[handlers.length - 1]).toBe(setBio);
  });
});
