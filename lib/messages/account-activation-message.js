const sendEmail = require("../helpers/sendMail");

const clientURL = process.env.CLIENT_URL;

async function sendAccountActivation({ email, name, token }) {
  const activationURL = `${clientURL}/user/activate-account?token=${token}`;
  const message = ` <div> 
    <h1>Hello ${name}!</h1>
    <p>
      Click the link to activate your account : 
      <a href="${activationURL}">Activate account</a>
    </p>
    <br>
    <br>
    <p>Family-Vault</p>
  </div>`;
  return sendEmail({
    to: email,
    subject: "Account activation",
    html: message,
  });
}
module.exports.sendAccountActivation = sendAccountActivation;
