const {S3Client} = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
require("dotenv").config();

// Configure AWS SDK v3
const s3 = new S3Client({
  region: process.env.AWS_REGION,

  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Configure multer storage with S3
const storage = multerS3({
  s3,
  bucket: process.env.AWS_BUCKET_NAME,
  metadata: (req, file, cb) => {
    cb(null, {fieldName: file.fieldname});
  },
  key: (req, file, cb) => {
    const fileName = `media/${Date.now().toString()}-${file.originalname}`;
    cb(null, fileName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Invalid file format"), false);
    }
    cb(null, true);
  }
});

exports.uploadUserPicture = upload.single("picture");
