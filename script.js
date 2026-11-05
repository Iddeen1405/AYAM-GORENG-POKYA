// ===== Header scroll state =====
const header = document.getElementById('siteHeader');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ===== Mobile nav =====
const toggle = document.getElementById('navToggle');
const menu = document.getElementById('navMenu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  menu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => menu.classList.remove('open'))
  );
}

// ===== Hero video fallback (home only) =====
const video = document.getElementById('heroVideo');
if (video) {
  video.addEventListener('error', () => video.style.display = 'none');
  video.addEventListener('loadeddata', () => {
    if (video.videoWidth === 0) video.style.display = 'none';
  });
  setTimeout(() => {
    if (video.readyState === 0 && video.networkState === 3) video.style.display = 'none';
  }, 2500);
}

// ===== Scroll reveal =====
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length && 'IntersectionObserver' in window) {
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObs.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('visible'));
}

// ===== Promo carousel (home only) =====
const track = document.getElementById('promoTrack');
if (track) {
  const slides = track.querySelectorAll('.promo-slide');
  const dotsWrap = document.getElementById('promoDots');
  const arrows = {
    prev: document.getElementById('promoPrev'),
    next: document.getElementById('promoNext')
  };
  let promoIndex = 0;

  if (dotsWrap) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Promo ' + (i + 1));
      dot.addEventListener('click', () => scrollToPromo(i));
      dotsWrap.appendChild(dot);
    });
  }
  const dots = dotsWrap ? dotsWrap.querySelectorAll('.dot') : [];

  function scrollToPromo(i) {
    promoIndex = (i + slides.length) % slides.length;
    slides[promoIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    dots.forEach((d, j) => d.classList.toggle('active', j === promoIndex));
  }

  if (arrows.next) arrows.next.addEventListener('click', () => scrollToPromo(promoIndex + 1));
  if (arrows.prev) arrows.prev.addEventListener('click', () => scrollToPromo(promoIndex - 1));

  track.addEventListener('scroll', () => {
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0, bestDist = Infinity;
    slides.forEach((s, i) => {
      const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - center);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    promoIndex = best;
    dots.forEach((d, j) => d.classList.toggle('active', j === best));
  }, { passive: true });
}

// ===== Gallery lightbox =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
if (lightbox && lightboxImg) {
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      lightboxImg.src = item.dataset.full;
      lightboxImg.alt = item.querySelector('img').alt;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
  }
  const closeBtn = document.getElementById('lightboxClose');
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}
