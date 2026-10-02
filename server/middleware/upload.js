const multer = require("multer");

// Images are held in memory only long enough to base64-encode and send to
// Claude — nothing is written to disk, and only the diagnosis is persisted.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

module.exports = upload;
