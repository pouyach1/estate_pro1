async function loadDashboardStats() {
  try {
    const res = await fetch(`${API}/admin/dashboard`, { headers: headers() });
    
    if (res.status === 401) {
      localStorage.clear();
      window.location.href = 'index.html';
      return;
    }
    
    const data = await res.json();

    animateNumber('totalProperties', data.stats?.totalProperties || 0);
    animateNumber('totalViews', data.stats?.totalViews || 0);
    animateNumber('totalCustomers', data.stats?.totalCustomers || 0);
    animateNumber('unreadMessages', data.stats?.unreadMessages || 0);

    if (data.propertiesByType?.length) renderPropertyTypeChart(data.propertiesByType);
    renderMessageStats(data.stats);
    if (data.recentCustomers?.length) renderRecentMessages(data.recentCustomers);
    if (data.topProperties?.length) renderTopProperties(data.topProperties);
    if (data.lowProperties?.length) renderLowProperties(data.lowProperties);
  } catch (e) {
    console.error('Dashboard error:', e);
  }
}

function renderPropertyTypeChart(types) {
  const c = document.getElementById('propertyTypeChart');
  if (!c) return;
  const max = Math.max(...types.map(t => t.count), 1);
  const names = { 'آپارتمان': 'آپارتمان', 'ویلا': 'ویلا', 'پنت‌هاوس': 'پنت‌هاوس', 'زمین': 'زمین', 'دفتر کار': 'دفتر کار', 'باغ': 'باغ' };
  c.innerHTML = types.map(t => `<div class="chart-bar-row"><span class="chart-bar-label">${names[t._id]||t._id}</span><div class="chart-bar-track"><div class="chart-bar-fill" style="width:${Math.round((t.count/max)*100)}%;"></div></div><span class="chart-bar-count">${t.count}</span></div>`).join('');
}

function renderMessageStats(stats) {
  const c = document.getElementById('messageStats');
  if (!c) return;
  const total = stats?.totalCustomers || 0, unread = stats?.unreadMessages || 0, read = total - unread, responded = Math.floor(read * 0.7);
  c.innerHTML = `
    <div class="msg-stat-item"><div class="msg-stat-dot new"></div><span>جدید</span><strong>${unread.toLocaleString('fa-IR')}</strong></div>
    <div class="msg-stat-item"><div class="msg-stat-dot read"></div><span>خوانده شده</span><strong>${read.toLocaleString('fa-IR')}</strong></div>
    <div class="msg-stat-item"><div class="msg-stat-dot responded"></div><span>پاسخ داده شده</span><strong>${responded.toLocaleString('fa-IR')}</strong></div>
    <div class="msg-stat-item"><div class="msg-stat-dot total"></div><span>کل</span><strong>${total.toLocaleString('fa-IR')}</strong></div>`;
}

function renderRecentMessages(customers) {
  const c = document.getElementById('recentMessages');
  if (!c) return;
  c.innerHTML = customers.slice(0,5).map(cu => `<div class="recent-msg-item"><div class="recent-msg-avatar">${cu.name?.charAt(0)||'؟'}</div><div class="recent-msg-content"><div class="recent-msg-header"><strong>${cu.name}</strong><span class="recent-msg-date">${new Date(cu.createdAt).toLocaleDateString('fa-IR')}</span></div><p class="recent-msg-text">${cu.message?.substring(0,80)}...</p></div>${!cu.isRead?'<span class="unread-badge">جدید</span>':''}</div>`).join('');
}

function renderTopProperties(props) {
  const c = document.getElementById('topPropertiesList');
  if (!c) return;
  c.innerHTML = props.map((p,i) => `<div class="top-prop-item"><span class="top-prop-rank">${i+1}</span><span class="top-prop-name">${p.title}</span><span class="top-prop-views">${(p.views||0).toLocaleString('fa-IR')} بازدید</span></div>`).join('');
}

function renderLowProperties(props) {
  const c = document.getElementById('lowPropertiesList');
  if (!c) return;
  c.innerHTML = props.map((p,i) => `<div class="top-prop-item"><span class="top-prop-rank low">${i+1}</span><span class="top-prop-name">${p.title}</span><span class="top-prop-views">${(p.views||0).toLocaleString('fa-IR')} بازدید</span></div>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('page-dashboard')?.classList.contains('active')) loadDashboardStats();
});