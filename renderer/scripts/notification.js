/* eslint-disable */
'use strict';

function getParam(key, fallback = '') {
  const sp = new URLSearchParams(window.location.search);
  const v = sp.get(key);
  return v == null ? fallback : v;
}

function getNumberParam(key, fallback) {
  const raw = getParam(key, '');
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function clampProgress(value) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

const ICONS = {
  default: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" stroke="currentColor" stroke-width="2"/>
    <path d="M12 10v7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M12 7h.01" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  success: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" stroke="currentColor" stroke-width="2"/>
    <path d="M7.5 12.5l3 3 6-7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  error: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" stroke="currentColor" stroke-width="2"/>
    <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3l10 18H2L12 3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <path d="M12 9v5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M12 17h.01" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  loading: `<svg class="spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`,
  progress: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 12a8 8 0 1 0 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
};

const id = getParam('id', '');
const title = getParam('title', '');
const description = getParam('description', '');
const image = getParam('image', '');
const duration = Math.max(0, Math.floor(getNumberParam('duration', 4000)));
const variant = getParam('variant', 'default');
const themeResolved = getParam('themeResolved', 'dark');
const progress = getNumberParam('progress', 0);
const progressLabel = getParam('progressLabel', '');
const loadingText = getParam('loadingText', '');

const root = document.getElementById('notification');
const titleEl = document.getElementById('title');
const descEl = document.getElementById('desc');
const closeBtn = document.getElementById('closeBtn');
const iconSvg = document.getElementById('iconSvg');
const imgEl = document.getElementById('image');
const bottomBar = document.getElementById('bottomBar');
const bottomBarFill = document.getElementById('bottomBarFill');
const progressInfo = document.getElementById('progressInfo');
const progressLabelEl = document.getElementById('progressLabel');
const progressPercentEl = document.getElementById('progressPercent');

titleEl.textContent = title;
descEl.textContent = description;

root.dataset.variant = variant;
root.dataset.theme = themeResolved;

const hasImage = typeof image === 'string' && image.trim().length > 0;
if (hasImage) {
  imgEl.src = image;
  imgEl.style.display = 'block';
  iconSvg.innerHTML = '';
} else {
  imgEl.removeAttribute('src');
  imgEl.style.display = 'none';
  iconSvg.innerHTML = ICONS[variant] || ICONS.default;
}

function setProgressUI(p) {
  const pct = clampProgress(p);
  progressLabelEl.textContent = progressLabel || '';
  progressPercentEl.textContent = `${pct}%`;
  bottomBarFill.style.transform = `scaleX(${pct / 100})`;
}

let closing = false;
let autoTimer = null;

function enter() {
  requestAnimationFrame(() => {
    root.classList.remove('entering');
    root.classList.add('entered');
  });
}

function requestClose() {
  if (closing) return;
  closing = true;
  if (autoTimer) {
    clearTimeout(autoTimer);
    autoTimer = null;
  }
  root.classList.remove('entered');
  root.classList.add('exiting');
  setTimeout(() => window.electronNotify.sendClose(id), 220);
  root.style.pointerEvents = 'none';
}

function startBottomBar() {
  if (variant === 'loading') {
    bottomBar.style.display = 'none';
    return;
  }

  if (variant === 'progress') {
    progressInfo.style.display = 'flex';
    setProgressUI(progress);
    return;
  }

  if (duration <= 0) {
    bottomBar.style.display = 'none';
    return;
  }

  bottomBar.style.display = 'block';
  bottomBarFill.style.transform = 'scaleX(1)';
  bottomBarFill.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], {
    duration,
    easing: 'linear',
    fill: 'forwards'
  });
  autoTimer = setTimeout(() => requestClose(), duration);
}

closeBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  requestClose();
});

root.addEventListener('click', () => {
  if (closing) return;
  window.electronNotify.sendClick(id);
  requestClose();
});

root.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    root.click();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    requestClose();
  }
});

window.electronNotify.onReposition((_payload) => {
  root.animate([{ transform: 'translateY(-2px)' }, { transform: 'translateY(0px)' }], {
    duration: 240,
    easing: 'ease-out'
  });
});

window.electronNotify.onUpdate((payload) => {
  if (payload.id !== id) return;
  if (typeof payload.updates.description === 'string') descEl.textContent = payload.updates.description;
  if (typeof payload.updates.loadingText === 'string') descEl.textContent = payload.updates.loadingText;
  if (typeof payload.updates.progress === 'number') setProgressUI(payload.updates.progress);
});

window.electronNotify.onTheme((payload) => {
  root.dataset.theme = payload.theme;
});

enter();
startBottomBar();

