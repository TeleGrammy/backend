const {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");
const multer = require("multer");
const multerS3 = require("multer-s3");
const mime = require("mime-types");
const AppError = require("../errors/appError");

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
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (
      !file.originalname.match(
        /\.(jpg|jpeg|png|gif|bmp|webp|mp4|avi|mov|wav|mp3)$/i
      )
    ) {
      return cb(new Error("Invalid file format"), false);
    }
    return cb(null, true);
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

async function generateSignedUrl(key, expireTime = 3600) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: "inline",
    ResponseContentType: "audio/wav",
  });

  return getSignedUrl(s3, command, {expiresIn: expireTime});
}

exports.uploadVoiceNote = async (file) => {
  try {
    // Assuming the file is sent as a multipart form-data request (via Socket.IO Binary)
    const buffer = Buffer.from(file.data);

    // Upload the audio file to S3
    const fileName = `${Date.now()}-${file.name}`;
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `voiceNotes/${fileName}`,
      Body: buffer,
      ContentType: mime.lookup(fileName) || "application/octet-stream", // Set the mime type
    };

    // Upload file to S3
    const uploadResponse = await s3.send(new PutObjectCommand(uploadParams));

    // Generate a signed URL for the uploaded file
    const signedUrl = await generateSignedUrl(`voiceNotes/${fileName}`);
    console.log("File uploaded successfully:", uploadResponse);

    // Emit the URL to the client so they can play the file
    return signedUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    return new AppError("Failed to upload audio file");
  }
};
