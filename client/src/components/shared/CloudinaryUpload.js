import { openUploadWidget } from "../../utils/CloudinaryService";
import {
  cloudinary_upload_preset,
  cloudinary_cloud_name,
} from "../../config_cloud";

const CloudinaryUpload = ({ setUrl, setName }) => {
  const uploadWidget = () => {
    const widget = openUploadWidget(
      {
        cloudName: cloudinary_cloud_name,
        uploadPreset: cloudinary_upload_preset,
        sources: ["local"],
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setUrl(result.info.secure_url);
          setName(result.info.original_filename);
        } else if (error) {
          console.error(error);
        }
      }
    );
    widget.open();
  };

  return (
    <button
      type="button"
      className="bg-ink-700 hover:bg-ink-600 text-white rounded-full px-5 py-3 font-semibold transition"
      onClick={uploadWidget}
    >
      Select track file
    </button>
  );
};

export default CloudinaryUpload;
