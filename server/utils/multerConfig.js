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
    // Generate a more unique filename to avoid conflicts
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExtension);
    const uniqueName = `${baseName}-${uniqueSuffix}${fileExtension}`;
    cb(null, uniqueName);
  },
});

// File filter to allow only specific image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }

  // FIXED: Pass an Error object instead of a string
  cb(
    new Error(
      "File upload only supports the following filetypes - jpeg, jpg, png"
    )
  );
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 2 }, // 2MB max
  fileFilter: fileFilter,
});

module.exports = upload;
