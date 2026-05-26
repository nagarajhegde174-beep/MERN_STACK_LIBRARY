const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "library_books",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "avif"],
    public_id: (req, file) => {
      const fileName = file.originalname.split(".")[0];
      return `${Date.now()}-${fileName}`;
    },
  },
});

const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };
