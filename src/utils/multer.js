import multer from "multer";
import path from "path";

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