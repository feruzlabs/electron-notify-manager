function clampPercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export class ProgressBar {
  animation = null;

  constructor(element) {
    this.element = element;
  }

  startDuration(durationMs) {
    this.stop();
    const ms = Math.max(0, Math.floor(durationMs));
    if (ms <= 0) return;
    this.animation = this.element.animate(
      [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
      { duration: ms, easing: 'linear', fill: 'forwards' },
    );
  }

  setProgress(percent) {
    this.stop();
    const p = clampPercent(percent);
    this.element.style.transform = `scaleX(${p / 100})`;
  }

  stop() {
    if (!this.animation) return;
    this.animation.cancel();
    this.animation = null;
  }

  complete() {
    this.stop();
    this.element.style.transform = 'scaleX(0)';
  }
}

