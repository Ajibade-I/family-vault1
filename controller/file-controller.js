const BadRequestError = require("../lib/errors/badrequest-error");
const NotFoundError = require("../lib/errors/not-found-error");
const { succesResponse } = require("../lib/helpers/utility-functions");
const File = require("../models/file");
const fs = require("fs");

//@Method: POST file/upload
//@Access: private
//@Desc: to upload files

const uploadFile = async (req, res) => {
  const userId = req.user._id;

  const files = req.files; // Access array of uploaded files

  if (!files || files.length === 0) {
    throw new BadRequestError("No files uploaded.");
  }
  const filePromises = files.map(async (file) => {
    const { originalname, mimetype, size, path } = file;

    // Create a new File instance
    const newFile = new File({
      uploadedBy: userId,
      filename: originalname,
      fileType: mimetype.split("/")[0],
      fileSize: size,
      filePath: path,
    });

    await newFile.save();
  });
  await Promise.all(filePromises);

  return succesResponse(res, "file uploaded succesfully!");
};

//@Method: GET file/
//@Access: private
//@Desc: to view uploaded files

const viewMyfiles = async (req, res) => {
  const userId = req.user._id;
  const name = req.query.name;
  const type = req.query.type;
  const page = req.query.page;

  //create query object
  const query = { uploadedBy: userId };

  if (name) {
    query.filename = { $regex: new RegExp(name, "i") }; // Case-insensitive search for filename
  }
  if (type) {
    query.fileType = { $regex: new RegExp(type, "i") }; // Ensure case-insensitive search for fileType
  }

  const files = await File.find(query);
  if (files.length == 0) {
    throw new NotFoundError("You have not uploaded any files");
  }

  return succesResponse(res, "Your files", files);
};

//@Method: GET download/:fileId
//@Access: private
//@Desc: to download files
const downloadFile = async (req, res) => {
  const fileId = req.params.fileId;
  const userId = req.user._id;

  const file = await File.findById({ _id: fileId, uploadedBy: userId });
  if (!file) {
    throw new NotFoundError("File not found");
  }

  // Serve the file for download
  res.download(file.filePath, file.filename);
};

//@Method: POST edit/:fileId
//@Access: private
//@Desc: to edit files
const updateFile = async (req, res) => {
  const userId = req.user._id;
  const params = req.params.fileId;

  const { filename } = req.body;

  const file = await File.findOne({ uploadedBy: userId, _id: params });
  if (!file) {
    throw new NotFoundError("File not found");
  }

  file.filename = filename;

  await file.save();

  if (filename && file.filePath) {
    const newPath = `uploads/${filename}`;

    // Rename the file
    fs.renameSync(file.filePath, newPath);

    // Update the filePath property in the database
    file.filePath = newPath;

    await file.save();
  }

  return succesResponse(res, "file edited succesfully");
};

//@Method: DELETE delete/:fileId
//@Access: private
//@Desc: to delete files
const deleteFile = async (req, res) => {
  const userId = req.user._id;
  const params = req.params.fileId;

  const file = await File.findOneAndDelete({ _id: params, uploadedBy: userId });
  if (!file) {
    throw new BadRequestError("File not found");
  }

  fs.unlink(file.filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
      throw new InternalServerError("Failed to delete file");
    }
  });

  return succesResponse(res, "File deleted successfully!");
};

module.exports = {
  uploadFile,
  viewMyfiles,
  deleteFile,
  updateFile,
  downloadFile,
};
