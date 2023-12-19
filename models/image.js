const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageURL: { type: String, required: true },
    description: {
      type: String,
      maxlength: 50,
    },
  },
  { timestamp: true }
);

const Images = mongoose.model("Images", imageSchema);

module.exports = Images;
