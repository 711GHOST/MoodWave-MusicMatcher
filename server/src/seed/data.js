// Sample data for local development. Audio uses royalty-free SoundHelix tracks
// plus a few real Cloudinary uploads carried over from the original project, so
// every seeded song is actually playable in the browser.

const cover = (seed) => `https://picsum.photos/seed/${seed}/300/300`;
const helix = (n) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

const users = [
  {
    key: "demo",
    firstName: "Demo",
    lastName: "Listener",
    email: "demo@moodwave.app",
    userName: "demo",
    password: "Demo@1234",
  },
  {
    key: "arijit",
    firstName: "Arijit",
    lastName: "Singh",
    email: "arijit@moodwave.app",
    userName: "arijit",
    password: "Password@123",
  },
  {
    key: "helix",
    firstName: "Sound",
    lastName: "Helix",
    email: "helix@moodwave.app",
    userName: "soundhelix",
    password: "Password@123",
  },
];

const playlistOwner = "demo";

const songs = [
  // Real tracks carried over from the original project.
  {
    name: "Bandeya Re Bandeya",
    artist: "arijit",
    thumbnail:
      "https://pagalnew.com/coverimages/Bandeya-Rey-Bandeya-Simmba-500-500.jpg",
    track:
      "https://res.cloudinary.com/dcqnxmaoj/video/upload/v1708956357/iogtikmu9gadalifecsw.mp3",
  },
  {
    name: "Satranga",
    artist: "arijit",
    thumbnail: "https://pagalnew.com/coverimages/satranga-animal-500-500.jpg",
    track:
      "https://res.cloudinary.com/dcqnxmaoj/video/upload/v1708956390/qfg2qboxt9p4a6amdjfa.mp3",
  },
  {
    name: "O Maahi",
    artist: "arijit",
    thumbnail: "https://pagalnew.com/coverimages/o-maahi-dunki-500-500.jpg",
    track:
      "https://res.cloudinary.com/dcqnxmaoj/video/upload/v1708956503/jyjj3yodwazqqf2ppawz.mp3",
  },
  // Royalty-free SoundHelix tracks with generated cover art.
  { name: "Sunshine Avenue", artist: "helix", thumbnail: cover("sunshine"), track: helix(1) },
  { name: "Golden Hour", artist: "helix", thumbnail: cover("goldenhour"), track: helix(2) },
  { name: "Confetti", artist: "helix", thumbnail: cover("confetti"), track: helix(3) },
  { name: "Rainy Window", artist: "helix", thumbnail: cover("rainywindow"), track: helix(4) },
  { name: "Letting Go", artist: "helix", thumbnail: cover("lettinggo"), track: helix(5) },
  { name: "Midnight Blue", artist: "helix", thumbnail: cover("midnightblue"), track: helix(6) },
  { name: "Adrenaline", artist: "helix", thumbnail: cover("adrenaline"), track: helix(7) },
  { name: "Breaking Point", artist: "helix", thumbnail: cover("breakingpoint"), track: helix(8) },
  { name: "Storm Chaser", artist: "helix", thumbnail: cover("stormchaser"), track: helix(9) },
  { name: "Still Waters", artist: "helix", thumbnail: cover("stillwaters"), track: helix(10) },
  { name: "Open Road", artist: "helix", thumbnail: cover("openroad"), track: helix(11) },
  { name: "Deep Focus", artist: "helix", thumbnail: cover("deepfocus"), track: helix(12) },
  { name: "Plot Twist", artist: "helix", thumbnail: cover("plottwist"), track: helix(13) },
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

module.exports = { users, songs, playlists, playlistOwner };
