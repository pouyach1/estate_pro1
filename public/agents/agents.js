import { createIcons, Menu, X, Phone, Mail } from 'lucide';
import { escapeHTML } from '../js/shared/format.js';
import { initSiteChrome, markActiveNav, initReveal } from '../js/shared/site-chrome.js';

const API = '/api';
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23151822'/%3E%3Ccircle cx='50' cy='36' r='18' fill='%23c8c8c2'/%3E%3Cpath d='M20 88c4-18 18-28 30-28s26 10 30 28' fill='%23c8c8c2'/%3E%3C/svg%3E";
const root = document.getElementById('agentsDirectory');

function icons() {
  createIcons({ icons: { Menu, X, Phone, Mail }, attrs: { 'stroke-width': 1.5, width: 18, height: 18 } });
}

function card(agent) {
  const name = escapeHTML(agent.name || '');
  const title = escapeHTML(agent.title || 'مشاور املاک');
  const bio = escapeHTML(agent.bio || '');
  const phone = escapeHTML(agent.phone || '');
  const email = escapeHTML(agent.email || '');
  const photo = escapeHTML(agent.photo || PLACEHOLDER);
  return `
    <article class="advisor-portrait reveal">
      <div class="advisor-portrait-photo" style="background-image:url('${photo}')" role="img" aria-label="${name}"></div>
      <div class="advisor-portrait-body">
        <h2 class="advisor-portrait-name">${name}</h2>
        <p class="advisor-portrait-role">${title}</p>
        ${bio ? `<p class="advisor-portrait-bio">${bio}</p>` : ''}
        <div class="advisor-portrait-contacts">
          ${phone ? `<a href="tel:${phone}"><i data-lucide="phone"></i> ${phone}</a>` : ''}
          ${email ? `<a href="mailto:${email}"><i data-lucide="mail"></i> تماس ایمیلی</a>` : ''}
          <a href="/contact/">درخواست مشاوره</a>
        </div>
      </div>
    </article>`;
}

async function load() {
  if (!root) return;
  try {
    const res = await fetch(`${API}/agents`);
    if (!res.ok) throw new Error('failed');
    const data = await res.json();
    const agents = (data.agents || []).filter((a) => a.isActive !== false);
    if (!agents.length) {
      root.innerHTML = `<div class="page-state" style="grid-column:1/-1"><h3>اطلاعات مشاوران به‌زودی</h3><p>برای گفت‌وگو با تیم آستوریا از فرم تماس استفاده کنید.</p><a class="btn-primary" href="/contact/">تماس</a></div>`;
      return;
    }
    root.innerHTML = agents.map(card).join('');
    icons();
    initReveal();
  } catch {
    root.innerHTML = `<div class="page-state" style="grid-column:1/-1"><h3>بارگذاری انجام نشد</h3><button type="button" class="btn-secondary" id="retryAgents">تلاش مجدد</button></div>`;
    document.getElementById('retryAgents')?.addEventListener('click', load);
  } finally {
    root.removeAttribute('aria-busy');
  }
}

initSiteChrome();
markActiveNav();
icons();
load();
