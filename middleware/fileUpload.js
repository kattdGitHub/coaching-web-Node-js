const multer = require('multer');

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/videos'); // Define the destination directory for uploaded videos
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Define the filename for the uploaded video
  }
});

const upload = multer({ storage: storage });

module.exports = upload;