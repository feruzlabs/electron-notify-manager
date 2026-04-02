import { ICONS, type NotificationVariant } from './icons';
import { ProgressBar } from './progressBar';
import { AnimationController, type NotificationPosition } from './animationController';

type Theme = 'dark' | 'light';

interface IpcNotificationConfig {
  id: string;
  title: string;
  description: string;
  image: string | null;
  duration: number;
  variant: NotificationVariant;
  theme: Theme;
  progress?: number;
}

interface ElectronAPI {
  notifyClose: (id: string, reason: 'user' | 'duration' | 'programmatic' | 'app-quit') => void;
  notifyClick: (id: string) => void;
  onReposition: (handler: (y: number) => void) => void;
  onUpdate: (handler: (payload: { id: string; updates: { progress?: number; loadingText?: string; description?: string } }) => void) => void;
  onForceClose: (handler: () => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

function parseConfig(): IpcNotificationConfig {
  const params = new URLSearchParams(window.location.search);
  const cfgRaw = params.get('config');
  if (cfgRaw) {
    try {
      const parsed = JSON.parse(cfgRaw) as Partial<IpcNotificationConfig>;
      return {
        id: String(parsed.id ?? ''),
        title: String(parsed.title ?? ''),
        description: String(parsed.description ?? ''),
        image: parsed.image == null ? null : String(parsed.image),
        duration: Number.isFinite(Number(parsed.duration)) ? Number(parsed.duration) : 4000,
        variant: (parsed.variant ?? 'default') as NotificationVariant,
        theme: (parsed.theme ?? 'dark') as Theme,
        progress: typeof parsed.progress === 'number' ? parsed.progress : undefined,
      };
    } catch {
      // fall through
    }
  }

  return {
    id: params.get('id') ?? '',
    title: params.get('title') ?? '',
    description: params.get('description') ?? '',
    image: params.get('image'),
    duration: Number(params.get('duration') ?? 4000),
    variant: (params.get('variant') ?? 'default') as NotificationVariant,
    theme: (params.get('theme') ?? 'dark') as Theme,
    progress: params.get('progress') ? Number(params.get('progress')) : undefined,
  };
}

(function main() {
  const config = parseConfig();

  // eslint-disable-next-line no-console
  console.log('[renderer] config:', {
    id: config.id ? config.id.slice(0, 8) : '',
    duration: config.duration,
    variant: config.variant,
    theme: config.theme,
  });

  const root = document.getElementById('notification');
  const titleEl = document.getElementById('title');
  const descEl = document.getElementById('desc');
  const imageEl = document.getElementById('image') as HTMLImageElement | null;
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

  const rootEl = root;
  const descElSafe = descEl;
  const progressInfoEl = progressInfo;
  const progressPercentEl = progressPercent;

  rootEl.dataset.variant = config.variant;
  rootEl.dataset.theme = config.theme;

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

  const position = (new URLSearchParams(window.location.search).get('position') ??
    'bottomRight') as NotificationPosition;
  const animController = new AnimationController(rootEl, position);
  const progressBar = new ProgressBar(bottomBarFill);

  let autoTimer: number | null = null;
  const shouldAutoClose =
    config.duration > 0 && config.variant !== 'loading' && config.variant !== 'progress';

  // IPC setup MUST be registered before enter() to avoid losing early messages.
  window.electronAPI.onReposition((y) => animController.reposition(y));
  window.electronAPI.onUpdate((payload) => handleUpdate(payload));
  window.electronAPI.onForceClose(() => {
    clearAutoTimer();
    void animController.exit().then(() => window.electronAPI.notifyClose(config.id, 'programmatic'));
  });

  void animController.enter().then(() => {
    if (shouldAutoClose) {
      progressBar.startDuration(config.duration);
      autoTimer = window.setTimeout(() => {
        void animController.exit().then(() => window.electronAPI.notifyClose(config.id, 'duration'));
      }, config.duration);
    } else {
      progressBar.complete();
    }
  });

  function clearAutoTimer(): void {
    if (autoTimer === null) return;
    window.clearTimeout(autoTimer);
    autoTimer = null;
  }

  function handleUpdate(payload: {
    id: string;
    updates: { progress?: number; loadingText?: string; description?: string };
  }): void {
    if (payload.id !== config.id) return;

    if (typeof payload.updates.description === 'string') {
      descElSafe.textContent = payload.updates.description;
    }
    if (typeof payload.updates.loadingText === 'string') {
      descElSafe.textContent = payload.updates.loadingText;
    }
    if (typeof payload.updates.progress === 'number') {
      const p = Math.max(0, Math.min(100, payload.updates.progress));
      rootEl.dataset.variant = 'progress';
      progressInfoEl.style.display = 'flex';
      progressPercentEl.textContent = `${Math.round(p)}%`;
      progressBar.setProgress(p);
    }
  }

  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearAutoTimer();
    void animController.exit().then(() => window.electronAPI.notifyClose(config.id, 'user'));
  });

  rootEl.addEventListener('click', () => {
    clearAutoTimer();
    window.electronAPI.notifyClick(config.id);
  });
})();

