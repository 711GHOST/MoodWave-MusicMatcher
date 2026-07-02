// Sample data for local development. Audio uses royalty-free SoundHelix tracks
// plus a few real Cloudinary uploads carried over from the original project, so
// every seeded song is actually playable in the browser.
//
// `artist` is the performing artist/singer (a string). The built-in catalog is
// owned/uploaded by a system "Moodwave" account so it shows for every user on
// Home without belonging to any real person's library.

const cover = (seed) => `https://picsum.photos/seed/${seed}/300/300`;
const helix = (n) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

const users = [
  {
    key: "system",
    firstName: "Moodwave",
    lastName: "",
    email: "music@moodwave.app",
    userName: "moodwave",
    password: "S3ed!Moodwave#system",
  },
  {
    key: "demo",
    firstName: "Demo",
    lastName: "Listener",
    email: "demo@moodwave.app",
    userName: "demo",
    password: "Demo@1234",
  },
];

// Who uploads the catalog and owns the featured playlists.
const songUploader = "system";
const playlistOwner = "system";

const songs = [
  // Real tracks carried over from the original project.
  {
    name: "Bandeya Re Bandeya",
    artist: "Arijit Singh",
    thumbnail:
      "https://pagalnew.com/coverimages/Bandeya-Rey-Bandeya-Simmba-500-500.jpg",
    track:
      "https://res.cloudinary.com/dcqnxmaoj/video/upload/v1708956357/iogtikmu9gadalifecsw.mp3",
  },
  {
    name: "Satranga",
    artist: "Arijit Singh",
    thumbnail: "https://pagalnew.com/coverimages/satranga-animal-500-500.jpg",
    track:
      "https://res.cloudinary.com/dcqnxmaoj/video/upload/v1708956390/qfg2qboxt9p4a6amdjfa.mp3",
  },
  {
    name: "O Maahi",
    artist: "Arijit Singh",
    thumbnail: "https://pagalnew.com/coverimages/o-maahi-dunki-500-500.jpg",
    track:
      "https://res.cloudinary.com/dcqnxmaoj/video/upload/v1708956503/jyjj3yodwazqqf2ppawz.mp3",
  },
  // Royalty-free SoundHelix tracks with generated cover art + fictional artists.
  { name: "Sunshine Avenue", artist: "Sunny Days", thumbnail: cover("sunshine"), track: helix(1) },
  { name: "Golden Hour", artist: "Sunny Days", thumbnail: cover("goldenhour"), track: helix(2) },
  { name: "Confetti", artist: "Sunny Days", thumbnail: cover("confetti"), track: helix(3) },
  { name: "Rainy Window", artist: "Blue Hour", thumbnail: cover("rainywindow"), track: helix(4) },
  { name: "Letting Go", artist: "Blue Hour", thumbnail: cover("lettinggo"), track: helix(5) },
  { name: "Midnight Blue", artist: "Blue Hour", thumbnail: cover("midnightblue"), track: helix(6) },
  { name: "Adrenaline", artist: "Voltage", thumbnail: cover("adrenaline"), track: helix(7) },
  { name: "Breaking Point", artist: "Voltage", thumbnail: cover("breakingpoint"), track: helix(8) },
  { name: "Storm Chaser", artist: "Voltage", thumbnail: cover("stormchaser"), track: helix(9) },
  { name: "Still Waters", artist: "Ambient Co.", thumbnail: cover("stillwaters"), track: helix(10) },
  { name: "Open Road", artist: "Ambient Co.", thumbnail: cover("openroad"), track: helix(11) },
  { name: "Deep Focus", artist: "Ambient Co.", thumbnail: cover("deepfocus"), track: helix(12) },
  { name: "Plot Twist", artist: "Sunny Days", thumbnail: cover("plottwist"), track: helix(13) },
];

const playlists = [
  // Mood playlists (one per face-api emotion).
  {
    name: "Happy Vibes",
    emotion: "happy",
    thumbnail: cover("happy"),
    songs: ["Sunshine Avenue", "Golden Hour", "Confetti", "Bandeya Re Bandeya", "Plot Twist"],
  },
  {
    name: "Melancholy",
    emotion: "sad",
    thumbnail: cover("sad"),
    songs: ["Rainy Window", "Letting Go", "Midnight Blue", "Satranga"],
  },
  {
    name: "Rage Mode",
    emotion: "angry",
    thumbnail: cover("angry"),
    songs: ["Adrenaline", "Breaking Point", "Storm Chaser"],
  },
  {
    name: "Chill Neutral",
    emotion: "neutral",
    thumbnail: cover("neutral"),
    songs: ["Still Waters", "Open Road", "Deep Focus", "O Maahi"],
  },
  {
    name: "Unexpected",
    emotion: "surprise",
    thumbnail: cover("surprise"),
    songs: ["Plot Twist", "Confetti", "Storm Chaser"],
  },
  {
    name: "On Edge",
    emotion: "fear",
    thumbnail: cover("fear"),
    songs: ["Storm Chaser", "Breaking Point", "Midnight Blue"],
  },
  {
    name: "Shake It Off",
    emotion: "disgust",
    thumbnail: cover("disgust"),
    songs: ["Adrenaline", "Letting Go", "Open Road"],
  },
  // Themed playlists for the Home page (no emotion).
  {
    name: "Today's Top Hits",
    thumbnail: cover("tophits"),
    songs: ["Bandeya Re Bandeya", "Satranga", "O Maahi", "Sunshine Avenue", "Golden Hour"],
  },
  {
    name: "Focus Flow",
    thumbnail: cover("focusflow"),
    songs: ["Deep Focus", "Still Waters", "Open Road", "Midnight Blue"],
  },
  {
    name: "Chill Vibes",
    thumbnail: cover("chillvibes"),
    songs: ["Golden Hour", "Rainy Window", "Open Road", "O Maahi"],
  },
];

// Albums group a set of songs under a singer / band / group / movie. Song lists
// reference song names (resolved to ids at seed time). The `moods` on each song
// are derived from the mood-playlist membership above (see seed.js).
const albums = [
  {
    title: "Arijit Essentials",
    artist: "Arijit Singh",
    kind: "singer",
    year: 2024,
    thumbnail: cover("arijit"),
    songs: ["Bandeya Re Bandeya", "Satranga", "O Maahi"],
  },
  {
    title: "Bright Days",
    artist: "Sunny Days",
    kind: "band",
    year: 2023,
    thumbnail: cover("brightdays"),
    songs: ["Sunshine Avenue", "Golden Hour", "Confetti", "Plot Twist"],
  },
  {
    title: "After Hours",
    artist: "Blue Hour",
    kind: "band",
    year: 2023,
    thumbnail: cover("afterhours"),
    songs: ["Rainy Window", "Letting Go", "Midnight Blue"],
  },
  {
    title: "High Voltage",
    artist: "Voltage",
    kind: "group",
    year: 2022,
    thumbnail: cover("highvoltage"),
    songs: ["Adrenaline", "Breaking Point", "Storm Chaser"],
  },
  {
    title: "Wide Open",
    artist: "Ambient Co.",
    kind: "group",
    year: 2024,
    thumbnail: cover("wideopen"),
    songs: ["Still Waters", "Open Road", "Deep Focus"],
  },
  {
    title: "Animal (Soundtrack)",
    artist: "Animal",
    kind: "movie",
    year: 2023,
    thumbnail: cover("animalost"),
    songs: ["Satranga", "O Maahi"],
  },
];

module.exports = {
  users,
  songs,
  playlists,
  albums,
  songUploader,
  playlistOwner,
};
