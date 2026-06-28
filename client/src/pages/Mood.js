import { useState } from "react";
import { Icon } from "@iconify/react";
import MoodDetector from "../components/mood/MoodDetector";
import MoodPicker from "../components/mood/MoodPicker";
import { getPlaylistByEmotion } from "../api/playlists";
import { usePlayer } from "../context/PlayerContext";
import { useToast } from "../context/ToastContext";
import SongRow from "../components/cards/SongRow";
import Spinner from "../components/shared/Spinner";
import { onImgError } from "../utils/format";

const LABELS = {
  happy: "Happy",
  sad: "Sad",
  angry: "Angry",
  neutral: "Neutral",
  surprise: "Surprised",
  fear: "Anxious",
  disgust: "Unsettled",
};

const Mood = () => {
  const [tab, setTab] = useState("camera");
  const [emotion, setEmotion] = useState(null);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);
  const { playQueue } = usePlayer();
  const toast = useToast();

  const handleEmotion = async (em) => {
    setEmotion(em);
    setLoading(true);
    setPlaylist(null);
    try {
      const pl = await getPlaylistByEmotion(em);
      setPlaylist(pl);
    } catch (e) {
      toast.error(e.message || "No playlist for that mood yet.");
    } finally {
      setLoading(false);
    }
  };

  const playAll = () => {
    if (playlist?.songs?.length) playQueue(playlist.songs, 0);
  };

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setTab(id)}
      className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
        tab === id ? "bg-brand text-black" : "text-ink-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="pt-6">
      <h1 className="text-3xl font-extrabold text-white mb-1">
        How are you feeling?
      </h1>
      <p className="text-ink-400 mb-6">We'll match a playlist to your mood.</p>

      <div className="inline-flex bg-ink-800 rounded-full p-1 mb-6">
        <TabButton id="camera" label="Camera scan" />
        <TabButton id="manual" label="Pick manually" />
      </div>

      <div className="max-w-xl">
        {tab === "camera" ? (
          <MoodDetector onDetected={handleEmotion} />
        ) : (
          <MoodPicker onPick={handleEmotion} />
        )}
      </div>

      {emotion && (
        <div className="mt-10">
          {loading ? (
            <div className="flex items-center gap-3 text-ink-300">
              <Spinner /> Finding the perfect playlist…
            </div>
          ) : playlist ? (
            <div>
              <div className="flex items-center gap-4 mb-5">
                <img
                  src={playlist.thumbnail}
                  onError={onImgError}
                  alt=""
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div>
                  <div className="text-brand text-sm font-semibold">
                    Your mood looks {LABELS[emotion] || emotion}
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {playlist.name}
                  </div>
                  <button
                    onClick={playAll}
                    className="mt-2 inline-flex items-center gap-2 bg-brand text-black font-bold px-4 py-2 rounded-full text-sm"
                  >
                    <Icon icon="mdi:play" width={18} /> Play all
                  </button>
                </div>
              </div>
              <div className="space-y-1 max-w-2xl">
                {(playlist.songs || []).map((s, i) => (
                  <SongRow
                    key={s._id}
                    song={s}
                    index={i}
                    onPlay={() => playQueue(playlist.songs, i)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Mood;
