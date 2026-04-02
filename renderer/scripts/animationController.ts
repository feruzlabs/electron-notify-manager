export type NotificationPosition =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight';

function getEnterKeyframes(position: NotificationPosition): Keyframe[] {
  if (position === 'topRight' || position === 'bottomRight') {
    return [
      { transform: 'translateX(120%)', opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 },
    ];
  }
  if (position === 'topLeft' || position === 'bottomLeft') {
    return [
      { transform: 'translateX(-120%)', opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 },
    ];
  }
  // centers: slide from top/bottom
  if (position === 'topCenter') {
    return [
      { transform: 'translateY(-120%)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 },
    ];
  }
  return [
    { transform: 'translateY(120%)', opacity: 0 },
    { transform: 'translateY(0)', opacity: 1 },
  ];
}

function getExitKeyframes(position: NotificationPosition): Keyframe[] {
  if (position === 'topRight' || position === 'bottomRight') {
    return [
      { transform: 'translateX(0)', opacity: 1 },
      { transform: 'translateX(120%)', opacity: 0 },
    ];
  }
  if (position === 'topLeft' || position === 'bottomLeft') {
    return [
      { transform: 'translateX(0)', opacity: 1 },
      { transform: 'translateX(-120%)', opacity: 0 },
    ];
  }
  if (position === 'topCenter') {
    return [
      { transform: 'translateY(0)', opacity: 1 },
      { transform: 'translateY(-120%)', opacity: 0 },
    ];
  }
  return [
    { transform: 'translateY(0)', opacity: 1 },
    { transform: 'translateY(120%)', opacity: 0 },
  ];
}

export class AnimationController {
  public constructor(
    private readonly root: HTMLElement,
    private readonly position: NotificationPosition,
  ) {}

  public async enter(): Promise<void> {
    const anim = this.root.animate(getEnterKeyframes(this.position), {
      duration: 260,
      easing: 'cubic-bezier(0.2, 0.9, 0.2, 1)',
      fill: 'forwards',
    });
    await anim.finished.catch(() => undefined);
    this.root.classList.add('entered');
  }

  public async exit(): Promise<void> {
    const anim = this.root.animate(getExitKeyframes(this.position), {
      duration: 220,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      fill: 'forwards',
    });
    await anim.finished.catch(() => undefined);
    this.root.classList.add('exiting');
  }

  public reposition(newY: number): void {
    if (!Number.isFinite(newY)) return;
    this.root.style.transition = 'top 300ms cubic-bezier(0.2, 0.9, 0.2, 1)';
    this.root.style.top = `${Math.floor(newY)}px`;
  }
}

