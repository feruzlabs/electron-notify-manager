export function enter(el: HTMLElement): void {
  requestAnimationFrame(() => {
    el.classList.add('entered');
    el.classList.remove('entering');
  });
}

export function exit(el: HTMLElement): void {
  el.classList.add('exiting');
  el.classList.remove('entered');
}

