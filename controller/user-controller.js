const BadRequestError = require("../lib/errors/badrequest-error");
const { succesResponse } = require("../lib/helpers/utility-functions");
const {
  sendAccountActivation,
} = require("../lib/messages/account-activation-message");
const { sendPasswordReset } = require("../lib/messages/password-reset-message");
const {
  validateSignup,
  validateLogin,
  validatePasswordReset,
} = require("../lib/validation/user-validation");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//@Method : POST user/signup
//@Desc : signup
//@Access : public

const signUp = async (req, res) => {
  const error = await validateSignup(req.body);
  if (error) {
    throw new BadRequestError(error);
  }

  const { name, email, password } = req.body;
  const nameExists = await User.findOne({ name: name });
  if (nameExists) {
    throw new BadRequestError("Name is already taken");
  }

  const emailExists = await User.findOne({ email: email });
  if (emailExists) {
    throw new BadRequestError("This email is already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    name,
    email,
    password: hashedPassword,
  });
  //create activation token
  const token = await bcrypt.hash(email.toString(), 10);
  const oneHour = 60 * 60 * 1000;

  user.AccountactivationToken = token;
  user.AccountTokenExpires = new Date(Date.now() + oneHour);

  await user.save();

  // send activation email
  await sendAccountActivation({ email, name, token });

  return succesResponse(
    res,
    "Click the link in your email to activate your account"
  );
};

//@Method : PUT user/activate-account
//@Desc : activate account
//@Access : private

const activateAccount = async (req, res) => {
  const user = await User.findOne({
    AccountactivationToken: req.query.token,
    AccountTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError("Link has expired,please request new link");
  }

  user.isActivated = true;
  user.AccountactivationToken = undefined;
  user.AccountTokenExpires = undefined;

  await user.save();

  return succesResponse(res, "Account activated");
};

//@Method : POST user/login
//@Desc : login
//@Access : private

const login = async (req, res) => {
  const error = await validateLogin(req.body);
  if (error) {
    throw new BadRequestError(error);
  }

  const { nameOrEmail, password } = req.body;

  const user = await User.findOne({
    $or: [{ name: nameOrEmail }, { email: nameOrEmail }],
  });

  if (!user) {
    throw new BadRequestError("Inavlid name/email or password");
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new BadRequestError("Inavlid name/email or password");
  }

  if (!user.isActivated) {
    throw new BadRequestError(
      "Account not activated ,click the link in your email to activate your account"
    );
  }

  const payload = {
    _id: user._id,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.PRIVATE_KEY);
  const oneDay = 24 * 60 * 60 * 1000;

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });

  return succesResponse(res, "Login succesfull");
};

//@Method : DELETE user/logout
//@Desc : logout
//@Access : private

const logout = async (req, res) => {
  res.cookie("accessToken", "Logout", {
    httpOnly: true,
    signed: true,
    expires: new Date(Date.now()),
  });
  return succesResponse(res, "logged out");
};

//@Method : PUT user/forgot-password
//@Desc : to get a password reset email
//@Access: private

const forgotPassword = async (req, res) => {
  let { email } = req.body;
  if (!email) {
    throw new BadRequestError("Invalid email");
  }

  //find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError("User does not exist");
  }

  //create password reset token
  const token = await bcrypt.hash(email.toString(), 10);
  const thirtyMinutes = 30 * 60 * 1000;

  //assign password reset token to user
  user.passwordResetToken = token;
  user.passwordResetExpired = new Date(Date.now() + thirtyMinutes);

  await user.save();

  //send password reset email
  await sendPasswordReset({ email, token });

  return succesResponse(res, "Check your email for password reset link");
};

//@Method: GET auth/reset-password
//@Desc: reset password when logged in
//@Access: Private

const changePassword = async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  const error = await validatePasswordReset(req.body);
  if (error) {
    throw new BadRequestError(error);
  }
  const { oldPassword, newPassword, repeatPassword } = req.body;

  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) {
    throw new BadRequestError("incorrect password");
  }
  if (newPassword !== repeatPassword) {
    throw new BadRequestError("Passwords do not match");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedpassword = await bcrypt.hash(newPassword, salt);
  user.password = hashedpassword;

  await user.save();

  return succesResponse(res, "Password changed succesfully");
};

module.exports.signUp = signUp;
module.exports.activateAccount = activateAccount;
module.exports.login = login;
module.exports.logout = logout;
module.exports.forgotPassword = forgotPassword;
module.exports.changePassword = changePassword;
