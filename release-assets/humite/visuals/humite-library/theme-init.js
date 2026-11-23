(() => {
  const root = document.documentElement;
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const themePreferenceKey = 'humite-theme-preference';
  const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function readParentTheme() {
    try {
      if (window.parent && window.parent !== window) {
        const parentTheme = window.parent.document.documentElement.dataset.humiteTheme;
        if (parentTheme === 'night' || parentTheme === 'paper' || parentTheme === 'white') {
          return parentTheme;
        }
      }
    } catch {
      // Cross-origin embedding falls back to local storage or media preference.
    }
    return null;
  }

  function readStoredTheme() {
    try {
      const stored = window.localStorage.getItem(themePreferenceKey);
      if (stored === 'NIGHT') return 'night';
      if (stored === 'PAPER' || stored === 'WHITE') return stored.toLowerCase();
    } catch {
      // Ignore storage access failures in restricted environments.
    }
    return null;
  }

  function resolveTheme() {
    const queryTheme = new URLSearchParams(window.location.search).get('theme');
    if (queryTheme === 'night' || queryTheme === 'paper' || queryTheme === 'white' || queryTheme === 'light') {
      return queryTheme === 'night' ? 'night' : 'light';
    }
    const explicit = readParentTheme() || readStoredTheme();
    if (explicit) return explicit === 'night' ? 'night' : 'light';
    return media && media.matches ? 'night' : 'light';
  }

  function applyTheme() {
    const mode = resolveTheme();
    const isNight = mode === 'night';
    const prev = root.dataset.humiteTheme;
    root.dataset.humiteTheme = mode;
    root.style.colorScheme = isNight ? 'dark' : 'light';
    if (themeMeta) themeMeta.setAttribute('content', isNight ? '#141413' : '#f4efe3');
    if (prev && prev !== mode) {
      window.dispatchEvent(new CustomEvent('humite:theme-change', { detail: { theme: mode, isNight } }));
    }
  }

  applyTheme();

  let observer = null;
  try {
    if (window.parent && window.parent !== window && typeof MutationObserver === 'function') {
      observer = new MutationObserver(applyTheme);
      observer.observe(window.parent.document.documentElement, {
        attributes: true,
        attributeFilter: ['data-humite-theme'],
      });
    }
  } catch {
    // Ignore cross-origin parent observation errors.
  }

  const handleStorage = (event) => {
    if (event.key === null || event.key === themePreferenceKey) applyTheme();
  };
  window.addEventListener('storage', handleStorage);

  const supportsMediaEventListener = Boolean(media && typeof media.addEventListener === 'function');
  if (supportsMediaEventListener) {
    media.addEventListener('change', applyTheme);
  } else {
    media?.addListener?.(applyTheme);
  }

  window.addEventListener('pagehide', () => {
    observer?.disconnect();
    observer = null;
    window.removeEventListener('storage', handleStorage);
    if (supportsMediaEventListener) {
      media.removeEventListener('change', applyTheme);
    } else {
      media?.removeListener?.(applyTheme);
    }
  }, { once: true });
})();
