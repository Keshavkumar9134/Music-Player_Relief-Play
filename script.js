// ---------- Playlist data ----------
// Put matching files at: images/<name>.jpg and music/<name>.mp3
const SONGS = [
 
  // Bollywood placeholders — add the media files to use these:
  { name: "kalank", title: "Kalank", artist: "Arijit Singh" },
  { name: "kesariya", title: "Kesariya", artist: "Arijit Singh" },
  { name: "tum-hi-ho", title: "Tum Hi Ho", artist: "Arijit Singh" },
  { name: "diya-aur-baati-hum", title: "Diya Aur Baati Hum", artist: "Kailash Kher" },
  { name: "shish-navata-hu", title: "Shish Navata Hu", artist: "Jubin Nautiyal" },
  { name: "apna-time-aayega", title: "Apna Time Aayega", artist: "Divine" },

  { name: "music-1", title: "Lotus Lane", artist: "The Loyalist" },
  { name: "music-2", title: "Sappheiros", artist: "Aurora" },
  { name: "music-3", title: "Walking Firiri", artist: "Gorkhali Takma" },


];

// ---------- Elements ----------
const audio = document.getElementById("audio");
const cover = document.getElementById("cover");
const title = document.getElementById("title");
const artist = document.getElementById("artist");

const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");

const progressDiv = document.getElementById("progress_div");
const progress = document.getElementById("progress");
const curEl = document.getElementById("current_time");
const durEl = document.getElementById("duration");

const volRange = document.getElementById("volume");
const muteBtn = document.getElementById("mute");
const favBtn = document.getElementById("favBtn");

const list = document.getElementById("trackList");
const tpl = document.getElementById("trackItemTpl");
const search = document.getElementById("search");

// ---------- State ----------
const LS_KEY = "relief-play";
const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");

let index = Number.isInteger(saved.index) ? saved.index : 0;
let isPlaying = false;
let shuffle = !!saved.shuffle;
let repeat = saved.repeat || "off"; // 'off' | 'all' | 'one'
let favs = new Set(saved.favs || []);

// ---------- Helpers ----------
const fmt = (s) => {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${ss}`;
};

const persist = () =>
  localStorage.setItem(
    LS_KEY,
    JSON.stringify({
      index,
      shuffle,
      repeat,
      favs: [...favs],
      t: audio.currentTime || 0,
      v: audio.volume,
    })
  );

function renderPlaylist(items = SONGS) {
  list.innerHTML = "";
  items.forEach((s, i) => {
    const li = tpl.content.firstElementChild.cloneNode(true);
    li.dataset.index = i;
    const img = li.querySelector(".thumb");
    img.src = `images/${s.name}.jpg`;
    img.onerror = () => {
      img.src =
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'><rect width='100%' height='100%' fill='%23111'/><text x='50%' y='52%' fill='%23fff' font-size='18' font-family='sans-serif' text-anchor='middle'>No Cover</text></svg>";
    };
    li.querySelector(".t").textContent = s.title;
    li.querySelector(".a").textContent = s.artist;
    if (favs.has(s.name)) li.querySelector(".like").classList.add("active");

    li.addEventListener("click", (e) => {
      const isHeart = e.target.closest(".like");
      if (isHeart) {
        toggleFav(s.name, li.querySelector(".like"));
        e.stopPropagation();
        return;
      }
      index = i;
      load(index);
      play();
    });

    list.appendChild(li);
  });
  highlightPlaying();
}

function highlightPlaying() {
  [...list.children].forEach((li) => li.classList.remove("active", "playing"));
  const li = list.children[index];
  if (li) li.classList.add("active", "playing");
}

function toggleFav(name, btn) {
  if (favs.has(name)) favs.delete(name);
  else favs.add(name);
  btn?.classList.toggle("active");
  favBtn.classList.toggle("active", favs.has(SONGS[index].name));
  persist();
}

function load(i) {
  const s = SONGS[i];
  if (!s) return;
  title.textContent = s.title;
  artist.textContent = s.artist;
  cover.src = `images/${s.name}.jpg`;
  audio.src = `music/${s.name}.mp3`;
  favBtn.classList.toggle("active", favs.has(s.name));
  highlightPlaying();
  persist();
}

function play() {
  isPlaying = true;
  audio.play().catch(() => {});
  playBtn.firstElementChild.className = "fa-solid fa-pause";
}
function pause() {
  isPlaying = false;
  audio.pause();
  playBtn.firstElementChild.className = "fa-solid fa-play";
}

function next() {
  if (repeat === "one") return play();
  if (shuffle) index = Math.floor(Math.random() * SONGS.length);
  else index = (index + 1) % SONGS.length;
  load(index);
  play();
}
function prev() {
  index = (index - 1 + SONGS.length) % SONGS.length;
  load(index);
  play();
}

// ---------- Events ----------
playBtn.addEventListener("click", () => (isPlaying ? pause() : play()));
prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);

shuffleBtn.addEventListener("click", () => {
  shuffle = !shuffle;
  shuffleBtn.classList.toggle("active", shuffle);
  persist();
});
repeatBtn.addEventListener("click", () => {
  repeat = repeat === "off" ? "all" : repeat === "all" ? "one" : "off";
  repeatBtn.title = `Repeat: ${repeat}`;
  persist();
});

favBtn.addEventListener("click", () => toggleFav(SONGS[index].name));

audio.addEventListener("timeupdate", () => {
  curEl.textContent = fmt(audio.currentTime);
  const p = (audio.currentTime / (audio.duration || 1)) * 100;
  progress.style.width = p + "%";
});
audio.addEventListener("loadedmetadata", () => (durEl.textContent = fmt(audio.duration)));
audio.addEventListener("ended", () => (repeat === "one" ? play() : next()));

progressDiv.addEventListener("click", (e) => {
  const rect = progressDiv.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  audio.currentTime = ratio * (audio.duration || 0);
});

volRange.addEventListener("input", (e) => {
  audio.volume = +e.target.value;
  persist();
});
muteBtn.addEventListener("click", () => {
  audio.muted = !audio.muted;
  muteBtn.firstElementChild.className = audio.muted
    ? "fa-solid fa-volume-xmark"
    : "fa-solid fa-volume-high";
});

// Keyboard shortcuts
// window.addEventListener("keydown", (e) => {
//   if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
//   if (e.code === "Space") {
//     e.preventDefault();
//     isPlaying ? pause() : play();
//   }
//   if (e.code === "ArrowRight") audio.currentTime += 5;
//   if (e.code === "ArrowLeft") audio.currentTime -= 5;
//   if (e.code === "ArrowUp") {
//     audio.volume = Math.min(1, (audio.volume || 0) + 0.05);
//     volRange.value = audio.volume;
//   }
//   if (e.code === "ArrowDown") {
//     audio.volume = Math.max(0, (audio.volume || 0) - 0.05);
//     volRange.value = audio.volume;
//   }
// });

// Search filter
search.addEventListener("input", () => {
  const q = search.value.toLowerCase();
  const filtered = SONGS.filter((s) =>
    `${s.title} ${s.artist}`.toLowerCase().includes(q)
  );
  renderPlaylist(filtered);
});

// ---------- Init ----------
renderPlaylist();
load(index);
if (Number.isFinite(saved.t)) audio.currentTime = saved.t;
if (Number.isFinite(saved.v)) {
  audio.volume = saved.v;
  volRange.value = saved.v;
}
