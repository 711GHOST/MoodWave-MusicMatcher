import { Icon } from "@iconify/react";
import TextInput from "./TextInput";
import CloudinaryUpload from "./CloudinaryUpload";
import { onImgError } from "../../utils/format";
import { cloudinary_image_preset } from "../../config_cloud";

// Cover-image picker: Cloudinary upload widget + URL paste fallback + a live
// preview thumbnail. Used for song covers and playlist covers.
const CoverImageField = ({ label = "Cover image", value, onChange }) => (
  <div>
    <div className="text-sm font-semibold text-white mb-2">{label}</div>
    <div className="flex items-start gap-4">
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-ink-800 border border-ink-700 flex items-center justify-center shrink-0">
        {value ? (
          <img
            src={value}
            onError={onImgError}
            alt="cover preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon icon="mdi:image-outline" width={28} className="text-ink-600" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <CloudinaryUpload
          setUrl={onChange}
          label="Upload image"
          uploadPreset={cloudinary_image_preset}
          className="bg-ink-700 hover:bg-ink-600 text-white rounded-full px-5 py-2.5 text-sm font-semibold transition"
          options={{
            resourceType: "image",
            clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "gif"],
            maxImageFileSize: 5000000,
            cropping: false,
          }}
        />
        <div className="text-xs text-ink-500">…or paste an image URL:</div>
        <TextInput
          placeholder="https://example.com/cover.jpg"
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  </div>
);

export default CoverImageField;
