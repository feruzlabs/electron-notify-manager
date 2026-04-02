export type NotificationVariant =
  | 'default'
  | 'success'
  | 'error'
  | 'warning'
  | 'loading'
  | 'progress';

export const ICONS: Record<NotificationVariant, string> = {
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
  </svg>`,
};

