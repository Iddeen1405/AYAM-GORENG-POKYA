// ===== Slider =====
const slides = document.querySelectorAll('.slide');
const dotsWrap = document.getElementById('sliderDots');
let current = 0;
let timer;

slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', 'Slide ' + (i + 1));
  dot.addEventListener('click', () => goTo(i));
  dotsWrap.appendChild(dot);
});
const dots = dotsWrap.querySelectorAll('.dot');

function goTo(index) {
  slides[current].classList.remove('active');
  dots[current].classList.remove('active');
  current = (index + slides.length) % slides.length;
  slides[current].classList.add('active');
  dots[current].classList.add('active');
  restart();
}

function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }

function restart() {
  clearInterval(timer);
  timer = setInterval(next, 5000);
}

document.getElementById('nextSlide').addEventListener('click', next);
document.getElementById('prevSlide').addEventListener('click', prev);

// Swipe support
document.getElementById('slider').addEventListener('touchstart', e => {
  this._x = e.touches[0].clientX;
}, { passive: true });
document.getElementById('slider').addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - this._x;
  if (dx < -40) next();
  if (dx > 40) prev();
});

// Auto-play
timer = setInterval(next, 5000);

// Pause on hover
document.getElementById('slider').addEventListener('mouseenter', () => clearInterval(timer));
document.getElementById('slider').addEventListener('mouseleave', restart);

// ===== Mobile nav =====
const toggle = document.getElementById('navToggle');
const menu = document.getElementById('navMenu');
toggle.addEventListener('click', () => menu.classList.toggle('open'));
menu.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => menu.classList.remove('open'))
);

// ===== Dish of the day shuffle =====
const dishes = [
  'Ayam Goreng Set + Teh O Ais',
  'Combo Keluarga (4 pax) + Sirap',
  'Ayam Goreng + Nasi Impit + Ulam',
  'Ayam Goreng + Air Kelapa',
  'Ayam Goreng Berempah + Teh Tarik'
];
let dishIdx = 0;
document.getElementById('shuffleDish').addEventListener('click', () => {
  dishIdx = (dishIdx + 1) % dishes.length;
  document.getElementById('dishName').textContent = dishes[dishIdx];
});

// ===== Poll =====
const pollBtns = document.querySelectorAll('.poll-option');
const pollTotalEl = document.getElementById('pollTotal');
const POLL_KEY = 'pokya_poll_votes';

function storedVotes() {
  try { return JSON.parse(localStorage.getItem(POLL_KEY)) || {}; }
  catch { return {}; }
}

function renderPoll() {
  const votes = storedVotes();
  let total = 0;
  pollBtns.forEach(b => {
    const v = votes[b.dataset.votes] || (+b.dataset.votes);
    // data-votes stores base votes; user votes keyed by index
  });
  // Simpler: recompute from data attributes + user vote offsets
  let sum = 0;
  const counts = pollBtns.map((b, i) => {
    const userVoted = votes[i] ? 1 : 0;
    const c = (+b.dataset.votes) + userVoted;
    sum += c;
    return c;
  });
  pollBtns.forEach((b, i) => {
    const pct = sum ? (counts[i] / sum) * 100 : 0;
    b.querySelector('.poll-bar').style.width = pct + '%';
    b.classList.toggle('voted', !!votes[i]);
    b.querySelector('span').textContent = b.querySelector('span').textContent.replace(/\s*\(\d+%\)/, '') + (sum ? ` (${Math.round(pct)}%)` : '');
  });
  pollTotalEl.textContent = sum ? `${sum} votes — thanks for voting!` : '';
}

pollBtns.forEach((b, i) => {
  b.addEventListener('click', () => {
    const votes = storedVotes();
    if (!votes[i]) {
      votes[i] = 1;
      localStorage.setItem(POLL_KEY, JSON.stringify(votes));
    }
    renderPoll();
  });
});

document.getElementById('resetPoll').addEventListener('click', () => {
  localStorage.removeItem(POLL_KEY);
  pollBtns.forEach(b => {
    b.querySelector('span').textContent = b.querySelector('span').textContent.replace(/\s*\(\d+%\)/, '');
  });
  renderPoll();
});

renderPoll();
