const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define the upload path
const uploadPath = path.join(__dirname, "..", "uploads");

// Ensure the upload directory exists, If not exist, create.
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true }); // recursive in case parent folders are missing
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // use the resolved path
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// File filter to allow only specific image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(
    "Error: File upload only supports the following filetypes - jpeg, jpg, png, gif"
  );
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 2 }, // 2MB max
  fileFilter: fileFilter,
});

module.exports = upload;
