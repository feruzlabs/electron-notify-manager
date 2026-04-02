/* eslint-disable */
'use strict';

// Runtime file used by `notification.html` directly.
// Source-of-truth TypeScript is `notification.ts`.

/**
 * @param {string} key
 * @param {string} fallback
 */
function getParam(key, fallback = '') {
  const sp = new URLSearchParams(window.location.search);
  const v = sp.get(key);
  return v == null ? fallback : v;
}

/**
 * @param {string} key
 * @param {number} fallback
 */
function getNumberParam(key, fallback) {
  const raw = getParam(key, '');
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

const id = getParam('id', '');
const title = getParam('title', '');
const description = getParam('description', '');
const image = getParam('image', '');
const duration = Math.max(0, Math.floor(getNumberParam('duration', 4000)));

const root = document.getElementById('root');
const titleEl = document.getElementById('title');
const descEl = document.getElementById('desc');
const closeBtn = document.getElementById('closeBtn');
const imgWrap = document.getElementById('imageWrap');
const imgEl = document.getElementById('image');
const defaultIconEl = document.getElementById('defaultIcon');
const progressEl = document.getElementById('progress');

titleEl.textContent = title;
descEl.textContent = description;

const hasImage = typeof image === 'string' && image.trim().length > 0;
if (hasImage) {
  imgEl.src = image;
  imgEl.style.display = 'block';
  defaultIconEl.style.display = 'none';
} else {
  imgEl.removeAttribute('src');
  imgEl.style.display = 'none';
  defaultIconEl.style.display = 'block';
}

let closing = false;
let autoTimer = null;

function enter() {
  requestAnimationFrame(() => {
    root.classList.remove('entering');
    root.classList.add('entered');
  });
}

/**
 * @param {'timeout'|'manual'} reason
 */
function requestClose(reason) {
  if (closing) return;
  closing = true;

  if (autoTimer) {
    clearTimeout(autoTimer);
    autoTimer = null;
  }

  root.classList.remove('entered');
  root.classList.add('exiting');

  // Let animation play then ask main to close/destroy.
  setTimeout(() => {
    window.electronNotify.sendClose(id);
  }, 220);

  // Prevent click handler from firing late.
  root.style.pointerEvents = 'none';
}

function startProgress() {
  if (duration <= 0) {
    // sticky: hide progress track
    progressEl.style.opacity = '0';
    return;
  }

  progressEl.style.opacity = '1';
  progressEl.animate(
    [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
    { duration, easing: 'linear', fill: 'forwards' }
  );

  autoTimer = setTimeout(() => requestClose('timeout'), duration);
}

closeBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  requestClose('manual');
});

root.addEventListener('click', () => {
  if (closing) return;
  window.electronNotify.sendClick(id);
  requestClose('manual');
});

root.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    root.click();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    requestClose('manual');
  }
});

window.electronNotify.onReposition((_payload) => {
  root.animate(
    [{ transform: 'translateY(-2px)' }, { transform: 'translateY(0px)' }],
    { duration: 240, easing: 'ease-out' }
  );
});

enter();
startProgress();

