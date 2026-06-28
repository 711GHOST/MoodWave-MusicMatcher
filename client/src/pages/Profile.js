import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getMyPlaylists } from "../api/playlists";
import { getMySongs } from "../api/songs";
import TextInput from "../components/shared/TextInput";
import Spinner from "../components/shared/Spinner";

const Stat = ({ label, value, icon }) => (
  <div className="bg-ink-800 rounded-xl p-5 flex items-center gap-4">
    <Icon icon={icon} width={28} className="text-brand" />
    <div>
      <div className="text-2xl font-extrabold text-white">{value}</div>
      <div className="text-xs text-ink-400">{label}</div>
    </div>
  </div>
);

const Row = ({ k, v }) => (
  <div className="flex justify-between border-b border-ink-800 pb-2">
    <dt className="text-ink-400">{k}</dt>
    <dd className="text-white font-medium">{v}</dd>
  </div>
);

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState({ playlists: 0, songs: 0 });
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getMyPlaylists(), getMySongs()])
      .then(([pl, sg]) =>
        setStats({ playlists: pl.data?.length || 0, songs: sg.data?.length || 0 })
      )
      .catch(() => {});
  }, []);

  const initials = (user?.firstName?.[0] || "U").toUpperCase();
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      })
    : "—";
  const likedCount = user?.likedSongs?.length || 0;

  const save = async () => {
    if (!firstName.trim()) {
      toast.error("First name can't be empty.");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
      toast.success("Profile updated.");
      setEditing(false);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8 rounded-2xl p-6 bg-gradient-to-br from-accent/40 to-ink-850">
        <div className="w-28 h-28 rounded-full bg-accent text-white text-4xl font-extrabold flex items-center justify-center shadow-xl">
          {initials}
        </div>
        <div className="text-center sm:text-left">
          <div className="text-xs font-semibold text-white/70 uppercase tracking-wide">
            Profile
          </div>
          <h1 className="text-4xl font-extrabold text-white flex items-center gap-3 justify-center sm:justify-start">
            {user?.firstName} {user?.lastName}
            {user?.isPremium && (
              <span className="text-xs bg-brand text-black font-bold px-2 py-0.5 rounded-full">
                PREMIUM
              </span>
            )}
          </h1>
          <div className="text-sm text-white/80 mt-1">
            @{user?.userName} · {user?.email}
          </div>
          <div className="text-xs text-white/60 mt-1">Member since {memberSince}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Stat label="Playlists" value={stats.playlists} icon="mdi:playlist-music" />
        <Stat label="Liked songs" value={likedCount} icon="mdi:heart" />
        <Stat label="Uploads" value={stats.songs} icon="mdi:cloud-upload" />
      </div>

      <div className="bg-ink-850 border border-ink-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Account details</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-brand font-semibold hover:underline"
            >
              Edit
            </button>
          )}
        </div>
        {editing ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <TextInput label="First name" value={firstName} onChange={setFirstName} />
              <TextInput label="Last name" value={lastName} onChange={setLastName} />
            </div>
            <div className="flex gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="bg-brand hover:bg-brand-light text-black font-bold px-6 py-2.5 rounded-full transition disabled:opacity-60 flex items-center gap-2"
              >
                {saving ? <Spinner size={18} className="text-black" /> : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFirstName(user.firstName);
                  setLastName(user.lastName);
                }}
                className="text-ink-400 hover:text-white px-4"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <dl className="space-y-3 text-sm">
            <Row k="Name" v={`${user?.firstName} ${user?.lastName}`} />
            <Row k="Username" v={`@${user?.userName}`} />
            <Row k="Email" v={user?.email} />
            <Row k="Plan" v={user?.isPremium ? "Premium" : "Free"} />
          </dl>
        )}
      </div>

      {!user?.isPremium && (
        <Link
          to="/premium"
          className="mt-6 block rounded-2xl p-6 bg-gradient-to-r from-brand/20 to-accent/20 border border-ink-800 hover:border-brand transition"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-white">Upgrade to Premium</div>
              <div className="text-sm text-ink-300">
                Ad-free, a profile badge, and support Moodwave.
              </div>
            </div>
            <Icon icon="mdi:crown" width={28} className="text-brand" />
          </div>
        </Link>
      )}
    </div>
  );
};

export default Profile;
