const jingleAudio = document.querySelector('#jingleAudio');

if (jingleAudio) {
  let started = false;

  const tryAutoplay = () => {
    if (started || !jingleAudio.paused) return;
    jingleAudio.volume = 1;
    jingleAudio.muted = false;

    const p = jingleAudio.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        started = true;
      }).catch(() => {
        // Some browsers block audible autoplay until the visitor interacts.
      });
    }
  };

  // Try as early and as often as the browser reasonably allows.
  tryAutoplay();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryAutoplay, { once: true });
  }

  window.addEventListener('load', tryAutoplay, { once: true });
  window.addEventListener('pageshow', tryAutoplay);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tryAutoplay();
  });

  // If autoplay was blocked, the very first normal interaction starts it
  // without showing a separate button or interrupting the page.
  const interactionStart = () => {
    tryAutoplay();
    if (!jingleAudio.paused) {
      window.removeEventListener('pointerdown', interactionStart);
      window.removeEventListener('touchstart', interactionStart);
      window.removeEventListener('keydown', interactionStart);
    }
  };

  window.addEventListener('pointerdown', interactionStart, { passive: true });
  window.addEventListener('touchstart', interactionStart, { passive: true });
  window.addEventListener('keydown', interactionStart);
}

const qs = (s, root = document) => root.querySelector(s);
const qsa = (s, root = document) => [...root.querySelectorAll(s)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

qs('#year').textContent = new Date().getFullYear();

const header = qs('.site-header');
const progress = qs('.scroll-progress span');
const moments = qs('.life-moments');
const momentProgress = qs('.moments-line span');

function onScroll() {
  const y = window.scrollY || 0;
  header.classList.toggle('scrolled', y > 16);

  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  progress.style.width = `${(y / max) * 100}%`;

  if (moments && momentProgress) {
    const r = moments.getBoundingClientRect();
    const total = r.height + window.innerHeight;
    const passed = Math.min(1, Math.max(0, (window.innerHeight - r.top) / total));
    momentProgress.style.height = `${passed * 100}%`;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
qsa('.reveal').forEach(el => io.observe(el));

const menu = qs('.menu-toggle');
const nav = qs('.site-nav');
menu.addEventListener('click', () => {
  const open = !nav.classList.contains('open');
  nav.classList.toggle('open', open);
  menu.classList.toggle('active', open);
  menu.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});
qsa('.site-nav a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menu.classList.remove('active');
  menu.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}));

qsa('.faq-item').forEach(item => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    qsa('.faq-item').forEach(other => {
      if (other !== item) other.open = false;
    });
  });
});


// Custom service picker
const serviceSelect = qs('#serviceSelect');
const serviceSelectTrigger = qs('#serviceSelectTrigger');
const serviceSelectValue = qs('#serviceSelectValue');
const topicInput = qs('#topicInput');
const serviceOptions = qsa('.service-option');

if (serviceSelect && serviceSelectTrigger) {
  const closeServiceSelect = () => {
    serviceSelect.classList.remove('open');
    serviceSelectTrigger.setAttribute('aria-expanded', 'false');
  };
  serviceSelectTrigger.addEventListener('click', () => {
    const open = !serviceSelect.classList.contains('open');
    serviceSelect.classList.toggle('open', open);
    serviceSelectTrigger.setAttribute('aria-expanded', String(open));
  });
  serviceOptions.forEach(option => {
    option.addEventListener('click', () => {
      const value = option.dataset.value || option.textContent.trim();
      topicInput.value = value;
      serviceSelectValue.textContent = value;
      serviceOptions.forEach(item => {
        const selected = item === option;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-selected', String(selected));
      });
      closeServiceSelect();
      serviceSelectTrigger.focus();
    });
  });
  document.addEventListener('click', e => {
    if (!serviceSelect.contains(e.target)) closeServiceSelect();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeServiceSelect();
  });
}

const form = qs('#contactForm');
const toast = qs('#toast');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const phone = String(data.get('phone') || '').trim();
  const topic = String(data.get('topic') || '').trim();
  const message = String(data.get('message') || '').trim();

  const body = [
    `Hi Jessica! This is ${name || 'a website visitor'}.`,
    '',
    `Phone: ${phone || 'Not provided'}`,
    `I'm reaching out about: ${topic}`,
    '',
    message || 'I’d like to learn more about the services you offer.'
  ].join('\n');

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3800);

  const isAppleMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const separator = isAppleMobile ? '&' : '?';
  window.location.href = `sms:+14805167448${separator}body=${encodeURIComponent(body)}`;
});

if (!reduced) {
  let raf = false;
  function motion() {
    const y = window.scrollY || 0;
    const hero = qs('.hero');
    const art = qs('.hero-art');
    if (hero && art && window.innerWidth > 760) {
      const r = hero.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, hero.offsetHeight)));
      art.style.transform = `translate3d(0, ${p * 26}px, 0)`;
    } else if (art) {
      art.style.transform = '';
    }

    qsa('.moment-card').forEach(card => {
      card.style.translate = '0 0';
      card.style.rotate = '0deg';
    });

    const special = qs('.special-card');
    if (special) {
      const r = special.getBoundingClientRect();
      const p = Math.max(-1, Math.min(1, (r.top + r.height/2 - window.innerHeight/2) / window.innerHeight));
      special.style.setProperty('--special-shift', `${p * 20}px`);
    }
    raf = false;
  }
  function requestMotion() {
    if (!raf) {
      requestAnimationFrame(motion);
      raf = true;
    }
  }
  window.addEventListener('scroll', requestMotion, { passive: true });
  window.addEventListener('resize', requestMotion, { passive: true });
  requestMotion();
}
