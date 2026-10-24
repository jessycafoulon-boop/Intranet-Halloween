"use strict";
// Navigation : vidéo → accueil → questionnaire Eval&Go.
// Les questions, scores et résultats sont exclusivement gérés par Eval&Go.
const screens = Array.from(document.querySelectorAll('main.shell > section.screen'));
const video = document.getElementById('openingVideo');
// Bruitage synchronisé aux textes de l'introduction (15 secondes).
// Les navigateurs mobiles peuvent bloquer l'audio sans geste utilisateur.
const typingAudio = new Audio('./machine-a-ecrire.mp3');
typingAudio.preload = 'auto';
typingAudio.volume = 0.48;
const soundButton = document.getElementById('introSoundBtn');
let introSoundEnabled = false;
function syncTypingSound() {
  if (video.paused || video.ended || switchingFromIntro) return;
  if (Math.abs(typingAudio.currentTime - video.currentTime) > 0.28) {
    try { typingAudio.currentTime = video.currentTime; } catch (_) {}
  }
  typingAudio.play().then(() => {
    introSoundEnabled = true;
    soundButton.hidden = true;
  }).catch(() => { soundButton.hidden = false; });
}
video.addEventListener('play', syncTypingSound);
video.addEventListener('pause', () => typingAudio.pause());
video.addEventListener('seeking', () => {
  try { typingAudio.currentTime = video.currentTime; } catch (_) {}
});
video.addEventListener('timeupdate', () => {
  if (introSoundEnabled && !typingAudio.paused && Math.abs(typingAudio.currentTime-video.currentTime)>0.35) {
    try { typingAudio.currentTime=video.currentTime; } catch (_) {}
  }
});
soundButton.addEventListener('click', () => {
  introSoundEnabled = true;
  syncTypingSound();
});

const music = new Audio('./Sinister - Anno Domini Beats.mp3');
music.loop = true;
music.volume = 0.5;
music.preload = 'none';
let musicStarted = false;

function showScreen(id) {
  screens.forEach(screen => {
    const active = screen.id === id;
    screen.hidden = !active;
    screen.classList.toggle('hidden', !active);
    screen.classList.toggle('is-active', active);
  });
  document.body.dataset.activeScreen = id;
  window.scrollTo(0, 0);
}

let switchingFromIntro = false;
async function leaveVideoIntro() {
  if (switchingFromIntro) return;
  switchingFromIntro = true;
  video.pause();
  typingAudio.pause();
  soundButton.hidden = true;
  // Afficher immédiatement l'accueil, même si le navigateur refuse de sortir du plein écran.
  showScreen('intro');
  try { if (document.fullscreenElement) await document.exitFullscreen(); } catch (_) {}
  try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (_) {}
}

// Tentative automatique : sur mobile, les navigateurs peuvent refuser
// le plein écran ou le verrouillage paysage sans interaction utilisateur.
// L'introduction reste alors lisible en portrait, sans être recadrée.
async function tryAutomaticLandscape() {
  if (!window.matchMedia('(max-width: 760px) and (orientation: portrait)').matches) return;
  const intro = document.getElementById('videoIntro');
  try {
    if (intro.requestFullscreen && !document.fullscreenElement) {
      await intro.requestFullscreen();
    }
    if (document.fullscreenElement === intro && screen.orientation?.lock) {
      try { await screen.orientation.lock('landscape'); } catch (_) {}
    }
  } catch (_) {
    // Refus normal sur Chrome mobile : aucune action requise.
  }
}
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    try { screen.orientation?.unlock?.(); } catch (_) {}
  }
});

function startMusic() {
  musicStarted = true;
  music.play().catch(() => {
    // Certains navigateurs bloquent l'audio ; un nouveau clic peut le débloquer.
  });
}

document.getElementById('skipVideoBtn').addEventListener('click', leaveVideoIntro);
video.addEventListener('ended', leaveVideoIntro);
video.addEventListener('error', leaveVideoIntro);
document.getElementById('startBtn').addEventListener('click', () => {
  startMusic();
  showScreen('survey');
});
document.getElementById('backToResultBtn').addEventListener('click', () => showScreen('intro'));
document.querySelector('.brand').addEventListener('click', event => {
  event.preventDefault();
  if (!video.paused) video.pause();
  typingAudio.pause();
  showScreen('intro');
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && musicStarted && music.paused) music.play().catch(() => {});
});
showScreen('videoIntro');
void tryAutomaticLandscape();
video.play().catch(() => {
  // Le bouton « Passer l’introduction » reste accessible.
});
