// Cloudinary unsigned-upload config. Verified working for image + audio uploads
// with the defaults below; override via client env vars for a different account.
export const cloudinary_cloud_name =
  process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "dcqnxmaoj";
export const cloudinary_upload_preset =
  process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || "upload_songs";
// Cover images reuse the same unsigned preset unless a dedicated one is set.
export const cloudinary_image_preset =
  process.env.REACT_APP_CLOUDINARY_IMAGE_PRESET || cloudinary_upload_preset;
