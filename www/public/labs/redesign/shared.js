/*
 * Behaviour shared by the three direction prototypes. Markup hooks:
 *
 *   [data-toggle-theme]            flips light/dark
 *   [data-set-accent="ember|ion"]  direction D's accent palette (<html data-accent>)
 *   [data-goto-page="home|docs"]   switches the page shown
 *   [data-set-framework="react|vue"]  the React | Vue switcher seam
 *     ([data-fw="react|vue"] content follows it)
 *   [data-copy="text"]             copies; gets [data-copied] for 1.5s
 *   [data-open-search] + <dialog data-search>  command-K search
 *     (an <input> inside filters the [data-search-item] entries)
 *   [data-tick]                    a number that random-walks; gets
 *     .is-up / .is-down for 700ms on each change
 *   [data-grid-demo="themes|million|pivot|grouped"]  a live Infinite Table
 *     (see grid-demos.js)
 */

const root = document.documentElement;
const params = new URLSearchParams(location.search);

const DIRECTIONS = [
  { id: 'a', label: 'A · Terminal' },
  { id: 'b', label: 'B · Aurora' },
  { id: 'c', label: 'C · Paper' },
  { id: 'd', label: 'D · Orbit' },
  { id: 'e', label: 'E · Vector' },
  { id: 'f', label: 'F · Breeze' },
];

function syncUrl() {
  const next = new URLSearchParams(location.search);
  next.set('page', root.dataset.page);
  next.set('theme', root.dataset.theme);
  if (root.dataset.direction === 'd') next.set('accent', root.dataset.accent);
  history.replaceState(null, '', `${location.pathname}?${next}${location.hash}`);
}

function setTheme(theme) {
  root.dataset.theme = theme;
  try {
    localStorage.setItem('it-redesign-theme', theme);
  } catch {}
  syncUrl();
  renderBar();
}

function setAccent(accent) {
  root.dataset.accent = accent;
  try {
    localStorage.setItem('it-redesign-accent', accent);
  } catch {}
  syncUrl();
  renderBar();
}

function setPage(page) {
  root.dataset.page = page;
  syncUrl();
  renderBar();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function setFramework(framework) {
  root.dataset.framework = framework;
  document.querySelectorAll('[data-set-framework]').forEach((el) => {
    el.setAttribute(
      'aria-pressed',
      String(el.dataset.setFramework === framework),
    );
  });
}

/* ---- prototype bar ------------------------------------------------------ */

let bar;
function renderBar() {
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'proto-bar';
    document.body.appendChild(bar);
  }
  const current = root.dataset.direction;
  const { page, theme } = root.dataset;
  const q = `?page=${page}&theme=${theme}`;
  bar.innerHTML = `
    <span class="proto-bar__label">Direction</span>
    <span class="proto-bar__group">
      ${DIRECTIONS.map(
        (d) =>
          `<a href="./${d.id}.html${q}" aria-current="${d.id === current}">${d.label}</a>`,
      ).join('')}
    </span>
    <span class="proto-bar__group">
      <button data-goto-page="home" aria-pressed="${page === 'home'}">Home</button>
      <button data-goto-page="docs" aria-pressed="${page === 'docs'}">Docs</button>
    </span>
    <span class="proto-bar__group">
      <button data-set-theme="light" aria-pressed="${theme === 'light'}">Light</button>
      <button data-set-theme="dark" aria-pressed="${theme === 'dark'}">Dark</button>
    </span>
    ${
      current === 'd'
        ? `<span class="proto-bar__group">
      <button data-set-accent="ember" aria-pressed="${root.dataset.accent !== 'ion'}">Ember</button>
      <button data-set-accent="ion" aria-pressed="${root.dataset.accent === 'ion'}">Ion</button>
    </span>`
        : ''
    }
    <a href="./index.html">All</a>`;
}

/* ---- delegated clicks --------------------------------------------------- */

document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const themeToggle = target.closest('[data-toggle-theme]');
  if (themeToggle) {
    event.preventDefault();
    setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    return;
  }
  const themeSet = target.closest('[data-set-theme]');
  if (themeSet) {
    event.preventDefault();
    setTheme(themeSet.dataset.setTheme);
    return;
  }
  const accentSet = target.closest('[data-set-accent]');
  if (accentSet) {
    event.preventDefault();
    setAccent(accentSet.dataset.setAccent);
    return;
  }
  const goto = target.closest('[data-goto-page]');
  if (goto) {
    event.preventDefault();
    setPage(goto.dataset.gotoPage);
    return;
  }
  const framework = target.closest('[data-set-framework]');
  if (framework) {
    event.preventDefault();
    setFramework(framework.dataset.setFramework);
    return;
  }
  const copy = target.closest('[data-copy]');
  if (copy) {
    event.preventDefault();
    navigator.clipboard?.writeText(copy.dataset.copy).catch(() => {});
    copy.setAttribute('data-copied', '');
    setTimeout(() => copy.removeAttribute('data-copied'), 1500);
    return;
  }
  const search = target.closest('[data-open-search]');
  if (search) {
    event.preventDefault();
    openSearch();
  }
});

/* ---- command-K search --------------------------------------------------- */

function searchDialog() {
  const all = [...document.querySelectorAll('dialog[data-search]')];
  return all.find((d) => d.offsetParent !== null || d.open) ?? all[0];
}

function openSearch() {
  const dialog = searchDialog();
  if (!dialog || dialog.open) return;
  dialog.showModal();
  const input = dialog.querySelector('input');
  if (input) {
    input.value = '';
    filterSearch(dialog, '');
    input.focus();
  }
}

function filterSearch(dialog, text) {
  const needle = text.trim().toLowerCase();
  dialog.querySelectorAll('[data-search-item]').forEach((item) => {
    item.hidden = !!needle && !item.textContent.toLowerCase().includes(needle);
  });
}

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openSearch();
  }
});
document.addEventListener('input', (event) => {
  const dialog = event.target.closest?.('dialog[data-search]');
  if (dialog) filterSearch(dialog, event.target.value);
});
document.addEventListener('click', (event) => {
  // a click on the backdrop closes the dialog
  if (event.target instanceof HTMLDialogElement && event.target.open) {
    event.target.close();
  }
});

/* ---- ticking numbers ---------------------------------------------------- */

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function setupTicks() {
  const cells = [...document.querySelectorAll('[data-tick]')].map((el) => {
    const text = el.textContent.trim();
    const match = text.match(/^([^\d+\-−]*)([+\-−]?)([\d,]*\.?\d+)(.*)$/);
    if (!match) return null;
    const [, prefix, sign, digits, suffix] = match;
    const decimals = (digits.split('.')[1] || '').length;
    const value =
      parseFloat(digits.replace(/,/g, '')) * (sign && sign !== '+' ? -1 : 1);
    return {
      el,
      prefix,
      suffix,
      decimals,
      signed: !!sign,
      value,
      // how far a tick moves it, as a share of the value (or absolute for %)
      step: parseFloat(el.dataset.tick) || 0.004,
      percent: suffix.trim().startsWith('%'),
    };
  });
  const live = cells.filter(Boolean);
  if (!live.length) return;

  const format = (cell) => {
    const abs = Math.abs(cell.value).toLocaleString('en-US', {
      minimumFractionDigits: cell.decimals,
      maximumFractionDigits: cell.decimals,
    });
    const sign = cell.value < 0 ? '−' : cell.signed ? '+' : '';
    return `${cell.prefix}${sign}${abs}${cell.suffix}`;
  };

  setInterval(
    () => {
      if (document.hidden) return;
      const count = Math.max(1, Math.round(live.length * 0.22));
      for (let i = 0; i < count; i++) {
        const cell = live[Math.floor(Math.random() * live.length)];
        if (cell.el.offsetParent === null) continue;
        const drift = (Math.random() - 0.48) * 2;
        const delta = cell.percent
          ? drift * 0.09
          : drift * cell.step * Math.max(1, Math.abs(cell.value));
        cell.value += delta;
        cell.el.textContent = format(cell);
        const up = delta >= 0;
        cell.el.classList.toggle('is-up', up);
        cell.el.classList.toggle('is-down', !up);
        if (cell.signed) {
          cell.el.toggleAttribute('data-negative', cell.value < 0);
        }
        clearTimeout(cell.timer);
        cell.timer = setTimeout(
          () => cell.el.classList.remove('is-up', 'is-down'),
          700,
        );
      }
    },
    reducedMotion ? 2400 : 650,
  );
}

/* ---- live grid demos, loaded when one nears the viewport ---------------- */

function setupGridDemos() {
  const hosts = [...document.querySelectorAll('[data-grid-demo]')];
  if (!hosts.length || params.get('grids') === '0') return;
  let modulePromise;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        modulePromise ??= import('./grid-demos.js');
        modulePromise
          .then((mod) => mod.mountGridDemo(entry.target))
          .catch((error) => {
            console.error(error);
            entry.target.textContent = 'The live grid could not be loaded.';
          });
      }
    },
    { rootMargin: '600px 0px' },
  );
  hosts.forEach((host) => observer.observe(host));
}

renderBar();
setFramework(root.dataset.framework || 'react');
setupTicks();
setupGridDemos();
