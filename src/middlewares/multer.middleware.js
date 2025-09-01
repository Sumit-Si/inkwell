import multer from "multer";
import path from "path";

// Configure storage for different upload types
const createStorage = (uploadType) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      let uploadPath;

      switch (uploadType) {
        case "post":
          uploadPath = "./public/uploads/posts";
          break;
        case "userProfile":
          uploadPath = "./public/uploads/userProfiles";
          break;
        default:
          uploadPath = "./public/temp";
      }

      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uploadType}_${uniqueSuffix}${fileExtension}`;

      cb(null, fileName);
    },
  });
};

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Create multer instances for different upload types
export const uploadPostImage = multer({
  storage: createStorage("post"),
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const uploadUserProfile = multer({
  storage: createStorage("userProfile"),
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
});

// General upload for temporary storage
export const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileName = `temp_${uniqueSuffix}_${file.originalname}`;
      cb(null, fileName);
    },
  }),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
