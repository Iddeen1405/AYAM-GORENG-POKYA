// ===== Header scroll state =====
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ===== Mobile nav =====
const toggle = document.getElementById('navToggle');
const menu = document.getElementById('navMenu');
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
menu.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => menu.classList.remove('open'))
);

// ===== Hero video fallback =====
const video = document.getElementById('heroVideo');
const fallback = document.querySelector('.hero-fallback');
video.addEventListener('error', () => video.style.display = 'none');
video.addEventListener('loadeddata', () => {
  if (video.videoWidth === 0) video.style.display = 'none';
});
// If the video source 404s, keep the poster image visible
setTimeout(() => {
  if (video.readyState === 0 && video.networkState === 3) video.style.display = 'none';
}, 2500);
void fallback;

// ===== Scroll reveal =====
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ===== Promo carousel =====
const track = document.getElementById('promoTrack');
const slides = track.querySelectorAll('.promo-slide');
const dotsWrap = document.getElementById('promoDots');
let promoIndex = 0;

slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', 'Promo ' + (i + 1));
  dot.addEventListener('click', () => scrollToPromo(i));
  dotsWrap.appendChild(dot);
});
const dots = dotsWrap.querySelectorAll('.dot');

function scrollToPromo(i) {
  promoIndex = (i + slides.length) % slides.length;
  slides[promoIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  dots.forEach((d, j) => d.classList.toggle('active', j === promoIndex));
}

document.getElementById('promoNext').addEventListener('click', () => scrollToPromo(promoIndex + 1));
document.getElementById('promoPrev').addEventListener('click', () => scrollToPromo(promoIndex - 1));

// Update active dot on manual scroll
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

// ===== Gallery lightbox =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const full = item.dataset.full;
    const thumb = item.querySelector('img');
    lightboxImg.src = full;
    lightboxImg.alt = thumb.alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImg.src = '';
}
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
