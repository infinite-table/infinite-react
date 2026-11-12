/*
 * Runs before first paint (plain script in <head>): picks the color mode and
 * the page to show, so nothing flashes.
 *   ?theme=light|dark   ?page=home|docs   ?bar=0 (hide the prototype bar)
 */
(function () {
  var el = document.documentElement;
  var params = new URLSearchParams(location.search);
  var theme = params.get('theme');
  try {
    if (theme !== 'light' && theme !== 'dark') {
      theme = localStorage.getItem('it-redesign-theme');
    }
  } catch (e) {}
  if (theme !== 'light' && theme !== 'dark') {
    theme =
      window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  }
  el.setAttribute('data-theme', theme);
  el.setAttribute('data-page', params.get('page') === 'docs' ? 'docs' : 'home');
  el.setAttribute('data-framework', 'react');
  if (params.get('bar') === '0') el.setAttribute('data-no-bar', '');
})();
