(() => {
  const btn = document.querySelector('[data-menu-toggle]');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      document.body.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();

(() => {
  const triggers = Array.from(document.querySelectorAll('.image-pop-trigger'));
  if (!triggers.length) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'image-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', '확대 이미지 보기');
  lightbox.innerHTML = `
    <div class="image-lightbox-panel" role="document">
      <button class="image-lightbox-close" type="button" aria-label="닫기">×</button>
      <img alt="" />
      <p class="image-lightbox-caption"></p>
    </div>
  `;
  document.body.appendChild(lightbox);

  const panel = lightbox.querySelector('.image-lightbox-panel');
  const modalImg = lightbox.querySelector('img');
  const caption = lightbox.querySelector('.image-lightbox-caption');
  const closeBtn = lightbox.querySelector('.image-lightbox-close');
  let lastFocus = null;

  function getPopupScale(trigger) {
    const fromButton = parseFloat(trigger.dataset.popupScale || '');
    if (Number.isFinite(fromButton) && fromButton > 0) return fromButton;
    const fromCss = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-popup-scale'));
    return Number.isFinite(fromCss) && fromCss > 0 ? fromCss : 3;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function positionPanel(trigger, scale) {
    const rect = trigger.getBoundingClientRect();
    const naturalW = Math.max(rect.width * scale, 120);
    const naturalH = Math.max(rect.height * scale, 120);
    const maxW = window.innerWidth - 64;
    const maxH = window.innerHeight - 96;
    const width = Math.min(naturalW, maxW);
    const height = Math.min(naturalH, maxH);

    panel.style.setProperty('--popup-width', `${width}px`);
    panel.style.setProperty('--popup-height', `${height}px`);

    // Place the pop-up around the clicked image center, then clamp it inside the viewport.
    const panelW = Math.min(width + 24, window.innerWidth - 32);
    const panelH = Math.min(height + 78, window.innerHeight - 32);
    const left = clamp(rect.left + rect.width / 2 - panelW / 2, 16, window.innerWidth - panelW - 16);
    const top = clamp(rect.top + rect.height / 2 - panelH / 2, 16, window.innerHeight - panelH - 16);
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  }

  function openLightbox(trigger) {
    const sourceImg = trigger.querySelector('img');
    const src = (sourceImg ? sourceImg.getAttribute('src') : '') || trigger.dataset.lightboxSrc || '';
    const alt = (sourceImg ? sourceImg.getAttribute('alt') : '') || trigger.dataset.lightboxAlt || '';
    if (!src) return;
    lastFocus = document.activeElement;
    modalImg.setAttribute('src', src);
    modalImg.setAttribute('alt', alt || 'Expanded image');
    caption.textContent = alt || '';
    lightbox.classList.add('is-open');
    document.body.classList.add('lightbox-open');
    positionPanel(trigger, getPopupScale(trigger));
    closeBtn.focus({ preventScroll: true });
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    modalImg.removeAttribute('src');
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus({ preventScroll: true });
    }
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => openLightbox(trigger));
  });

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });
  window.addEventListener('resize', closeLightbox);
})();
