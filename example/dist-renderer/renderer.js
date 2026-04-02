const LOG_ICONS = {
    shown: '●',
    closed: '○',
    updated: '↻',
    click: '↺',
    error: '!',
};
function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString();
}
function qs(selector) {
    const el = document.querySelector(selector);
    if (!el)
        throw new Error(`Missing element: ${selector}`);
    return el;
}
document.addEventListener('DOMContentLoaded', () => {
    const logEntries = qs('#logEntries');
    const sections = Array.from(document.querySelectorAll('[data-section]'));
    const sidebarItems = Array.from(document.querySelectorAll('[data-nav]'));
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (!target)
            return;
        const btn = target.closest('[data-action]');
        if (btn) {
            const action = btn.getAttribute('data-action');
            if (!action)
                return;
            window.electronAPI.trigger(action);
            return;
        }
        const nav = target.closest('[data-nav]');
        if (nav) {
            const id = nav.getAttribute('data-nav');
            if (!id)
                return;
            const section = document.getElementById(id);
            section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
    window.electronAPI.onLog((entry) => {
        appendLog(logEntries, entry);
    });
    function updateActiveNav() {
        const y = window.scrollY + 120;
        let current = null;
        for (const s of sections) {
            const rect = s.getBoundingClientRect();
            const top = rect.top + window.scrollY;
            if (top <= y)
                current = s.id;
        }
        for (const item of sidebarItems) {
            const id = item.getAttribute('data-nav');
            item.classList.toggle('active', id === current);
        }
    }
    let raf = null;
    window.addEventListener('scroll', () => {
        if (raf !== null)
            return;
        raf = window.requestAnimationFrame(() => {
            raf = null;
            updateActiveNav();
        });
    });
    updateActiveNav();
});
function appendLog(logEntries, entry) {
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
//# sourceMappingURL=renderer.js.map