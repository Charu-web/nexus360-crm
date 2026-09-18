/**
 * theme.js — Shared Theme Utility for Nexus360
 */
(function () {
  const saved = localStorage.getItem('crm_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();

window.CRMTheme = {
  get() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  },
  set(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('crm_theme', theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      const icon = btn.querySelector('.theme-icon');
      if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    });
  },
  toggle() {
    const next = this.get() === 'dark' ? 'light' : 'dark';
    this.set(next);
    return next;
  },
  init(btnSelector) {
    const btns = document.querySelectorAll(btnSelector || '[data-theme-toggle]');
    btns.forEach(btn => {
      const icon = btn.querySelector('.theme-icon');
      if (icon) icon.textContent = this.get() === 'dark' ? '☀️' : '🌙';
      btn.title = this.get() === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      btn.addEventListener('click', () => {
        const next = this.toggle();
        btn.style.transform = 'scale(0.85)';
        setTimeout(() => { btn.style.transform = ''; }, 150);
      });
    });
  }
};
