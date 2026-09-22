/* HCB deck — vanilla JS, no dependencies */
(function () {
  'use strict';

  const slides = Array.from(document.querySelectorAll('.slide'));
  const deck = document.getElementById('deck');
  const notes = document.getElementById('notes');
  const help = document.getElementById('help');
  const lb = document.getElementById('lb');
  const flash = document.getElementById('flash');
  let cur = -1;

  /* ---------- gallery data (contact sheet) ---------- */
  const R = 'https://www.moma.org/media/';
  const GALLERY = [
    { src: 'img/06-coronation-george-vi-1937.jpg', remote: 'https://www.henricartierbresson.org/wp-content/uploads/2023/03/1.jpg', fn: '37A', y: '1937 · London', t: 'Coronation of King George VI', txt: 'Sent by a newspaper to photograph the king, he photographed <b>the crowd</b>. Everybody looks up; one man sleeps on a bed of newspapers. <b>Framing:</b> the wall cuts the picture in two; <b>line:</b> the row of heads leads the eye across.', q: '"You have an assignment to photograph the coronation of the king, and you decide not to photograph the king."', qs: 'Clément Chéroux, curator' },
    { src: 'img/09-shanghai-gold-rush-1948.jpg', remote: R + 'W1siZiIsIjMzNDY0OSJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MjAwMFx1MDAzZSJdXQ.jpg?sha=9dd4fe3085df9f20', fn: '48B', y: 'December 1948 · Shanghai', t: 'Gold Rush', txt: 'The last days of the Kuomintang. Paper money is collapsing; thousands queue for hours to exchange it for gold. Some are crushed to death. <b>Composition:</b> a diagonal of bodies, chaos held together by <b>rhythm</b> — repeated faces, repeated arms.', q: '"I have never been a storyteller."', qs: 'Henri Cartier-Bresson' },
    { src: 'img/08-srinagar-kashmir-1948.jpg', remote: R + 'W1siZiIsIjE1OTM2NiJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MjAwMFx1MDAzZSJdXQ.jpg?sha=754f41ffd3b00b11', fn: '48C', y: '1948 · Srinagar, Kashmir', t: 'Women praying on the hill', txt: 'Muslim women pray toward the sun rising over the Himalayas. One woman opens her arm as if <b>releasing the clouds like doves</b>. <b>Balance:</b> figures on the left, mountains on the right; <b>form:</b> the shawls become soft sculptures.', q: '"…as if she is releasing the distant clouds into the air like doves."', qs: 'New Orleans Museum of Art' },
    { src: 'img/10-rue-mouffetard-1954.jpg', remote: R + 'W1siZiIsIjE4MjA0MCJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MjAwMFx1MDAzZSJdXQ.jpg?sha=8255c81dbd2aa401', fn: '54A', y: '1954 · Paris', t: 'Rue Mouffetard', txt: 'A boy carries two bottles of wine and wears the proudest face in Paris. <b>Depth of field:</b> shallow — the street blurs, the boy is sharp. <b>Exposure:</b> soft overcast light, no hard shadows. A decisive moment of <em>feeling</em>, not action.', q: '"The camera is a sketchbook, an instrument of intuition and spontaneity."', qs: 'Henri Cartier-Bresson' },
    { src: 'img/12-giacometti-rue-dalesia-1961.jpg', remote: R + 'W1siZiIsIjEyNjU1MiJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MjAwMFx1MDAzZSJdXQ.jpg?sha=67b07b1b33c04391', fn: '61B', y: '1961 · Paris, rue d\'Alésia', t: 'Alberto Giacometti', txt: 'The sculptor crosses the street in the rain, coat over his head — and looks exactly like his own thin, walking sculptures. <b>Line:</b> vertical rain, vertical man, vertical trees; <b>shape:</b> a silhouette against grey.', q: '"…a hunching posture nearly resembling his sculptures."', qs: 'Sotheby\'s catalogue note' },
    { src: 'img/11-matisse-vence-1944.jpg', remote: R + 'W1siZiIsIjE1OTg0NCJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MjAwMFx1MDAzZSJdXQ.jpg?sha=2f9fd27cbd5e880b', fn: '44A', y: 'February 1944 · Vence', t: 'Henri Matisse', txt: 'The old painter draws his doves at home during the war. Cartier-Bresson sat in a corner for hours. <b>Available light</b> from the window; <b>texture:</b> feathers, wool, paper. Matisse later designed the cover of <em>The Decisive Moment</em>.', q: '"I\'d sit in a corner, I didn\'t move, we didn\'t talk."', qs: 'Henri Cartier-Bresson' },
    { src: 'img/05-banks-of-the-marne-1938.jpg', remote: R + 'W1siZiIsIjUxNzQ4NiJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MjAwMFx1MDAzZSJdXQ.jpg?sha=0036b627924bec8e', fn: '38C', y: '1938 · Juvisy, France', t: 'Sunday on the Banks of the Marne', txt: 'A family picnic, seen from behind, in the first summer of paid holidays in France. <b>No horizon</b> — the water fills the top, which flattens the space and makes the picture almost abstract. <b>Proportion:</b> the boat is tiny, the bottles are huge.', q: '"There is no horizon… that flattens out and simplifies the whole thing."', qs: 'Peter Galassi, MoMA' },
    { src: 'img/13-simiane-la-rotonde-1969.jpg', remote: 'https://content.ngv.vic.gov.au/retrieve.php?size=1280&type=image&vernonID=146913', fn: '69A', y: '1969 · Simiane-la-Rotonde', t: 'Children in a circle', txt: 'Late work: quiet, geometric, almost drawn. Children play in a circle under the round village on the hill. <b>Shape:</b> circle inside a circle; <b>balance:</b> the dome above, the ring of children below. The painter has come back.', q: '"Photography is not a meditation… Drawing is a form of meditation."', qs: 'Henri Cartier-Bresson, 1995' },
  ];

  /* ---------- image fallback: local first, remote if missing ---------- */
  function fallback(img) {
    const r = img.getAttribute('data-remote');
    if (r && img.src.indexOf(r) === -1) { img.src = r; }
  }
  document.addEventListener('error', e => { if (e.target && e.target.tagName === 'IMG') fallback(e.target); }, true);

  /* ---------- build contact sheet ---------- */
  const sheet = document.getElementById('sheet');
  GALLERY.forEach((g, i) => {
    const f = document.createElement('div');
    f.className = 'frame rv';
    f.style.setProperty('--i', 3 + i * 0.6);
    f.innerHTML = `<span class="fn">${g.fn}</span><img src="${g.src}" data-remote="${g.remote}" alt="${g.t}" loading="lazy"><div class="fc"><b>${g.t}</b><span>${g.y.split(' · ')[0]}</span></div>`;
    f.addEventListener('click', () => openLB(i));
    sheet.appendChild(f);
  });

  /* ---------- lightbox ---------- */
  let lbi = 0;
  function openLB(i) {
    lbi = (i + GALLERY.length) % GALLERY.length;
    const g = GALLERY[lbi];
    const im = document.getElementById('lbImg');
    im.src = g.src; im.setAttribute('data-remote', g.remote); im.alt = g.t;
    document.getElementById('lbY').textContent = g.y;
    document.getElementById('lbT').textContent = g.t;
    document.getElementById('lbTxt').innerHTML = g.txt;
    document.getElementById('lbQ').innerHTML = g.q + `<small>${g.qs}</small>`;
    lb.classList.add('open');
  }
  function closeLB() { lb.classList.remove('open'); }
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('x')) closeLB(); });

  /* ---------- progress bar (segments by presenter) ---------- */
  const progress = document.getElementById('progress');
  const groups = [];
  slides.forEach((s, i) => {
    const p = s.dataset.p;
    const last = groups[groups.length - 1];
    if (last && last.p === p) { last.n++; last.to = i; }
    else groups.push({ p, n: 1, from: i, to: i });
  });
  groups.forEach(g => {
    const el = document.createElement('span');
    el.dataset.p = g.p; el.style.setProperty('--w', g.n);
    el.innerHTML = '<i></i>'; g.el = el; progress.appendChild(el);
  });
  function paintProgress(i) {
    groups.forEach(g => {
      let f = 0;
      if (i > g.to) f = 1;
      else if (i >= g.from) f = (i - g.from + 1) / g.n;
      g.el.querySelector('i').style.setProperty('--f', f);
    });
  }

  /* ---------- shutter sound (WebAudio, synthesized) ---------- */
  let actx = null, muted = false;
  function click() {
    if (muted) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime;
      const burst = (t0, dur, gain, freq) => {
        const buf = actx.createBuffer(1, actx.sampleRate * dur, actx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
        const src = actx.createBufferSource(); src.buffer = buf;
        const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = .8;
        const g = actx.createGain(); g.gain.value = gain;
        src.connect(bp); bp.connect(g); g.connect(actx.destination); src.start(t0);
      };
      burst(t, .045, .9, 2200);        // mirror up
      burst(t + .07, .09, .6, 900);    // curtain
    } catch (e) { /* no audio, fine */ }
  }

  /* ---------- counters ---------- */
  function runCounters(slide) {
    slide.querySelectorAll('[data-count]').forEach(el => {
      const target = +el.dataset.count; const t0 = performance.now(); const dur = 900;
      const tick = now => {
        const k = Math.min(1, (now - t0) / dur); const e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(target * e);
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---------- word-by-word quotes ---------- */
  document.querySelectorAll('[data-words]').forEach(q => {
    let i = 0;
    const walk = node => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(w => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = w; frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.tagName === 'BR') { /* keep */ }
        else walk(n);
      });
    };
    walk(q);
  });

  /* ---------- flip cards ---------- */
  document.querySelectorAll('.rule-card').forEach(c => c.addEventListener('click', () => c.classList.toggle('flip')));

  /* ---------- overlay keys (composition studies) ---------- */
  function toggleKey(slide, k) {
    const list = slide.querySelector('.keys-list'); if (!list) return false;
    const ov = slide.querySelector(`.ov[data-ov="${list.dataset.for}"]`);
    const btn = list.querySelector(`.key[data-k="${k}"]`); if (!btn) return false;
    const on = !btn.classList.contains('on');
    btn.classList.toggle('on', on);
    const g = ov && ov.querySelector(`[data-k="${k}"]`); if (g) g.classList.toggle('on', on);
    return true;
  }
  document.querySelectorAll('.keys-list .key').forEach(b => b.addEventListener('click', () => toggleKey(b.closest('.slide'), b.dataset.k)));

  /* ---------- video: load iframe only on its slide ---------- */
  function loadVideo(slide, on) {
    const f = slide.querySelector('iframe[data-src]'); if (!f) return;
    if (on) { if (!f.src) f.src = f.dataset.src; }
    else if (f.src) { f.removeAttribute('src'); }
  }

  /* ---------- navigation ---------- */
  function frags(s) { return Array.from(s.querySelectorAll('.frag')); }
  function syncTimeline(s) {
    const tl = s.querySelector('.tl'); if (!tl) return;
    const pts = tl.querySelectorAll('.pt'); const on = tl.querySelectorAll('.pt.on').length;
    // bar reaches the dot of the last lit year (dots sit at the left edge of each column)
    const pct = on === 0 ? 0 : ((on - 1) / pts.length) * 100 + (100 / pts.length) * 0.08;
    tl.style.setProperty('--tl', pct + '%');
  }

  function go(i, dir) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i === cur) return;
    if (cur >= 0) {
      const old = slides[cur];
      old.classList.remove('active');
      loadVideo(old, false);
    }
    cur = i;
    const s = slides[cur];
    s.classList.add('active');
    // reset fragments when arriving forward; show all when arriving backward
    frags(s).forEach(f => f.classList.toggle('on', dir < 0));
    if (dir < 0) s.querySelectorAll('.iris').forEach(x => x.classList.add('on'));
    else s.querySelectorAll('.iris').forEach(x => x.classList.remove('on'));
    runCounters(s);
    syncTimeline(s);
    loadVideo(s, true);
    paintProgress(cur);
    updateHUD();
    location.hash = String(cur + 1);
  }

  function next() {
    const s = slides[cur];
    const pending = frags(s).filter(f => !f.classList.contains('on'));
    if (pending.length) {
      const f = pending[0]; f.classList.add('on');
      if (f.dataset.fx === 'shutter') {
        click();
        flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
        const breath = s.querySelector('#breath'); if (breath) breath.style.opacity = 0;
        setTimeout(() => f.querySelectorAll('.iris').forEach(x => x.classList.add('on')), 60);
      }
      syncTimeline(s);
      return;
    }
    go(cur + 1, 1);
  }
  function prev() {
    const s = slides[cur];
    const shown = frags(s).filter(f => f.classList.contains('on'));
    if (shown.length) {
      const f = shown[shown.length - 1]; f.classList.remove('on');
      if (f.dataset.fx === 'shutter') { f.querySelectorAll('.iris').forEach(x => x.classList.remove('on')); const b = s.querySelector('#breath'); if (b) b.style.opacity = ''; }
      syncTimeline(s);
      return;
    }
    go(cur - 1, -1);
  }

  /* ---------- HUD + notes ---------- */
  const NAMES = { marco: '1', shun: '2', andy: '3' };
  function updateHUD() {
    const s = slides[cur];
    const n = s.querySelector('aside.n');
    const who = n ? n.dataset.who : NAMES[s.dataset.p];
    document.getElementById('hudWho').textContent = who;
    document.getElementById('hudNum').textContent = `${cur + 1} / ${slides.length}`;
    document.querySelector('.hud .dot').style.background = `var(--${s.dataset.p})`;
    document.querySelector('.hud .dot').style.boxShadow = `0 0 18px var(--${s.dataset.p})`;
    document.getElementById('notesWho').textContent = who;
    document.getElementById('notesWho').style.color = `var(--${s.dataset.p})`;
    document.getElementById('notesT').textContent = n ? n.dataset.t : '';
    document.getElementById('notesBody').innerHTML = n ? n.innerHTML : '';
  }

  /* ---------- keyboard ---------- */
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (help.classList.contains('open')) { help.classList.remove('open'); e.preventDefault(); return; }
    if (lb.classList.contains('open')) {
      if (e.key === 'Escape') closeLB();
      else if (e.key === 'ArrowRight' || e.key === ' ') openLB(lbi + 1);
      else if (e.key === 'ArrowLeft') openLB(lbi - 1);
      e.preventDefault(); return;
    }
    const s = slides[cur];
    switch (e.key) {
      case 'ArrowRight': case ' ': case 'PageDown': case 'Enter': next(); e.preventDefault(); break;
      case 'ArrowLeft': case 'PageUp': case 'Backspace': prev(); e.preventDefault(); break;
      case 'Home': go(0, -1); break;
      case 'End': go(slides.length - 1, 1); break;
      case 'n': case 'N': notes.classList.toggle('open'); break;
      case 'f': case 'F': if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); break;
      case 's': case 'S': muted = !muted; break;
      case '?': case 'h': case 'H': help.classList.add('open'); break;
      case 'g': case 'G': { const v = parseInt(prompt('Go to slide (1–' + slides.length + ')'), 10); if (v) go(v - 1, 1); break; }
      case 'Escape': if (document.fullscreenElement) document.exitFullscreen(); break;
      default:
        if (/^[1-6a-dA-D]$/.test(e.key)) { if (toggleKey(s, e.key.toUpperCase()) || toggleKey(s, e.key)) e.preventDefault(); }
    }
  });

  /* ---------- touch / click ---------- */
  let tx = null;
  deck.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  deck.addEventListener('touchend', e => {
    if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 60) (dx < 0 ? next() : prev());
  });
  deck.addEventListener('click', e => {
    if (e.target.closest('button, .rule-card, .frame, .pt, a, iframe, .video')) return;
    const x = e.clientX / window.innerWidth;
    if (x > 0.8) next(); else if (x < 0.2) prev();
  });

  /* ---------- map keys 1-6 / A-D to overlay ids ---------- */
  // analysis slide uses data-k names; map digits & letters to them
  const KEYMAP = { '1': 'timing', '2': 'mirror', '3': 'echo', '4': 'line', '5': 'rhythm', '6': 'crop', 'A': 'frame', 'B': 'depth', 'C': 'texture', 'D': 'light' };
  const _toggleKey = toggleKey;
  toggleKey = function (slide, k) { return _toggleKey(slide, KEYMAP[k] || k); };

  /* ---------- start ---------- */
  const h = parseInt((location.hash || '').replace('#', ''), 10);
  go(h ? h - 1 : 0, 1);
  window.addEventListener('hashchange', () => { const v = parseInt(location.hash.replace('#', ''), 10); if (v && v - 1 !== cur) go(v - 1, v - 1 > cur ? 1 : -1); });

  // Preload the first few photos so the hook opens instantly
  ['img/01-gare-saint-lazare-1932.jpg', 'img/15-hcb-portrait-with-leica-1954.jpg', 'img/14-brussels-1932.jpg'].forEach(u => { const im = new Image(); im.src = u; });
})();
