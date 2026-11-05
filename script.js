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

// ===== Hero promo slider =====
const heroMedia = document.getElementById('heroMedia');
if (heroMedia) {
  const heroSlides = heroMedia.querySelectorAll('.hero-slide');
  let heroIdx = 0;
  function showHeroSlide(i) {
    heroSlides.forEach((s, j) => {
      const active = j === i;
      s.classList.toggle('active', active);
      const v = s.querySelector('video');
      if (v) {
        if (active) v.play().catch(() => {});
        else v.pause();
      }
    });
  }
  heroSlides.forEach(s => {
    const v = s.querySelector('video');
    if (v) v.addEventListener('error', () => s.style.display = 'none');
  });
  setInterval(() => {
    heroIdx = (heroIdx + 1) % heroSlides.length;
    showHeroSlide(heroIdx);
  }, 6000);
  showHeroSlide(0);
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

// ===== Order cart (menu page only) =====
const orderGrid = document.getElementById('orderGrid');
if (orderGrid) {
  const CART_KEY = 'pokya_cart';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { cart = []; }

  const cartFab = document.getElementById('cartFab');
  const cartCount = document.getElementById('cartCount');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const clearCartBtn = document.getElementById('clearCart');
  const cartClose = document.getElementById('cartClose');
  const modal = document.getElementById('checkoutModal');
  const modalClose = document.getElementById('modalClose');
  const orderSummary = document.getElementById('orderSummary');
  const sendOrderBtn = document.getElementById('sendOrder');
  const copyOrderBtn = document.getElementById('copyOrder');
  const custName = document.getElementById('custName');
  const orderNotes = document.getElementById('orderNotes');

  const fmt = n => 'RM ' + n.toFixed(2);
  const save = () => localStorage.setItem(CART_KEY, JSON.stringify(cart));

  function cartQty() { return cart.reduce((s, i) => s + i.qty, 0); }

  function renderCart() {
    cartCount.textContent = cartQty();
    if (!cart.length) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.<br>Add something tasty!</p>';
    } else {
      cartItemsEl.innerHTML = cart.map((i, idx) => `
        <div class="cart-item">
          <img src="${i.img}" alt="${i.name}">
          <div class="cart-item-info">
            <h4>${i.name}</h4>
            <span class="ci-price">${fmt(i.price)}</span>
          </div>
          <div class="qty-ctrl">
            <button data-idx="${idx}" data-d="-1" aria-label="Decrease">&minus;</button>
            <span>${i.qty}</span>
            <button data-idx="${idx}" data-d="1" aria-label="Increase">+</button>
          </div>
          <button class="ci-remove" data-idx="${idx}" aria-label="Remove">&times;</button>
        </div>`).join('');
    }
    cartTotalEl.textContent = fmt(cart.reduce((s, i) => s + i.price * i.qty, 0));
  }

  function openCart() { cartDrawer.classList.add('open'); cartOverlay.classList.add('open'); cartDrawer.setAttribute('aria-hidden', 'false'); }
  function closeCart() { cartDrawer.classList.remove('open'); cartOverlay.classList.remove('open'); cartDrawer.setAttribute('aria-hidden', 'true'); }
  function openModal() { closeCart(); renderSummary(); modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); }
  function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }

  orderGrid.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const item = {
        id: card.dataset.id, name: card.dataset.name,
        price: +card.dataset.price, img: card.dataset.img, qty: 1
      };
      const found = cart.find(i => i.id === item.id);
      if (found) found.qty++; else cart.push(item);
      save(); renderCart();
      cartFab.style.transform = 'scale(1.15)';
      setTimeout(() => cartFab.style.transform = '', 200);
    });
  });

  cartItemsEl.addEventListener('click', e => {
    const t = e.target.closest('button');
    if (!t) return;
    const idx = +t.dataset.idx;
    if (t.classList.contains('ci-remove')) cart.splice(idx, 1);
    else if (t.dataset.d) {
      cart[idx].qty += +t.dataset.d;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
    }
    save(); renderCart();
  });

  cartFab.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  checkoutBtn.addEventListener('click', () => { if (cart.length) openModal(); });
  clearCartBtn.addEventListener('click', () => { cart = []; save(); renderCart(); });
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeCart(); closeModal(); }
  });

  function orderText() {
    const name = custName.value.trim() || 'Customer';
    const lines = cart.map(i => `${i.qty}x ${i.name} — ${fmt(i.price * i.qty)}`);
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    return `NEW ORDER — Ayam Goreng Pokya\nName: ${name}\n\n${lines.join('\n')}\n\nTotal: ${fmt(total)}\nNotes: ${orderNotes.value.trim() || '-'}`;
  }

  function renderSummary() {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    orderSummary.innerHTML =
      cart.map(i => `<div class="os-row"><span>${i.qty}x ${i.name}</span><span>${fmt(i.price * i.qty)}</span></div>`).join('') +
      `<div class="os-row os-total"><span>Total</span><span>${fmt(total)}</span></div>`;
  }

  sendOrderBtn.addEventListener('click', () => {
    const text = encodeURIComponent(orderText());
    navigator.clipboard?.writeText(orderText()).catch(() => {});
    window.open('https://www.facebook.com', '_blank');
    cart = []; save(); renderCart(); closeModal();
    custName.value = ''; orderNotes.value = '';
  });
  copyOrderBtn.addEventListener('click', () => {
    navigator.clipboard?.writeText(orderText()).then(() => {
      copyOrderBtn.textContent = 'Copied!';
      setTimeout(() => copyOrderBtn.textContent = 'Copy Order Text', 1500);
    });
  });

  // Category filter
  const catTabs = document.getElementById('catTabs');
  if (catTabs) {
    catTabs.addEventListener('click', e => {
      const tab = e.target.closest('.cat-tab');
      if (!tab) return;
      catTabs.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;
      orderGrid.querySelectorAll('.product-card').forEach(card => {
        card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
      });
    });
  }

  renderCart();
}

// ===== Fire page transition =====
(function () {
  const overlay = document.createElement('div');
  overlay.className = 'fire-transition';
  overlay.setAttribute('aria-hidden', 'true');
  let bg = document.createElement('div');
  bg.className = 'fire-bg';
  overlay.appendChild(bg);
  for (let i = 0; i < 14; i++) {
    const f = document.createElement('div');
    f.className = 'flame';
    f.style.setProperty('--x', (4 + Math.random() * 92) + '%');
    f.style.setProperty('--s', (60 + Math.random() * 110) + 'px');
    f.style.setProperty('--d', (1.8 + Math.random() * 0.8) + 's');
    f.style.setProperty('--delay', (Math.random() * 0.6) + 's');
    overlay.appendChild(f);
  }
  // Cartoon chicken mascot
  const chicken = document.createElement('div');
  chicken.className = 'fire-chicken';
  chicken.innerHTML = `<svg viewBox="0 0 100 100" width="96" height="96">
    <ellipse cx="38" cy="62" rx="26" ry="22" fill="#FFC53D"/>
    <ellipse cx="38" cy="62" rx="26" ry="22" fill="none" stroke="#C97B12" stroke-width="3"/>
    <path d="M20 52 q18-12 36 0 M18 64 q20-12 40 0" stroke="#C97B12" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/>
    <rect x="58" y="50" width="30" height="11" rx="5.5" fill="#F4E3C1" transform="rotate(-18 73 55)"/>
    <circle cx="86" cy="46" r="9" fill="#F4E3C1"/>
    <circle cx="34" cy="56" r="4" fill="#16324F"/><circle cx="47" cy="56" r="4" fill="#16324F"/>
    <circle cx="35.5" cy="54.5" r="1.4" fill="#fff"/><circle cx="48.5" cy="54.5" r="1.4" fill="#fff"/>
    <path d="M36 66 q5 5 10 0" stroke="#16324F" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <rect x="28" y="82" width="7" height="12" rx="3.5" fill="#F4E3C1" transform="rotate(10 31 88)"/>
    <rect x="44" y="82" width="7" height="12" rx="3.5" fill="#F4E3C1" transform="rotate(-8 47 88)"/>
    <path d="M14 40 q-8 -10 -4 -18 M22 34 q-6 -12 0 -20" stroke="#FFD100" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
  </svg>`;
  overlay.appendChild(chicken);
  document.body.appendChild(overlay);

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;
    if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    overlay.classList.add('active');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => { window.location.href = href; }, reduce ? 150 : 1700);
  });
})();
