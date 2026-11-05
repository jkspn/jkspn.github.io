/* Tiny progressive enhancement: reveal on scroll, active nav link, footer year. No dependencies. */
(function () {
  var d = document,
    root = d.documentElement;
  root.classList.add('js');
  /* Theme: Light / System / Dark. System (the default) follows the device; a manual pick is remembered on this device. */
  var sw = d.getElementById('theme-switch');
  if (sw) {
    var opts = [].slice.call(sw.querySelectorAll('button'));
    var saved = 'system';
    try {
      var t = localStorage.getItem('theme');
      if (t === 'light' || t === 'dark') saved = t;
    } catch (e) {}
    var canHover = window.matchMedia && window.matchMedia('(hover:hover)').matches;
    var paint = function (v) {
      opts.forEach(function (b) {
        b.setAttribute('aria-checked', b.getAttribute('data-theme-pref') === v ? 'true' : 'false');
      });
    };
    var apply = function (v) {
      if (v === 'system') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', v);
      try {
        if (v === 'system') localStorage.removeItem('theme');
        else localStorage.setItem('theme', v);
      } catch (e) {}
      paint(v);
    };
    paint(saved);
    opts.forEach(function (b) {
      b.addEventListener('click', function () {
        /* on touch, the first tap just opens the switch; the next tap picks */
        if (!canHover && !sw.classList.contains('open')) {
          sw.classList.add('open');
          return;
        }
        apply(b.getAttribute('data-theme-pref'));
        sw.classList.remove('open');
        if (canHover) b.blur();
      });
    });
    d.addEventListener('click', function (e) {
      if (!sw.contains(e.target)) sw.classList.remove('open');
    });
    sw.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        sw.classList.remove('open');
      }
    });
  }
  var fn = d.getElementById('float-nav');
  if (fn) {
    var pill = fn.querySelector('.pill'),
      ph = fn.querySelector('.navphoto'),
      mb = d.getElementById('menu-btn'),
      on = null;
    var mobile = function () {
      return window.matchMedia('(max-width: 720px)').matches;
    };
    // width of the pill when it hugs its content (measured on an off-screen clone in the scrolled state)
    var measure = function () {
      var c = fn.cloneNode(true);
      c.removeAttribute('id');
      c.classList.add('scrolled');
      c.classList.remove('menu-open');
      c.style.cssText =
        'position:fixed;left:-9999px;top:0;visibility:hidden;transform:none;width:auto;transition:none';
      var p = c.querySelector('.pill');
      p.style.cssText = 'width:max-content;transition:none';
      [].slice.call(c.querySelectorAll('*')).forEach(function (n) {
        n.style.transition = 'none';
      });
      d.body.appendChild(c);
      var w = p.getBoundingClientRect().width;
      d.body.removeChild(c);
      fn.style.setProperty('--hugw', Math.ceil(w) + 'px');
    };
    var setMenu = function (o) {
      fn.classList.toggle('menu-open', o);
      if (mb) mb.setAttribute('aria-expanded', o ? 'true' : 'false');
    };
    var chk = function () {
      var s = (window.scrollY || root.scrollTop) > 60;
      if (s !== on) {
        on = s;
        fn.classList.toggle('scrolled', s);
        if (s) {
          ph.removeAttribute('tabindex');
          ph.removeAttribute('aria-hidden');
        } else {
          ph.setAttribute('tabindex', '-1');
          ph.setAttribute('aria-hidden', 'true');
        }
      }
    };
    measure();
    chk();
    window.addEventListener('scroll', chk, { passive: true });
    window.addEventListener('resize', function () {
      measure();
      if (!mobile()) setMenu(false);
    });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(measure);
    if (mb) {
      mb.addEventListener('click', function (e) {
        e.stopPropagation();
        setMenu(!fn.classList.contains('menu-open'));
      });
      d.addEventListener('click', function (e) {
        if (fn.classList.contains('menu-open') && !fn.contains(e.target)) setMenu(false);
      });
      d.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && fn.classList.contains('menu-open')) {
          setMenu(false);
          mb.focus();
        }
      });
      fn.querySelector('.links').addEventListener('click', function () {
        setMenu(false);
      });
    }
  }
  // Download menus (CV / Selected Work dropdowns)
  var dls = [].slice.call(d.querySelectorAll('.dl')).map(function (box) {
    return { box: box, btn: box.querySelector('.dl-trigger'), menu: box.querySelector('.dl-menu') };
  });
  var closeDl = function (x, f) {
    x.menu.hidden = true;
    x.btn.setAttribute('aria-expanded', 'false');
    if (f) x.btn.focus();
  };
  dls.forEach(function (x) {
    x.btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var o = x.menu.hidden;
      dls.forEach(function (y) {
        closeDl(y, false);
      });
      x.menu.hidden = !o;
      x.btn.setAttribute('aria-expanded', o ? 'true' : 'false');
      if (o) {
        var a = x.menu.querySelector('a');
        if (a) a.focus();
      }
    });
    x.menu.addEventListener('click', function () {
      closeDl(x, false);
    });
  });
  d.addEventListener('click', function (e) {
    dls.forEach(function (x) {
      if (!x.menu.hidden && !x.menu.contains(e.target)) closeDl(x, false);
    });
  });
  d.addEventListener(
    'keydown',
    function (e) {
      if (e.key === 'Escape') {
        dls.forEach(function (x) {
          if (!x.menu.hidden) {
            e.preventDefault();
            e.stopPropagation();
            closeDl(x, true);
          }
        });
      }
    },
    true,
  );
  var dlg = d.getElementById('contact-dialog');
  // Contact dialog: opens from every "Let’s Chat" button
  if (dlg && typeof dlg.showModal === 'function') {
    var EMAIL = 'john@jkspn.xyz',
      form = d.getElementById('contact-form'),
      msg = d.getElementById('cf-message');
    [].slice.call(d.querySelectorAll('[data-contact]')).forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var t = d.getElementById('cd-status');
        if (t) {
          t.hidden = true;
          t.textContent = '';
        }
        dlg.showModal();
      });
    });
    d.getElementById('cd-close').addEventListener('click', function () {
      dlg.close();
    });
    var ce = d.getElementById('cd-copy-email'),
      ceT;
    if (ce)
      ce.addEventListener('click', function () {
        var lb = ce.querySelector('.copy-lbl');
        var done = function () {
          ce.classList.add('copied');
          lb.textContent = 'Copied';
          clearTimeout(ceT);
          ceT = setTimeout(function () {
            ce.classList.remove('copied');
            lb.textContent = 'Copy email';
          }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(EMAIL).then(done, function () {});
          return;
        }
        var ta = d.createElement('textarea');
        ta.value = EMAIL;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;opacity:0';
        d.body.appendChild(ta);
        ta.select();
        try {
          if (d.execCommand('copy')) done();
        } catch (x) {}
        d.body.removeChild(ta);
      });
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) dlg.close();
    });
    [].slice.call(form.querySelectorAll('[aria-describedby$="-err"]')).forEach(function (f) {
      f.addEventListener('input', function () {
        f.removeAttribute('aria-invalid');
        d.getElementById(f.id + '-err').hidden = true;
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nm = d.getElementById('cf-name'),
        n = nm.value.trim(),
        sb = d.getElementById('cf-subject'),
        sj = sb.value.trim();
      // show or clear the error under a field
      var flag = function (field, bad) {
        var note = d.getElementById(field.id + '-err');
        if (bad) field.setAttribute('aria-invalid', 'true');
        else field.removeAttribute('aria-invalid');
        if (note) note.hidden = !bad;
      };
      flag(nm, !n);
      flag(sb, !sj);
      if (!n) return nm.focus();
      if (!sj) return sb.focus();
      var s = 'Inquiry: ' + n + (sj ? ' - ' + sj : '');
      var text = msg.value.trim();
      var body = (text ? text + '\r\n\r\n' : '') + n;
      var q = 'subject=' + encodeURIComponent(s) + '&body=' + encodeURIComponent(body);
      var st = d.getElementById('cd-status');
      st.hidden = false;
      st.textContent = 'Opening your email app…';
      var a = d.createElement('a');
      a.href = 'mailto:' + EMAIL + '?' + q;
      a.style.display = 'none';
      d.body.appendChild(a);
      a.click();
      d.body.removeChild(a);
      // If no email app took over, offer a way to still get the message to me.
      setTimeout(function () {
        if (d.hidden || !dlg.open) return;
        st.textContent = '';
        var p = d.createElement('span');
        p.textContent = 'Nothing opened? Send it with ';
        var g = d.createElement('a');
        g.href =
          'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(EMAIL) + '&' + q;
        g.target = '_blank';
        g.rel = 'noopener';
        g.textContent = 'Gmail';
        var o = d.createElement('span');
        o.textContent = ', or copy the message and email ';
        var m = d.createElement('strong');
        m.textContent = EMAIL;
        var c = d.createElement('button');
        c.type = 'button';
        c.className = 'cd-copy';
        c.textContent = 'Copy message';
        c.addEventListener('click', function () {
          var t = 'To: ' + EMAIL + '\nSubject: ' + s + '\n\n' + body;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(t).then(
              function () {
                c.textContent = 'Copied';
              },
              function () {},
            );
          }
        });
        p.appendChild(g);
        p.appendChild(o);
        p.appendChild(m);
        p.appendChild(d.createTextNode('. '));
        p.appendChild(c);
        st.appendChild(p);
      }, 1500);
    });
  }
  var y = d.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Copyright icon in the footer: click or tap to show / hide the build time
  var stampBtn = d.getElementById('stamp-btn'),
    stamp = d.getElementById('stamp');
  if (stampBtn && stamp) {
    stampBtn.addEventListener('click', function () {
      var open = stamp.hidden,
        name = d.getElementById('foot-name');
      stamp.hidden = !open;
      if (name) name.hidden = open;
      stampBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = [].slice.call(d.querySelectorAll('.reveal'));
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (e) {
      e.classList.add('in');
    });
  } else {
    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    items.forEach(function (e) {
      io.observe(e);
    });
  }

  var links = [].slice.call(d.querySelectorAll('.links a[href^="#"]'));
  // Highlight the nav link for the section you're reading
  var map = {};
  links.forEach(function (a) {
    map[a.getAttribute('href').slice(1)] = a;
  });
  var ids = ['top', 'skills', 'experience', 'education', 'contact'].filter(function (id) {
    return map[id] && d.getElementById(id);
  });
  var setActive = function () {
    var y = window.scrollY || root.scrollTop,
      cur = ids[0];
    if (y > 40) {
      var line = window.innerHeight * 0.4;
      ids.forEach(function (id) {
        if (d.getElementById(id).getBoundingClientRect().top <= line) cur = id;
      });
      if (window.innerHeight + y >= root.scrollHeight - 4) cur = ids[ids.length - 1];
    }
    links.forEach(function (a) {
      a.removeAttribute('aria-current');
    });
    if (map[cur]) map[cur].setAttribute('aria-current', 'true');
  };
  setActive();
  window.addEventListener('scroll', setActive, { passive: true });
  window.addEventListener('resize', setActive);
})();

/* analytics events (Analytiics). Best-effort, never blocks the page. */
(function () {
  var d = document;
  function track(name, props) {
    try {
      var body = JSON.stringify({
        events: [
          {
            site: 'jkspn.xyz',
            name: name,
            props: props || {},
            url: location.href,
            ref: d.referrer,
          },
        ],
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          'https://in.analytiics.co/v1/events',
          new Blob([body], { type: 'text/plain' }),
        );
        return;
      }
      fetch('https://in.analytiics.co/v1/events', {
        method: 'POST',
        body: body,
        headers: { 'Content-Type': 'text/plain' },
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  }
  d.addEventListener(
    'click',
    function (e) {
      var t = e.target.closest && e.target.closest('a,button');
      if (!t) return;
      if (t.hasAttribute('data-contact')) {
        var loc = t.classList.contains('navcta')
          ? 'navbar'
          : t.closest('header')
            ? 'hero'
            : 'footer';
        track('contact_open', { location: loc });
      } else if (t.id === 'cd-copy-email') {
        track('copy_email');
      } else if (t.type === 'submit' && t.closest('#contact-form')) {
        track('contact_send');
      } else if (t.tagName === 'A' && /\/?docs\//.test(t.getAttribute('href') || '')) {
        var h = decodeURIComponent(t.getAttribute('href'));
        track('download', { file: /Selected Work/.test(h) ? 'selected_work' : 'cv' });
      }
    },
    true,
  );
})();
