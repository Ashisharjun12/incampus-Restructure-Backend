import multer from "multer";
import path from "path";
import multerS3 from "multer-s3";
import { s3Client } from "./s3.js";
import { _config } from "../config/config.js";
import crypto from "crypto";
import logger from "./logger.js";

// Keep the existing disk storage for other uploads like college logo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// The original multer for disk storage (keep this for backward compatibility)
export const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow all files but log warnings for non-images
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      console.warn(`Unexpected file type: ${file.mimetype}`);
      cb(null, true); // Still allow the file
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// New multer-s3 storage configuration for direct S3 uploads
const s3Storage = multerS3({
  s3: s3Client,
  bucket: _config.AWS_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: function (req, file, cb) {
    cb(null, { 
      fieldName: file.fieldname,
      mimetype: file.mimetype // Store mimetype in metadata for future reference
    });
  },
  key: function (req, file, cb) {
    // Generate folder based on media type
    let folder = 'other/'; // Default folder for miscellaneous files
    
    if (file.mimetype.startsWith('image/')) {
      folder = 'images/';
    } else if (file.mimetype.startsWith('video/')) {
      folder = 'videos/';
    } else if (file.mimetype.startsWith('audio/')) {
      folder = 'audio/';
    } else if (file.mimetype.includes('pdf')) {
      folder = 'documents/';
    }
    
    // Generate unique filename with original extension
    const originalExt = path.extname(file.originalname);
    const ext = originalExt || getDefaultExtension(file.mimetype);
    
    const filename = `${folder}${crypto.randomUUID()}${ext}`;
    
    logger.info(`Uploading file to S3: ${filename} (${file.mimetype})`);
    cb(null, filename);
  }
});

// Helper function to determine default extension based on mimetype
function getDefaultExtension(mimetype) {
  const mimeToExt = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'audio/ogg': '.ogg',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt'
  };
  
  return mimeToExt[mimetype] || '.bin'; // Default to .bin for unknown types
}

// Export multerS3 upload middleware with support for all file types
export const s3Upload = multer({
  storage: s3Storage,
  fileFilter: (req, file, cb) => {
    // Accept all file types
    logger.info(`Processing file upload of type: ${file.mimetype}`);
    cb(null, true);
  },
  limits: {
    fileSize: 25 * 1024 * 1024 // Increased to 25MB to handle larger files
  }
});


//multer s3
