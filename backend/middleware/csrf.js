const csurf = require('csurf');

const csrfProtection = csurf({
  cookie: {
    httpOnly: false,
    sameSite: 'lax',
    secure: false,
  }
});

module.exports = csrfProtection;
