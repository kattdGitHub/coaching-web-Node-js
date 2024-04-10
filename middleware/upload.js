const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require(`dotenv`).config({ path: `process.env` });
const CLOUD_NAME = process.env.CLOUD_NAME;
const CLOUD_API_KEY = process.env.CLOUD_API_KEY;
const CLOUD_SECRET = process.env.CLOUD_SECRET;
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "DEV",
    resource_type: 'auto'
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 50 },
});
module.exports = {upload}