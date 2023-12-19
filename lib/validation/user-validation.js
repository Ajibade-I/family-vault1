const yup = require("yup");

async function validateSignup(data) {
  const schema = yup.object().shape({
    name: yup
      .string()
      .min(2)
      .max(50)
      .required("First name is required")
      .label("First name"),
    email: yup
      .string()
      .email("Provide a valid email")
      .required("Email is required")
      .label("Email"),
    password: yup
      .string()
      .min(10)
      .max(20)
      .required("Password is required")
      .label("password"),
  });
  try {
    const validationData = await schema.validate(data);
    return null;
  } catch (error) {
    return error?.errors[0];
  }
}

async function validateLogin(data) {
  const schema = yup.object().shape({
    nameOrEmail: yup
      .string()
      .min(2)
      .max(50)
      .required("Name or email is required")
      .label("name or email"),

    password: yup
      .string()
      .min(10)
      .max(20)
      .required("Password is required")
      .label("password"),
  });
  try {
    const validationData = await schema.validate(data);
    return null;
  } catch (error) {
    return error?.errors[0];
  }
}

module.exports.validateSignup = validateSignup;
module.exports.validateLogin = validateLogin;
