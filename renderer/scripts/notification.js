import { ICONS } from './icons.js';
import { ProgressBar } from './progressBar.js';
import { AnimationController } from './animationController.js';

function parseConfig() {
  const params = new URLSearchParams(window.location.search);
  const cfgRaw = params.get('config');
  if (cfgRaw) {
    try {
      const parsed = JSON.parse(cfgRaw);
      return {
        id: String(parsed?.id ?? ''),
        title: String(parsed?.title ?? ''),
        description: String(parsed?.description ?? ''),
        image: parsed?.image == null ? null : String(parsed.image),
        duration: Number.isFinite(Number(parsed?.duration)) ? Number(parsed.duration) : 4000,
        variant: String(parsed?.variant ?? 'default'),
        theme: parsed?.theme === 'light' ? 'light' : 'dark',
        progress: typeof parsed?.progress === 'number' ? parsed.progress : undefined,
      };
    } catch {
      // ignore
    }
  }
  return {
    id: params.get('id') ?? '',
    title: params.get('title') ?? '',
    description: params.get('description') ?? '',
    image: params.get('image'),
    duration: Number(params.get('duration') ?? 4000),
    variant: params.get('variant') ?? 'default',
    theme: params.get('theme') === 'light' ? 'light' : 'dark',
    progress: params.get('progress') ? Number(params.get('progress')) : undefined,
  };
}

(function () {
  const config = parseConfig();
  console.log('[renderer] config:', {
    id: config.id ? config.id.slice(0, 8) : '',
    duration: config.duration,
    variant: config.variant,
    theme: config.theme,
  });

  const root = document.getElementById('notification');
  const titleEl = document.getElementById('title');
  const descEl = document.getElementById('desc');
  const imageEl = document.getElementById('image');
  const iconSvgEl = document.getElementById('iconSvg');
  const closeBtn = document.getElementById('closeBtn');
  const bottomBarFill = document.getElementById('bottomBarFill');
  const progressInfo = document.getElementById('progressInfo');
  const progressLabel = document.getElementById('progressLabel');
  const progressPercent = document.getElementById('progressPercent');

  if (
    !root ||
    !titleEl ||
    !descEl ||
    !imageEl ||
    !iconSvgEl ||
    !closeBtn ||
    !bottomBarFill ||
    !progressInfo ||
    !progressLabel ||
    !progressPercent
  ) {
    throw new Error('Notification UI elements missing from notification.html');
  }

  root.dataset.variant = config.variant;
  root.dataset.theme = config.theme;

  titleEl.textContent = config.title;
  descEl.textContent = config.description;

  if (config.image && config.image.trim().length > 0) {
    imageEl.src = config.image;
    imageEl.style.display = 'block';
    iconSvgEl.style.display = 'none';
  } else {
    imageEl.removeAttribute('src');
    imageEl.style.display = 'none';
    iconSvgEl.style.display = 'grid';
    iconSvgEl.innerHTML = ICONS[config.variant] ?? ICONS.default;
  }

  const position = new URLSearchParams(window.location.search).get('position') ?? 'bottomRight';
  const animController = new AnimationController(root, position);
  const progressBar = new ProgressBar(bottomBarFill);

  let autoTimer = null;
  const duration = Math.max(0, Math.floor(Number(config.duration)));
  const shouldAutoClose = duration > 0 && config.variant !== 'loading' && config.variant !== 'progress';

  function clearAutoTimer() {
    if (autoTimer == null) return;
    window.clearTimeout(autoTimer);
    autoTimer = null;
  }

  function handleUpdate(payload) {
    if (!payload || typeof payload !== 'object') return;
    if (payload.id !== config.id) return;
    const updates = payload.updates;
    if (!updates || typeof updates !== 'object') return;

    if (typeof updates.description === 'string') {
      descEl.textContent = updates.description;
    }
    if (typeof updates.loadingText === 'string') {
      descEl.textContent = updates.loadingText;
    }
    if (typeof updates.progress === 'number') {
      const p = Math.max(0, Math.min(100, updates.progress));
      root.dataset.variant = 'progress';
      progressInfo.style.display = 'flex';
      progressLabel.textContent = progressLabel.textContent || 'Progress';
      progressPercent.textContent = `${Math.round(p)}%`;
      progressBar.setProgress(p);
    }
  }

  // IPC setup MUST be registered before enter() to avoid losing early messages.
  if (window.electronAPI?.onReposition) {
    window.electronAPI.onReposition((y) => animController.reposition(y));
  } else if (window.electronNotify?.onReposition) {
    window.electronNotify.onReposition((payload) => {
      if (payload && payload.id === config.id) animController.reposition(payload.y);
    });
  }

  if (window.electronAPI?.onUpdate) {
    window.electronAPI.onUpdate(handleUpdate);
  } else if (window.electronNotify?.onUpdate) {
    window.electronNotify.onUpdate(handleUpdate);
  }

  if (window.electronAPI?.onForceClose) {
    window.electronAPI.onForceClose(() => {
      clearAutoTimer();
      animController.exit().then(() => {
        if (window.electronAPI?.notifyClose) window.electronAPI.notifyClose(config.id, 'programmatic');
        else window.electronNotify?.sendClose?.(config.id);
      });
    });
  }

  animController.enter().then(() => {
    if (config.variant === 'progress') {
      progressInfo.style.display = 'flex';
      progressLabel.textContent = progressLabel.textContent || 'Progress';
      const p = typeof config.progress === 'number' ? Math.max(0, Math.min(100, config.progress)) : 0;
      progressPercent.textContent = `${Math.round(p)}%`;
      progressBar.setProgress(p);
      return;
    }

    if (shouldAutoClose) {
      progressBar.startDuration(duration);
      autoTimer = window.setTimeout(() => {
        animController.exit().then(() => {
          if (window.electronAPI?.notifyClose) window.electronAPI.notifyClose(config.id, 'duration');
          else window.electronNotify?.sendClose?.(config.id);
        });
      }, duration);
    } else {
      progressBar.complete();
    }
  });

  if (window.electronNotify?.onTheme) {
    window.electronNotify.onTheme((payload) => {
      if (payload && (payload.theme === 'dark' || payload.theme === 'light')) root.dataset.theme = payload.theme;
    });
  }

  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearAutoTimer();
    animController.exit().then(() => {
      if (window.electronAPI?.notifyClose) window.electronAPI.notifyClose(config.id, 'user');
      else window.electronNotify?.sendClose?.(config.id);
    });
  });

  root.addEventListener('click', () => {
    clearAutoTimer();
    if (window.electronAPI?.notifyClick) window.electronAPI.notifyClick(config.id);
    else window.electronNotify?.sendClick?.(config.id);
  });
})();

