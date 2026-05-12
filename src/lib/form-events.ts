// Global event system for opening the proefles form from anywhere in the app.
// Components dispatch 'openProeflesForm', listeners (e.g. StickyCTA or ClientPage) catch it.

export function openProeflesForm() {
  window.dispatchEvent(new CustomEvent('openProeflesForm'));
}

export function onOpenProeflesForm(callback: () => void) {
  const handler = () => callback();
  window.addEventListener('openProeflesForm', handler);
  return () => window.removeEventListener('openProeflesForm', handler);
}
