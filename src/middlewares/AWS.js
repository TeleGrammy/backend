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
    let folder = "";
    if (file.fieldname === "picture") {
      folder = "userProfilesPictures";
    } else if (file.fieldname === "story") {
      folder = "stories";
    }
    const fileName = `media/${folder}/${Date.now().toString()}-${file.originalname}`;
    cb(null, fileName);
  },
  contentDisposition: "inline", // Ensure files are displayed in the browser
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (
      !file.originalname.match(/\.(jpg|jpeg|png|gif|bmp|webp|mp4|avi|mov)$/i)
    ) {
      return cb(new Error("Invalid file format"), false);
    }
    cb(null, true);
  },
});
exports.uploadUserPicture = upload.single("picture");
exports.uploadStory = upload.single("story");

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

  const url = await getSignedUrl(s3, command, {
    expiresIn: expireTime || 3600, // Default to 1 hour if no expireTime is provided
  });

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
