/* 株式会社桜花 site script (no inline scripts: CSP script-src 'self') */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 右側のタブが、少し遅れてなめらかについてくる */
  function followTabs() {
    var tabs = document.querySelector('.sidetabs');
    if (!tabs) return;
    var root = tabs.offsetParent || tabs.parentElement;
    var BASE = 120, cur = 0, raf = 0;
    tabs.style.position = 'absolute';
    tabs.style.top = BASE + 'px';
    tabs.style.willChange = 'transform';
    function target() {
      var y = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0);
      var max = Math.max(0, root.offsetHeight - tabs.offsetHeight - BASE - 40);
      return Math.min(max, y);
    }
    function step() {
      var t = target(), d = t - cur;
      cur = (reduce || Math.abs(d) < 0.5) ? t : cur + d * 0.09;
      tabs.style.transform = 'translate3d(0,' + cur.toFixed(1) + 'px,0)';
      raf = cur === t ? 0 : window.requestAnimationFrame(step);
    }
    function kick() { if (!raf) raf = window.requestAnimationFrame(step); }
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    kick();
  }

  /* 動きを減らす設定の方には、トップの動画を止めてポスター画像を見せる */
  function heroVideo() {
    if (!reduce) return;
    var v = document.querySelectorAll('video[autoplay]');
    for (var i = 0; i < v.length; i++) { v[i].removeAttribute('autoplay'); v[i].pause(); }
  }

  /* お問い合わせフォーム:送信用のワンタイムトークンを取得 */
  function contactForm() {
    var form = document.getElementById('contact-form');
    var tok = document.getElementById('f-token');
    if (!form || !tok || !window.fetch) return;
    var btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    fetch('/contact/token.php', { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.token) { tok.value = j.token; if (btn) btn.disabled = false; } })
      .catch(function () { if (btn) btn.disabled = false; });
    form.addEventListener('submit', function () { if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); } });
  }

  /* 応募フォーム:募集要項から来たときは職種を選んだ状態にする */
  function presetJob() {
    var sel = document.getElementById('f-job');
    if (!sel || !window.URLSearchParams) return;
    var job = new URLSearchParams(window.location.search).get('job');
    if (!job) return;
    for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].value === job) { sel.selectedIndex = i; break; } }
  }

  /* お問い合わせフォーム:メディアの方へのページから来たときは「取材のご依頼」を選んだ状態にする */
  function presetKind() {
    if (!window.URLSearchParams) return;
    var kind = new URLSearchParams(window.location.search).get('kind');
    if (!kind || !/^[a-z]+$/.test(kind)) return;
    var r = document.querySelector('#contact-form input[name="kind"][value="' + kind + '"]');
    if (r) r.checked = true;
  }

  function init() { followTabs(); heroVideo(); presetJob(); presetKind(); contactForm(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
