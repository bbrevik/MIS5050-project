/* eslint-disable prefer-const */

const nodemailer = require('nodemailer');

// https://nodemailer.com/about/
/**
 TL;DR
In short, what you need to do to send messages, would be the following:

Create a Nodemailer transporter using either SMTP or some other transport mechanism
Set up message options (who sends what to whom)
Deliver the message object using the sendMail() method of your previously created transporter

examples on the site

https://mailtrap.io/how-it-works
 
  Mailtrap simulates the work of a real SMTP server. It isolates the staging emailing from production and eliminates any possibility of a test email to land in a real customer’s mailbox

 */
const sendEmailToUser = async (options) => {
  // we need to create a transporter
  let transporter = nodemailer.createTransport({
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Here we need to define the email
  let userMailOptions = {
    from: 'Bucket List Tours <bucketListTours@email.com>',
    to: options.email,
    subject: options.subject,
    content: options.message,
  };

  await transporter.sendEmailToUser(userMailOptions);
};

module.exports = sendEmailToUser;
