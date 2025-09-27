import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: File) => {
    return {
      folder: "e-commerce-website",
      allowedFormats: ["png", "jpeg"],
    };
  },
});

const uploadCloud = multer({ storage, limits: { fileSize: 1 * 1024 * 1024 } });

export default uploadCloud;
