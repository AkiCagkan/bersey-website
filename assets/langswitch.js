/* BERSEY — dil değiştirici (TR kök · en/ · ru/). Tüm sayfalarda yüklenir. */
(function () {
  var lang = (document.documentElement.lang || 'tr').slice(0, 2).toLowerCase();
  if (lang !== 'en' && lang !== 'ru') lang = 'tr';
  var page = location.pathname.split('/').pop() || 'index.html';
  if (!/\.html$/.test(page)) page = 'index.html';

  var hrefs = lang === 'tr'
    ? { tr: page, en: 'en/' + page, ru: 'ru/' + page }
    : { tr: '../' + page,
        en: (lang === 'en' ? page : '../en/' + page),
        ru: (lang === 'ru' ? page : '../ru/' + page) };

  var css = '.lang-switch{display:flex;gap:2px;align-items:center;margin-left:14px;' +
    'border:1px solid var(--line,#D9DEE2);border-radius:999px;padding:3px}' +
    '.lang-switch a{font-size:12px;font-weight:600;text-decoration:none;padding:3px 9px;' +
    'border-radius:999px;color:var(--gray,#7B7B7B);letter-spacing:.4px}' +
    '.lang-switch a:hover{color:var(--head,#0A3A5C);text-decoration:none}' +
    '.lang-switch a.on{background:var(--head,#0A3A5C);color:#fff}' +
    '@media(max-width:960px){.lang-switch{margin-left:auto;margin-right:10px}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var box = document.createElement('div');
  box.className = 'lang-switch';
  ['tr', 'en', 'ru'].forEach(function (l) {
    var a = document.createElement('a');
    a.href = hrefs[l];
    a.textContent = l.toUpperCase();
    a.setAttribute('hreflang', l);
    if (l === lang) a.className = 'on';
    box.appendChild(a);
  });

  function insert() {
    var header = document.querySelector('header');
    if (!header) return;
    var btn = header.querySelector('.menu-btn');
    if (btn) header.insertBefore(box, btn); else header.appendChild(box);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insert);
  } else insert();
})();
