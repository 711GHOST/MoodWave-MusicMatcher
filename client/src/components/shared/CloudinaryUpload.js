import { openUploadWidget } from "../../utils/CloudinaryService";
import {
  cloudinary_upload_preset,
  cloudinary_cloud_name,
} from "../../config_cloud";

// Reusable Cloudinary upload button. Defaults to the audio-track preset; pass
// `uploadPreset` + `options` (e.g. resourceType/clientAllowedFormats) to upload
// images or other media instead.
const CloudinaryUpload = ({
  setUrl,
  setName,
  label = "Select file",
  uploadPreset,
  options = {},
  className,
}) => {
  const uploadWidget = () => {
    const widget = openUploadWidget(
      {
        cloudName: cloudinary_cloud_name,
        uploadPreset: uploadPreset || cloudinary_upload_preset,
        sources: ["local"],
        ...options,
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setUrl(result.info.secure_url);
          if (setName) setName(result.info.original_filename);
        } else if (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
    );
    widget.open();
  };

  return (
    <button
      type="button"
      className={
        className ||
        "bg-ink-700 hover:bg-ink-600 text-white rounded-full px-5 py-3 font-semibold transition"
      }
      onClick={uploadWidget}
    >
      {label}
    </button>
  );
};

export default CloudinaryUpload;
