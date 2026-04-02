function getEnterKeyframes(position) {
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

function getExitKeyframes(position) {
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
  constructor(root, position) {
    this.root = root;
    this.position = position;
  }

  async enter() {
    const anim = this.root.animate(getEnterKeyframes(this.position), {
      duration: 260,
      easing: 'cubic-bezier(0.2, 0.9, 0.2, 1)',
      fill: 'forwards',
    });
    try {
      await anim.finished;
    } catch {
      // ignore
    }
    this.root.classList.add('entered');
  }

  async exit() {
    const anim = this.root.animate(getExitKeyframes(this.position), {
      duration: 220,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      fill: 'forwards',
    });
    try {
      await anim.finished;
    } catch {
      // ignore
    }
    this.root.classList.add('exiting');
  }

  reposition(newY) {
    if (!Number.isFinite(newY)) return;
    this.root.style.transition = 'top 300ms cubic-bezier(0.2, 0.9, 0.2, 1)';
    this.root.style.top = `${Math.floor(newY)}px`;
  }
}

