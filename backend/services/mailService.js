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
async function sendGoogleWelcomeEmail(user) {
  
  const dashboardLink = `${APP_URL}panel/dashboard`;

  const body = {
    body: {
      name: user.name,
      intro: `
        <style>
          .email-logo { width:200px !important; height:150px !important;max-height:150px !important; }
        </style>
        <div style="text-align:center; margin-bottom:20px;">
          <img src="${LOGO_URL}" class="email-logo" alt="${APP_NAME} logo" />
        </div>
        Thanks for signing up with Google! You’re all set—just click below to dive in.
      `,
      action: {
        instructions: 'Go to your dashboard:',
        button: {
          color: '#00a76f',
          text: 'Start Exploring',
          link: dashboardLink
        }
      },
      outro: `If you ever need help, just reply to this email. Welcome aboard!`
    }
  };

  await sendMailgenEmail(
    user.email,
    `Welcome to ${APP_NAME}!`,
    body
  );
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
async function sendBlogCreatedEmail(user, blog) {
  const isDraft = blog.isPublished === false;
  const subject = isDraft
    ? `Your ${APP_NAME} Draft "${blog.title}" Has Been Saved`
    : `Your ${APP_NAME} Post "${blog.title}" Is Live`;

  const coverHtml = blog.coverImage
    ? `<div style="text-align:center; margin:20px 0;">
         <img src="${blog.coverImage}" alt="Cover Image for ${blog.title}" style="width:100%; max-width:600px; border-radius:8px;" />
       </div>`
    : '';

  const introMessage = isDraft
    ? 'Your draft has been saved. You can publish it anytime from your dashboard.'
    : 'Great news — your new blog post has just been published!';

  const body = {
    body: {
      name: user.name,
      intro: `<style>
                .email-logo {
                  width: 200px !important;
                  height: 150px !important;
                  max-height: 150px !important;
                }
              </style>
              <div style="text-align:center; margin-bottom:20px;">
                <img src="${LOGO_URL}" class="email-logo" alt="${APP_NAME} logo" />
              </div>
              ${coverHtml}
              <p>${introMessage}</p>`,
      table: {
        data: [
          { label: 'Title', value: blog.title },
          { label: 'Excerpt', value: blog.excerpt || '(no excerpt provided)' },
          { label: isDraft ? 'Saved At' : 'Published At', value: (blog.publishedAt || new Date()).toLocaleString() }
        ]
      },
      action: {
        instructions: isDraft ? 'Edit your draft now:' : 'View your post now:',
        button: {
          color: '#3498db',
          text: isDraft ? 'Edit your draft' : 'Read Post',
          link: `${APP_URL}blogs/${blog.slug}`
        }
      },
      outro: isDraft
        ? 'Keep up the great work—publish when you’re ready!'
        : 'Thanks for sharing your story with the community. We can’t wait to see the reactions!'
    }
  };

  await sendMailgenEmail(user.email, subject, body);
}
async function sendPasswordSetConfirmationEmail(user) {
  const loginLink = `${APP_URL}auth`;

  const body = {
    body: {
      name: user.name,
      intro: `
        <style>
          .email-logo { width:200px !important; height:150px !important; }
        </style>
        <div style="text-align:center; margin-bottom:20px;">
          <img src="${LOGO_URL}" class="email-logo" alt="${APP_NAME} logo" />
        </div>
        Your password has been successfully set!
      `,
      action: {
        instructions: 'You can now log in using your email and new password:',
        button: {
          color: '#00a76f',
          text: 'Log In',
          link: loginLink
        }
      },
      outro: 'If you did not request this change, please contact our support immediately.'
    }
  };

  await sendMailgenEmail(
    user.email,
    `Your ${APP_NAME} password has been set`,
    body
  );
}



module.exports = { sendWelcomeEmail, sendPasswordChangedEmail, sendForgotPasswordEmail,sendPasswordResetSuccessEmail, sendBlogCreatedEmail,sendGoogleWelcomeEmail,sendPasswordSetConfirmationEmail };
