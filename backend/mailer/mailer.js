const nodemailer = require('nodemailer');
const Mailgen    = require('mailgen');
require('dotenv').config();

const APP_NAME = process.env.PRODUCT_NAME || 'MyApp';
const APP_URL  = process.env.PRODUCT_URL  || 'https://yourapp.com/';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify()
  .then(() => console.log('✅ SMTP transporter is ready'))
  .catch(err => console.error('❌ SMTP transporter failed to verify:', err));

const mailGenerator = new Mailgen({
  theme: 'cerberus',
  product: {
    name: APP_NAME,
    link: APP_URL,
    logo: process.env.PRODUCT_LOGO || `${APP_URL}/logo.png`,
  },
});

async function sendMailgenEmail(to, subject, body) {
    try {
      const html = mailGenerator.generate(body);
      const text = mailGenerator.generatePlaintext(body);
      const info = await transporter.sendMail({
        from:    process.env.SMTP_FROM,
        to,
        subject,
        html,
        text,
      });
      console.log('📧 Email sent:', info);
      return info;
    } catch (err) {
      console.error('❌ sendMailgenEmail error:', err);
      throw err;
    }
  }
  

module.exports = {
  sendMailgenEmail,
  APP_NAME,
  APP_URL,
};
