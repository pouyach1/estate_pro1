import { createIcons, Menu, X } from 'lucide';
import { initSiteChrome, markActiveNav, initReveal } from '../js/shared/site-chrome.js';

const API = '/api';

function icons() {
  createIcons({ icons: { Menu, X }, attrs: { 'stroke-width': 1.5, width: 20, height: 20 } });
}

async function loadMetrics() {
  try {
    const [propsRes, agentsRes] = await Promise.all([
      fetch(`${API}/properties`),
      fetch(`${API}/agents`),
    ]);
    const propsData = propsRes.ok ? await propsRes.json() : { properties: [] };
    const agentsData = agentsRes.ok ? await agentsRes.json() : { agents: [] };
    const properties = propsData.properties || [];
    const agents = (agentsData.agents || []).filter((a) => a.isActive !== false);
    const types = new Set(properties.map((p) => p.type).filter(Boolean));

    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = Number(value).toLocaleString('fa-IR');
    };
    set('metricProperties', properties.length);
    set('metricAgents', agents.length);
    set('metricTypes', types.size || '—');

    const visual = document.getElementById('aboutVisual');
    const img = properties.find((p) => p.image)?.image || properties[0]?.images?.[0];
    if (visual && img) visual.style.backgroundImage = `url("${img}")`;
  } catch (_) {
    /* metrics optional */
  }
}

initSiteChrome();
markActiveNav();
icons();
initReveal();
loadMetrics();
