import { Cloudinary as CoreCloudinary, Util } from "cloudinary-core";

export const url = (publicId, options) => {
  try {
    const scOptions = Util.withSnakeCaseKeys(options);
    const cl = CoreCloudinary.new();
    return cl.url(publicId, scOptions);
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const openUploadWidget = (options, callback) => {
  if (!window.cloudinary) {
    console.error("Cloudinary widget script not loaded.");
    return { open: () => {} };
  }
  return window.cloudinary.openUploadWidget(options, callback);
};
