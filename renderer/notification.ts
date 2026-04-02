type CloseReason = 'timeout' | 'manual';

interface RepositionPayload {
  id: string;
  y: number;
}

interface RendererApi {
  sendClose: (id: string) => void;
  sendClick: (id: string) => void;
  onReposition: (handler: (payload: RepositionPayload) => void) => void;
}

declare global {
  interface Window {
    electronNotify: RendererApi;
  }
}

function getParam(key: string, fallback = ''): string {
  const sp = new URLSearchParams(window.location.search);
  const v = sp.get(key);
  return v === null ? fallback : v;
}

function getNumberParam(key: string, fallback: number): number {
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
const imgEl = document.getElementById('image');
const defaultIconEl = document.getElementById('defaultIcon');
const progressEl = document.getElementById('progress');

if (
  root === null ||
  titleEl === null ||
  descEl === null ||
  closeBtn === null ||
  imgEl === null ||
  defaultIconEl === null ||
  progressEl === null
) {
  throw new Error('Notification UI elements missing from notification.html');
}

titleEl.textContent = title;
descEl.textContent = description;

const hasImage = typeof image === 'string' && image.trim().length > 0;
if (hasImage) {
  (imgEl as HTMLImageElement).src = image;
  (imgEl as HTMLElement).style.display = 'block';
  (defaultIconEl as HTMLElement).style.display = 'none';
} else {
  (imgEl as HTMLImageElement).removeAttribute('src');
  (imgEl as HTMLElement).style.display = 'none';
  (defaultIconEl as HTMLElement).style.display = 'block';
}

let closing = false;
let autoTimer: number | null = null;

function enter(): void {
  requestAnimationFrame(() => {
    root.classList.remove('entering');
    root.classList.add('entered');
  });
}

function requestClose(_reason: CloseReason): void {
  if (closing) return;
  closing = true;

  if (autoTimer !== null) {
    window.clearTimeout(autoTimer);
    autoTimer = null;
  }

  root.classList.remove('entered');
  root.classList.add('exiting');

  window.setTimeout(() => {
    window.electronNotify.sendClose(id);
  }, 220);

  (root as HTMLElement).style.pointerEvents = 'none';
}

function startProgress(): void {
  if (duration <= 0) {
    (progressEl as HTMLElement).style.opacity = '0';
    return;
  }

  (progressEl as HTMLElement).style.opacity = '1';
  progressEl.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], {
    duration,
    easing: 'linear',
    fill: 'forwards'
  });

  autoTimer = window.setTimeout(() => requestClose('timeout'), duration);
}

closeBtn.addEventListener('click', (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  requestClose('manual');
});

root.addEventListener('click', () => {
  if (closing) return;
  window.electronNotify.sendClick(id);
  requestClose('manual');
});

root.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    (root as HTMLElement).click();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    requestClose('manual');
  }
});

window.electronNotify.onReposition((_payload) => {
  root.animate([{ transform: 'translateY(-2px)' }, { transform: 'translateY(0px)' }], {
    duration: 240,
    easing: 'ease-out'
  });
});

enter();
startProgress();

export {};

