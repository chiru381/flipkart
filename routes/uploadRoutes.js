const express = require("express");
const cloudinary = require("cloudinary");
const streamifier = require("streamifier");
const multer = require("multer");
const isAuth = require("../utilsauth");
const isAdmin = require("../utilsadmin");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const { config } = require("../config");

const upload = multer();

const uploadRouter = express.Router();
const uploads3Router = express.Router();

uploadRouter.post(
  "/",
  isAuth,
  isAdmin,
  upload.single("file"),
  async (req, res) => {
    const streamUpload = (req) => {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET,
      });

      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };
    const result = await streamUpload(req);
    res.send(result);
  }
);

aws.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
});

const s3 = new aws.S3();
const storageS3 = multerS3({
  s3,
  bucket: "flipkart-bucket-one",
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key(req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploadS3 = multer({
  storage: storageS3,
});

uploads3Router.post("/s3", uploadS3.single("image"), (req, res) => {
  res.send(req.file.location);
});

module.exports = { uploadRouter, uploads3Router };
