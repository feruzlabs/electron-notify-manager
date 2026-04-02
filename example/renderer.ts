type LogType = 'shown' | 'closed' | 'updated' | 'click' | 'error';

interface LogEntry {
  type: LogType;
  message: string;
  timestamp: number;
}

declare global {
  interface Window {
    electronAPI: {
      trigger: (action: string | null) => void;
      onLog: (handler: (entry: LogEntry) => void) => () => void;
    };
  }
}

const LOG_ICONS: Record<LogType, string> = {
  shown: '●',
  closed: '○',
  updated: '↻',
  click: '↺',
  error: '!',
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString();
}

function qs<T extends Element>(selector: string): T {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el as T;
}

document.addEventListener('DOMContentLoaded', () => {
  const logEntries = qs<HTMLDivElement>('#logEntries');
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
  const sidebarItems = Array.from(document.querySelectorAll<HTMLElement>('[data-nav]'));

  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const btn = target.closest<HTMLElement>('[data-action]');
    if (btn) {
      const action = btn.getAttribute('data-action');
      if (!action) return;
      window.electronAPI.trigger(action);
      return;
    }

    const nav = target.closest<HTMLElement>('[data-nav]');
    if (nav) {
      const id = nav.getAttribute('data-nav');
      if (!id) return;
      const section = document.getElementById(id);
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  window.electronAPI.onLog((entry: LogEntry) => {
    appendLog(logEntries, entry);
  });

  function updateActiveNav(): void {
    const y = window.scrollY + 120;
    let current: string | null = null;
    for (const s of sections) {
      const rect = s.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      if (top <= y) current = s.id;
    }
    for (const item of sidebarItems) {
      const id = item.getAttribute('data-nav');
      item.classList.toggle('active', id === current);
    }
  }

  let raf: number | null = null;
  window.addEventListener('scroll', () => {
    if (raf !== null) return;
    raf = window.requestAnimationFrame(() => {
      raf = null;
      updateActiveNav();
    });
  });

  updateActiveNav();
});

function appendLog(logEntries: HTMLElement, entry: LogEntry): void {
  const el = document.createElement('div');
  el.className = `log-entry log-${entry.type}`;
  el.innerHTML = `
    <span class="log-time">${formatTime(entry.timestamp)}</span>
    <span class="log-icon">${LOG_ICONS[entry.type]}</span>
    <span class="log-text">${entry.message}</span>
  `;
  logEntries.prepend(el);
  while (logEntries.children.length > 50) {
    logEntries.lastElementChild?.remove();
  }
}

export {};

