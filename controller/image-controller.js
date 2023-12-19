const BadRequestError = require("../lib/errors/badrequest-error");
const { succesResponse } = require("../lib/helpers/utility-functions");
const { validatePhotoUpload } = require("../lib/validation/image-validation");
const Images = require("../models/image");

//@Method: POST /photos/upload
//@Desc: upload a picture
//@Access: public
const uploadImage = async (req, res) => {
  const userId = req.user._id;

  const error = await validatePhotoUpload(req.body);
  if (error) {
    throw new BadRequestError(error);
  }

  // Assuming imageURL and description are received in the request body
  const { imageURL, description } = req.body;

  // Creating a new image instance
  const image = new Images({
    uploadedBy: userId,
    imageURL,
    description,
  });

  // Attempt to save the image
  await image.save();

  return succesResponse(res, "Image uploaded");
};

const viewImages = async (req, res) => {
  const images = await Images.find();

  return succesResponse(res, "Images", images);
};

module.exports.uploadImage = uploadImage;
module.exports.viewImages = viewImages;
