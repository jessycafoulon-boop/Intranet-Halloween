"use strict";
// Navigation : vidéo → accueil → questionnaire Eval&Go.
// Les questions, scores et résultats sont exclusivement gérés par Eval&Go.
const screens = Array.from(document.querySelectorAll('main.shell > section.screen'));
const video = document.getElementById('openingVideo');
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
  // Afficher immédiatement l'accueil, même si le navigateur refuse de sortir du plein écran.
  showScreen('intro');
  try { if (document.fullscreenElement) await document.exitFullscreen(); } catch (_) {}
  try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (_) {}
}

const landscapeBtn = document.getElementById('landscapeBtn');
landscapeBtn.addEventListener('click', async () => {
  const intro = document.getElementById('videoIntro');
  if (document.fullscreenElement) {
    try { await document.exitFullscreen(); } catch (_) {}
    try { screen.orientation?.unlock?.(); } catch (_) {}
    return;
  }
  try {
    if (!intro.requestFullscreen) throw new Error('Plein écran non disponible');
    await intro.requestFullscreen();
    try { await screen.orientation?.lock?.('landscape'); } catch (_) {
      // Certains navigateurs ne permettent pas la rotation : la vidéo reste entière.
    }
  } catch (_) {
    landscapeBtn.textContent = '↻ Tournez le téléphone pour le paysage';
  }
});
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
  showScreen('intro');
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && musicStarted && music.paused) music.play().catch(() => {});
});
showScreen('videoIntro');
video.play().catch(() => {
  // Le bouton « Passer l’introduction » reste accessible.
});
