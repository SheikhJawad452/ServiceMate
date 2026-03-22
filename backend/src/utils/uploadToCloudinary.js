import { cloudinary, hasCloudinaryConfig } from "../config/cloudinary.js";
import { AppError } from "./AppError.js";

export const uploadImageBufferToCloudinary = async (buffer, folder = "servicemate/portfolio") => {
  if (!hasCloudinaryConfig) {
    throw new AppError("Cloudinary is not configured on server.", 500);
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) {
          reject(new AppError("Failed to upload image to Cloudinary.", 500));
          return;
        }
        resolve(result);
      },
    );

    stream.end(buffer);
  });
};
