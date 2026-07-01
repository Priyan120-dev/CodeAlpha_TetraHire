const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { BadRequestError } = require('../utils/customError');

// Ensure upload directories exist at start
const resumeDir = path.resolve(__dirname, '../uploads/resumes');
const logoDir = path.resolve(__dirname, '../uploads/logos');

if (!fs.existsSync(resumeDir)) {
  fs.mkdirSync(resumeDir, { recursive: true });
}
if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
}

// Custom storage engine setting up dynamic destinations
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      cb(null, resumeDir);
    } else if (file.fieldname === 'logo') {
      cb(null, logoDir);
    } else {
      cb(new BadRequestError('Unsupported upload field name.'), null);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique file names to prevent overwrite collisions on disk
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter restricting types
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new BadRequestError('Invalid file type: Resumes must be PDF files only.'), false);
    }
  } else if (file.fieldname === 'logo') {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Invalid file type: Logos must be JPG, JPEG, PNG, or WEBP images only.'), false);
    }
  } else {
    cb(new BadRequestError('Unsupported field upload.'), false);
  }
};

// Exports individual configuration instances
const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
}).single('resume');

const uploadLogo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max 2MB
}).single('logo');

module.exports = {
  uploadResume,
  uploadLogo,
};
