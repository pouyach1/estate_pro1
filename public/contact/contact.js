import { createIcons, Menu, X, Phone, Mail, MapPin } from 'lucide';
import { initSiteChrome, markActiveNav, initReveal } from '../js/shared/site-chrome.js';

const API = '/api';

function icons() {
  createIcons({ icons: { Menu, X, Phone, Mail, MapPin }, attrs: { 'stroke-width': 1.5, width: 18, height: 18 } });
}

async function loadSettings() {
  try {
    const res = await fetch(`${API}/settings`);
    if (!res.ok) return;
    const s = await res.json();
    const phoneEl = document.getElementById('contactPhone');
    const emailEl = document.getElementById('contactEmail');
    const addrEl = document.getElementById('contactAddress');
    if (s.contactPhone && phoneEl) {
      phoneEl.href = `tel:${String(s.contactPhone).replace(/\D/g, '')}`;
      phoneEl.querySelector('span').textContent = s.contactPhone;
    }
    if (s.contactEmail && emailEl) {
      emailEl.href = `mailto:${s.contactEmail}`;
      emailEl.querySelector('span').textContent = s.contactEmail;
    }
    if (s.contactAddress && addrEl) {
      addrEl.querySelector('span').textContent = s.contactAddress;
    }
    icons();
  } catch (_) { /* optional */ }
}

function setFeedback(text, type) {
  const el = document.getElementById('contactFeedback');
  if (!el) return;
  el.textContent = text;
  el.className = `form-feedback ${type || ''}`;
}

document.getElementById('contactPageForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const phone = document.getElementById('phone')?.value.trim() || '';
  const message = document.getElementById('message')?.value.trim();
  const btn = e.target.querySelector('button[type="submit"]');

  if (!name || !email || !message) {
    setFeedback('لطفاً فیلدهای ضروری را تکمیل کنید.', 'error');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFeedback('ایمیل واردشده معتبر نیست.', 'error');
    return;
  }

  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'در حال ارسال...';
  setFeedback('');

  try {
    const res = await fetch(`${API}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, message, source: 'فرم تماس' }),
    });
    if (!res.ok) throw new Error('failed');
    document.getElementById('contactFormBody').hidden = true;
    document.getElementById('contactSuccess').hidden = false;
  } catch {
    setFeedback('ارسال پیام انجام نشد. لطفاً دوباره تلاش کنید.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
});

initSiteChrome();
markActiveNav();
icons();
initReveal();
loadSettings();
