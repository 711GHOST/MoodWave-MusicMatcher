import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/shared/Modal";
import TextInput from "../components/shared/TextInput";
import Spinner from "../components/shared/Spinner";
import { createPlaylist } from "../api/playlists";
import { useToast } from "../context/ToastContext";

const CreatePlaylistModal = ({ onClose }) => {
  const [name, setName] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a playlist name.");
      return;
    }
    setSaving(true);
    try {
      const playlist = await createPlaylist({
        name: name.trim(),
        thumbnail:
          thumbnail.trim() ||
          `https://picsum.photos/seed/${encodeURIComponent(name)}/300/300`,
      });
      toast.success("Playlist created!");
      onClose();
      navigate(`/playlist/${playlist._id}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Create playlist" onClose={onClose}>
      <div className="space-y-4">
        <TextInput
          label="Name"
          placeholder="My awesome playlist"
          value={name}
          onChange={setName}
        />
        <TextInput
          label="Cover image URL (optional)"
          placeholder="https://..."
          value={thumbnail}
          onChange={setThumbnail}
        />
        <button
          onClick={submit}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-black font-bold py-3 rounded-full transition disabled:opacity-60"
        >
          {saving ? <Spinner size={20} className="text-black" /> : "Create"}
        </button>
      </div>
    </Modal>
  );
};

export default CreatePlaylistModal;
