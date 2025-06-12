const { sendMailgenEmail,APP_NAME,APP_URL,LOGO_URL } = require('../mailer/mailer');

async function sendWelcomeEmail(user,token) {

 
const activationUrl = `${APP_URL}activate/${user._id}/${token}`;


  const body = {
    body: {
      name: user.name,
      intro: `
      <style>
       
        .email-logo { width:200px !important; height:150px !important;max-height:150px !important; }
      </style>
      <div style="text-align:center; margin-bottom:20px;">
        <img src="${LOGO_URL}" class="email-logo" />
      </div>
      Thanks for signing up!
    `,
   
      action: {
        instructions: 'Please verify your email:',
        button: {
          color: '#00a76f',
          text: 'Verify Email',
          link: `${activationUrl}`
        }
      },
      outro: 'If you didn’t sign up, just ignore this email.'
    }
  };

  await sendMailgenEmail(user.email,  `Welcome to ${APP_NAME}!`, body);
}
async function sendPasswordChangedEmail(user) {
  const body = {
    body: {
      name: user.name,
      intro: `
        <style>
          .email-logo {
            width: 200px !important;
            height: 150px !important;
            max-height: 150px !important;
          }
        </style>
        <div style="text-align:center; margin-bottom:20px;">
          <img src="${LOGO_URL}" class="email-logo" alt="${APP_NAME} logo" />
        </div>
        We wanted to let you know that your password was just changed.
      `,
      action: {
        instructions: 'If you did not make this change, reset your password immediately:',
        button: {
          color: '#e74c3c',
          text: 'Reset Password',
          link: `${APP_URL}forgot-password`
        }
      },
      outro: 'If you changed your password, you can safely ignore this email.'
    }
  };

  await sendMailgenEmail(
    user.email,
    `Your ${APP_NAME} Password Was Changed`,
    body
  );
}
async function sendForgotPasswordEmail(user,token) {
  const resetUrl = `${APP_URL}reset-password/${token}`;

  const body = {
    body: {
      name: user.name || 'there',
      intro: `
        <style>
          .email-logo { width:200px !important; height:150px !important; max-height:150px !important; }
        </style>
        <div style="text-align:center; margin-bottom:20px;">
          <img src="${LOGO_URL}" class="email-logo" />
        </div>
        You recently requested to reset your password.
      `,
      action: {
        instructions: 'Click the button below to reset it:',
        button: {
          color: '#dc3545',
          text: 'Reset Password',
          link: resetUrl
        }
      },
      outro: 'If you did not request a password reset, no further action is required.'
    }
  };

  await sendMailgenEmail(user.email, `${APP_NAME} - Password Reset Request`, body);
}
async function sendPasswordResetSuccessEmail(user) {
  const body = {
    body: {
      name: user.name || 'there',
      intro: `
        <style>
          .email-logo { width:200px !important; height:150px !important; max-height:150px !important; }
        </style>
        <div style="text-align:center; margin-bottom:20px;">
          <img src="${LOGO_URL}" class="email-logo" />
        </div>
        This is a confirmation that your password was successfully reset.
      `,
      outro: 'If you did not perform this action, please contact our support immediately.'
    }
  };

  await sendMailgenEmail(user.email, `${APP_NAME} - Password successfully reset`, body);
}


module.exports = { sendWelcomeEmail, sendPasswordChangedEmail, sendForgotPasswordEmail,sendPasswordResetSuccessEmail};
