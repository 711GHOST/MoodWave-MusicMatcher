import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import TextInput from "../components/shared/TextInput";
import CloudinaryUpload from "../components/shared/CloudinaryUpload";
import CoverImageField from "../components/shared/CoverImageField";
import Spinner from "../components/shared/Spinner";
import { createSong } from "../api/songs";
import { useToast } from "../context/ToastContext";
import { MOODS } from "../utils/moods";

const UploadSong = () => {
  const [name, setName] = useState("");
  const [artist, setArtist] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [trackUrl, setTrackUrl] = useState("");
  const [trackName, setTrackName] = useState("");
  const [moods, setMoods] = useState([]);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const toggleMood = (key) =>
    setMoods((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );

  const submit = async () => {
    if (!name.trim() || !artist.trim() || !thumbnail.trim() || !trackUrl.trim()) {
      toast.error("Add a song name, artist, cover image, and an audio track.");
      return;
    }
    setSaving(true);
    try {
      await createSong({
        name: name.trim(),
        // The performing artist is whoever sang it - entered here, not the
        // uploader's account name.
        artist: artist.trim(),
        thumbnail: thumbnail.trim(),
        track: trackUrl.trim(),
        moods,
      });
      toast.success(
        moods.length
          ? "Song uploaded and added to your tagged mood playlists!"
          : "Song uploaded!"
      );
      navigate("/my-music");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-6 max-w-2xl">
      <h1 className="text-3xl font-extrabold text-white mb-6">
        Upload your music
      </h1>

      <div className="space-y-5 bg-ink-850 border border-ink-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <TextInput
            label="Song name"
            placeholder="Track title"
            value={name}
            onChange={setName}
          />
          <TextInput
            label="Artist / singer"
            placeholder="Who performed this song?"
            value={artist}
            onChange={setArtist}
          />
        </div>

        <CoverImageField
          label="Cover image"
          value={thumbnail}
          onChange={setThumbnail}
        />

        <div>
          <div className="text-sm font-semibold text-white mb-2">
            Audio track
          </div>
          {trackUrl ? (
            <div className="flex items-center gap-2 text-brand text-sm">
              <Icon icon="mdi:check-circle" width={18} />
              {trackName || "Track ready"}
              <button
                onClick={() => {
                  setTrackUrl("");
                  setTrackName("");
                }}
                className="text-ink-500 hover:text-white ml-2"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <CloudinaryUpload setUrl={setTrackUrl} setName={setTrackName} />
              <div className="text-xs text-ink-500">
                …or paste a direct audio URL:
              </div>
              <TextInput
                placeholder="https://example.com/track.mp3"
                value={trackUrl}
                onChange={setTrackUrl}
              />
            </div>
          )}
        </div>

        <div>
          <div className="text-sm font-semibold text-white mb-1">
            Mood tags{" "}
            <span className="font-normal text-ink-500">
              (optional — auto-adds the song to each mood's playlist)
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {MOODS.map((m) => {
              const active = moods.includes(m.key);
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => toggleMood(m.key)}
                  aria-pressed={active}
                  className="px-3 py-1.5 rounded-full text-sm font-semibold border transition"
                  style={
                    active
                      ? {
                          backgroundColor: `${m.color}26`,
                          color: m.color,
                          borderColor: m.color,
                        }
                      : {}
                  }
                >
                  <span className={active ? "" : "text-ink-400"}>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={submit}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-black font-bold px-8 py-3 rounded-full transition disabled:opacity-60"
        >
          {saving ? <Spinner size={20} className="text-black" /> : "Submit song"}
        </button>
      </div>
    </div>
  );
};

export default UploadSong;
