/**
 * Shared site chrome: navigation scroll state, mobile menu, reveal observer.
 */

export function initSiteChrome({ scrollThreshold = 48 } = {}) {
  const navbar = document.querySelector('.astoria-nav');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileClose = document.querySelector('.mobile-menu-close');
  const navLinks = document.querySelector('.nav-links');

  const onScroll = () => {
    navbar?.classList.toggle('scrolled', window.scrollY > scrollThreshold);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = (open) => {
    navLinks?.classList.toggle('active', open);
    mobileToggle?.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileClose?.toggleAttribute('hidden', !open);
    document.body.classList.toggle('no-scroll', open);
  };

  mobileToggle?.addEventListener('click', () => {
    setMenu(!navLinks?.classList.contains('active'));
  });
  mobileClose?.addEventListener('click', () => setMenu(false));
  navLinks?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  initReveal();
}

export function initReveal() {
  const els = document.querySelectorAll('.reveal:not(.revealed)');
  if (!els.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach((el) => el.classList.add('revealed'));
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  els.forEach((el) => obs.observe(el));
}

export function markActiveNav(pathname = window.location.pathname) {
  const path = pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a[data-nav]').forEach((link) => {
    const key = link.getAttribute('data-nav');
    const active =
      (key === 'home' && (path === '' || path === '/')) ||
      (key !== 'home' && path.includes(`/${key}`));
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}
