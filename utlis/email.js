const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { text } = require('express');
dotenv.config({ path: './../config.env' });
const sendEmail=async(options) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailoptions = {
    from: 'mohakiem@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transport.sendMail(mailoptions);
};
module.exports = sendEmail;

