const yup = require("yup");

async function validatePhotoUpload(data) {
  const schema = yup.object().shape({
    imageURL: yup.string().required("Provide image").label("Photo"),
  });
  try {
    const validateScema = await schema.validate(data);
    return null;
  } catch (error) {
    return error?.errors[0];
  }
}

module.exports.validatePhotoUpload = validatePhotoUpload;
