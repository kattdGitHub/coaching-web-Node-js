const nodemailer = require("nodemailer");
// const postmark = require("postmark");
let fs = require("fs");
let ejs = require("ejs");
// let file = require("../view/Email-Templetes/")6bc0ebc8-0c63-4b92-b5f0-a93c5c9c0090
const client = nodemailer.createTransport({
  host: 'smtp-relay.sendinblue.com',
  port: 587,
  secure: false, // false for TLS - as a boolean not string
  auth: {
      user: "murarikumar788999@gmail.com", // your Sendinblue SMTP username
      pass: "CLFgN6Vs0InkQAv1", // your Sendinblue SMTP password
  },
});
exports.sendEmail = async (
    email_address,
    subject,
    fileName,
    replacements = []
  ) => {
    email_address = email_address.trim();
    if (!email_address) {
      throw new Error("No recipients defined");
  }
    try {
      fileName = "./views/" + fileName + ".ejs";
      let templateFile = fs.readFileSync(fileName).toString();
      var template = ejs.compile(templateFile);
      var htmlToSend = template(replacements);
      const message = {
        from: "accounts@trillboards.com",
        to: email_address,
        subject: subject,
        html: htmlToSend,
      };
      let emailSent = await client.sendMail(message);
      console.log("Email sent successfully:", emailSent);
    } catch (err) {
      console.error("Error sending email:", err.message);
      throw new Error("Something went wrong!");
    }
  };