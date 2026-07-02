import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import TextInput from "../components/shared/TextInput";
import Select from "../components/shared/Select";
import CoverImageField from "../components/shared/CoverImageField";
import Spinner from "../components/shared/Spinner";
import EmptyState from "../components/shared/EmptyState";
import { getAllSongs } from "../api/songs";
import { createAlbum } from "../api/albums";
import { useToast } from "../context/ToastContext";
import { artistName, onImgError } from "../utils/format";

const KINDS = [
  { value: "singer", label: "Singer" },
  { value: "band", label: "Band" },
  { value: "group", label: "Group" },
  { value: "movie", label: "Movie" },
];

const CreateAlbum = () => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [kind, setKind] = useState("singer");
  const [thumbnail, setThumbnail] = useState("");
  const [year, setYear] = useState("");
  const [allSongs, setAllSongs] = useState([]);
  const [selected, setSelected] = useState([]); // song ids
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    getAllSongs()
      .then((r) => setAllSongs(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleSong = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allSongs;
    return allSongs.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        artistName(s.artist).toLowerCase().includes(q)
    );
  }, [allSongs, query]);

  const submit = async () => {
    if (!title.trim() || !artist.trim() || !thumbnail.trim()) {
      toast.error("Add a title, the singer/band/group/movie name, and a cover.");
      return;
    }
    setSaving(true);
    try {
      const album = await createAlbum({
        title: title.trim(),
        artist: artist.trim(),
        kind,
        thumbnail: thumbnail.trim(),
        year: year ? Number(year) : undefined,
        songs: selected,
      });
      toast.success("Album created!");
      navigate(`/album/${album._id}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-6 max-w-3xl">
      <h1 className="text-3xl font-extrabold text-white mb-6">Create an album</h1>

      <div className="space-y-5 bg-ink-850 border border-ink-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <TextInput
            label="Album title"
            placeholder="e.g. Greatest Hits"
            value={title}
            onChange={setTitle}
          />
          <TextInput
            label="Singer / band / group / movie"
            placeholder="Who is it by?"
            value={artist}
            onChange={setArtist}
          />
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <div className="text-sm font-semibold text-white mb-2">Type</div>
            <Select
              value={kind}
              onChange={setKind}
              options={KINDS}
              ariaLabel="Album type"
            />
          </div>
          <div className="w-32">
            <TextInput
              label="Year"
              type="number"
              placeholder="2024"
              value={year}
              onChange={setYear}
            />
          </div>
        </div>

        <CoverImageField
          label="Cover image"
          value={thumbnail}
          onChange={setThumbnail}
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-white">
              Songs{" "}
              <span className="font-normal text-ink-500">
                ({selected.length} selected)
              </span>
            </div>
          </div>
          <div className="relative mb-3">
            <Icon
              icon="mdi:magnify"
              width={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs to add"
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-ink-800 border border-ink-700 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-brand"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size={28} />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="mdi:music-note-off"
              title="No songs found"
              subtitle="Upload songs first, or try a different search."
            />
          ) : (
            <div className="max-h-80 overflow-auto space-y-1 pr-1">
              {filtered.map((s) => {
                const active = selected.includes(s._id);
                return (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => toggleSong(s._id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition border ${
                      active
                        ? "border-brand bg-brand/10"
                        : "border-transparent hover:bg-ink-700"
                    }`}
                  >
                    <img
                      src={s.thumbnail}
                      onError={onImgError}
                      alt=""
                      className="h-10 w-10 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-white truncate">{s.name}</div>
                      <div className="text-xs text-ink-500 truncate">
                        {artistName(s.artist)}
                      </div>
                    </div>
                    <Icon
                      icon={active ? "mdi:check-circle" : "mdi:plus-circle-outline"}
                      width={20}
                      className={active ? "text-brand" : "text-ink-500"}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={submit}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-black font-bold px-8 py-3 rounded-full transition disabled:opacity-60"
        >
          {saving ? <Spinner size={20} className="text-black" /> : "Create album"}
        </button>
      </div>
    </div>
  );
};

export default CreateAlbum;
