export function clampProgress(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function setProgressFill(fillEl: HTMLElement, percent: number): void {
  const p = clampProgress(percent);
  fillEl.style.transform = `scaleX(${p / 100})`;
}

