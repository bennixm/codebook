// tests/routes/auth.routes.test.js
const express = require('express');
const router = require('../../routes/auth.routes');


const {
  validateUserRules,
  validateLoginRules,
  validateUser
} = require('../../middleware/validators/authValidators');

const {
  createUser,
  loginUser,
  logoutUser,
  activateUser,
  resendActivation
} = require('../../controllers/auth.controller');

describe('Auth Routes wiring', () => {
  
  function findRoute(path, method) {
    return router.stack
      .filter(layer => layer.route)
      .find(layer =>
        layer.route.path === path &&
        layer.route.methods[method]
      );
  }

  test('POST /register has validateUserRules + validateUser + createUser', () => {
    const layer = findRoute('/register', 'post');
    expect(layer).toBeDefined();
    const handles = layer.route.stack.map(l => l.handle);

   
    for (const fn of validateUserRules) {
      expect(handles).toContain(fn);
    }
    expect(handles).toContain(validateUser);
    expect(handles).toContain(createUser);
  });

  test('POST /login has validateLoginRules + loginUser', () => {
    const layer = findRoute('/login', 'post');
    expect(layer).toBeDefined();
    const handles = layer.route.stack.map(l => l.handle);

    for (const fn of validateLoginRules) {
      expect(handles).toContain(fn);
    }
    expect(handles).toContain(loginUser);
  });

  test('POST /logout has logoutUser', () => {
    const layer = findRoute('/logout', 'post');
    expect(layer).toBeDefined();
    const handles = layer.route.stack.map(l => l.handle);
    expect(handles).toContain(logoutUser);
  });

  test('GET /activate/:userId/:token has activateUser', () => {
    const layer = findRoute('/activate/:userId/:token', 'get');
    expect(layer).toBeDefined();
    const handles = layer.route.stack.map(l => l.handle);
    expect(handles).toContain(activateUser);
  });

  test('POST /resend-activation has resendActivation', () => {
    const layer = findRoute('/resend-activation', 'post');
    expect(layer).toBeDefined();
    const handles = layer.route.stack.map(l => l.handle);
    expect(handles).toContain(resendActivation);
  });
});
