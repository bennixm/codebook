const { sendMailgenEmail,APP_NAME,APP_URL } = require('../mailer/mailer');

async function sendWelcomeEmail(user) {

  const body = {
    body: {
      name: user.name,
      intro: 'Thanks for signing up!',
      action: {
        instructions: 'Please verify your email:',
        button: {
          color: '#27ae60',
          text: 'Verify Email',
          link: `${APP_NAME}${user._id}`
        }
      },
      outro: 'If you didn’t sign up, just ignore this email.'
    }
  };

  await sendMailgenEmail(user.email,  `Welcome to ${APP_NAME}!`, body);
}

module.exports = { sendWelcomeEmail };
