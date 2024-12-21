const {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");
const multer = require("multer");
const multerS3 = require("multer-s3");
const mime = require("mime-types");

require("dotenv").config();

// Configure AWS SDK v3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure multer storage with S3
const storage = multerS3({
  s3,
  bucket: process.env.AWS_BUCKET_NAME,
  metadata: (req, file, cb) => {
    cb(null, {fieldName: file.fieldname});
  },
  key: (req, file, cb) => {
    const fileName = `media/${file.fieldname}/${Date.now().toString()}-${file.originalname}`;
    cb(null, fileName);
  },
  contentDisposition: "inline", // Ensure files are displayed in the browser
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 100, // 100MB
  },
  fileFilter: (req, file, cb) => {
    if (
      !file.originalname.match(
        /\.(jpg|jpeg|png|gif|bmp|webp|webm|mp4|avi|mov|wav|mp3|ogg|pdf|doc|docx|odt|rtf|txt|pdf|xls|xlsx|ods|ppt|pptx|odp|html|htm|csv|zip)$/i
      )
    ) {
      cb(new Error("Invalid file format"), false);
      return;
    }
    cb(null, true);
  },
});
exports.uploadUserPicture = upload.single("picture");
exports.uploadStory = upload.single("story");
exports.uploadAudio = upload.single("audio");
exports.uploadMedia = upload.single("media");
exports.uploadDocument = upload.single("document");
exports.uploadSticker = upload.single("sticker");

const getMimeType = (key) => {
  return mime.lookup(key) || "application/octet-stream";
};

exports.generateSignedUrl = async (key, expireTime = null) => {
  const contentType = getMimeType(key);
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: "inline",
    ResponseContentType: contentType,
  });

  // Options object for getSignedUrl
  const options = {
    expiresIn: expireTime || 7 * 24 * 60 * 60,
  };
  const url = await getSignedUrl(s3, command, options);

  return url;
};

const isFileAvailable = async (key) => {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch (err) {
    return false;
  }
};

exports.deleteFile = async (key) => {
  if (!isFileAvailable(key)) {
    return;
  }
  const deleteParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };
  await s3.send(new DeleteObjectCommand(deleteParams));
};

// Utility function to get a file from S3 with a signed URL
exports.getFileFromS3 = async (key, expireTime = null) => {
  const check = await isFileAvailable(key);
  if (!check) {
    const err = new Error("File not found");
    err.statusCode = 404;
    throw err;
  }
  const contentType = getMimeType(key);
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: "inline",
    ResponseContentType: contentType,
  });
  const url = await getSignedUrl(s3, command, {
    expiresIn: expireTime || 3600, // Default to 1 hour if no expireTime is provided
  });
  return url;
};
