const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"),
  filename: (req, file, cb) => cb(null, `image-${Date.now()}${path.extname(file.originalname)}`)
});

const isImage = (req, file, cb) => {
  file.mimetype.startsWith("image") ? cb(null, true) : cb(new Error("Only images allowed"));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: isImage
});

module.exports = upload;
