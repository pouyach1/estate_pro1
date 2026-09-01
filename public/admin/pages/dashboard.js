function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function formatPriceAdmin(price) {
  if (!price && price !== 0) return 'تماس بگیرید';
  return `${Number(price).toLocaleString('fa-IR')} تومان`;
}

async function loadDashboardStats() {
  const sections = ['propertyTypeChart', 'messageStats', 'topPropertiesList', 'lowPropertiesList', 'recentMessages', 'recentPropertiesList'];
  try {
    const res = await fetch(`${API}/admin/dashboard`, { headers: headers() });

    if (res.status === 403) {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<div class="empty-state"><h3>داشبورد تحلیلی فقط برای مالک فعال است</h3><p>برای مدیریت املاک از بخش املاک استفاده کنید.</p></div>';
      });
      return;
    }

    if (res.status === 401) {
      localStorage.clear();
      window.location.href = '/admin/';
      return;
    }

    if (!res.ok) throw new Error('dashboard failed');

    const data = await res.json();
    const stats = data.stats || {};

    animateNumber('totalProperties', stats.totalProperties || 0);
    animateNumber('totalViews', stats.totalViews || 0);
    animateNumber('totalCustomers', stats.totalCustomers || 0);
    animateNumber('unreadMessages', stats.unreadMessages || 0);

    if (data.propertiesByType?.length) renderPropertyTypeChart(data.propertiesByType);
    else document.getElementById('propertyTypeChart').innerHTML = '<div class="empty-state"><p>هنوز داده‌ای برای نمودار وجود ندارد</p></div>';

    renderMessageStats(stats);

    if (data.recentCustomers?.length) renderRecentMessages(data.recentCustomers);
    else document.getElementById('recentMessages').innerHTML = '<div class="empty-state"><h3>هنوز پیامی دریافت نشده است</h3><p>پیام‌های فرم تماس و درخواست بازدید اینجا نمایش داده می‌شوند.</p></div>';

    if (data.recentProperties?.length) renderRecentProperties(data.recentProperties);
    else document.getElementById('recentPropertiesList').innerHTML = '<div class="empty-state"><h3>هنوز ملکی ثبت نشده است</h3><button type="button" class="btn-gold-outline" onclick="navigateTo(\'add-property\')">افزودن اولین ملک</button></div>';

    if (data.topProperties?.length) renderTopProperties(data.topProperties);
    else document.getElementById('topPropertiesList').innerHTML = '<div class="empty-state"><p>داده‌ای موجود نیست</p></div>';

    if (data.lowProperties?.length) renderLowProperties(data.lowProperties);
    else document.getElementById('lowPropertiesList').innerHTML = '<div class="empty-state"><p>داده‌ای موجود نیست</p></div>';
  } catch (e) {
    console.error('Dashboard error:', e);
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<div class="empty-state"><h3>بارگذاری داشبورد انجام نشد</h3><p>اتصال به سرور برقرار نشد. لطفاً دوباره تلاش کنید.</p><button type="button" class="btn-gold-outline" onclick="loadDashboardStats()">تلاش مجدد</button></div>';
    });
  }
}

function renderPropertyTypeChart(types) {
  const c = document.getElementById('propertyTypeChart');
  if (!c) return;
  const max = Math.max(...types.map((t) => t.count), 1);
  c.innerHTML = types.map((t) => `<div class="chart-bar-row"><span class="chart-bar-label">${escapeHtml(t._id)}</span><div class="chart-bar-track"><div class="chart-bar-fill" style="width:${Math.round((t.count / max) * 100)}%;"></div></div><span class="chart-bar-count">${t.count.toLocaleString('fa-IR')}</span></div>`).join('');
}

function renderMessageStats(stats) {
  const c = document.getElementById('messageStats');
  if (!c) return;
  const total = stats?.totalCustomers || 0;
  const unread = stats?.unreadMessages || 0;
  const read = Math.max(total - unread, 0);
  const active = stats?.activeProperties || 0;

  c.innerHTML = `
    <div class="msg-stat-item"><div class="msg-stat-dot new"></div><span>جدید</span><strong>${unread.toLocaleString('fa-IR')}</strong></div>
    <div class="msg-stat-item"><div class="msg-stat-dot read"></div><span>خوانده شده</span><strong>${read.toLocaleString('fa-IR')}</strong></div>
    <div class="msg-stat-item"><div class="msg-stat-dot total"></div><span>کل پیام‌ها</span><strong>${total.toLocaleString('fa-IR')}</strong></div>
    <div class="msg-stat-item"><div class="msg-stat-dot responded"></div><span>املاک فعال</span><strong>${active.toLocaleString('fa-IR')}</strong></div>`;
}

function renderRecentMessages(customers) {
  const c = document.getElementById('recentMessages');
  if (!c) return;
  c.innerHTML = customers.slice(0, 6).map((cu) => `
    <button type="button" class="recent-msg-item ${cu.isRead ? '' : 'is-unread'}" onclick="openLeadFromDashboard('${cu._id}')">
      <div class="recent-msg-avatar">${escapeHtml(cu.name?.charAt(0) || '؟')}</div>
      <div class="recent-msg-content">
        <div class="recent-msg-header">
          <strong>${escapeHtml(cu.name || 'بدون نام')}</strong>
          <span class="recent-msg-date">${new Date(cu.createdAt).toLocaleDateString('fa-IR')}</span>
        </div>
        <p class="recent-msg-text">${escapeHtml((cu.message || '').substring(0, 90))}${(cu.message || '').length > 90 ? '…' : ''}</p>
        ${cu.phone ? `<span class="recent-msg-phone">${escapeHtml(cu.phone)}</span>` : ''}
      </div>
      ${!cu.isRead ? '<span class="unread-badge">جدید</span>' : ''}
    </button>`).join('');
}

function renderRecentProperties(properties) {
  const c = document.getElementById('recentPropertiesList');
  if (!c) return;
  c.innerHTML = properties.slice(0, 5).map((p) => `
    <div class="recent-prop-item">
      <img src="${escapeHtml(p.image || '/uploads/placeholder.jpg')}" alt="" class="recent-prop-thumb" onerror="this.style.display='none'">
      <div class="recent-prop-body">
        <strong>${escapeHtml(p.title)}</strong>
        <span class="recent-prop-meta">${escapeHtml(p.type || '')} · ${escapeHtml(p.location || '')}</span>
        <span class="recent-prop-price">${escapeHtml(formatPriceAdmin(p.price))}</span>
      </div>
      <button type="button" class="btn-edit compact" onclick="editProperty('${p._id}')">ویرایش</button>
    </div>`).join('');
}

function openLeadFromDashboard(id) {
  navigateTo('customers');
  setTimeout(() => {
    if (typeof editCustomer === 'function') editCustomer(id);
  }, 120);
}

function renderTopProperties(props) {
  const c = document.getElementById('topPropertiesList');
  if (!c) return;
  c.innerHTML = props.map((p, i) => `<div class="top-prop-item"><span class="top-prop-rank">${i + 1}</span><span class="top-prop-name">${escapeHtml(p.title)}</span><span class="top-prop-views">${(p.views || 0).toLocaleString('fa-IR')} بازدید</span></div>`).join('');
}

function renderLowProperties(props) {
  const c = document.getElementById('lowPropertiesList');
  if (!c) return;
  c.innerHTML = props.map((p, i) => `<div class="top-prop-item"><span class="top-prop-rank low">${i + 1}</span><span class="top-prop-name">${escapeHtml(p.title)}</span><span class="top-prop-views">${(p.views || 0).toLocaleString('fa-IR')} بازدید</span></div>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('page-dashboard')?.classList.contains('active')) loadDashboardStats();
});
