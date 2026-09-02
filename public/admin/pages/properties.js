function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

const STATUS_LABELS = {
  available: 'فعال',
  reserved: 'رزرو',
  sold: 'فروخته',
  rented: 'اجاره',
};

function formatPropertyPrice(price) {
  if (!price && price !== 0) return 'تماس بگیرید';
  const num = Number(price);
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1).replace('.0', '')} میلیارد تومان`;
  return `${num.toLocaleString('fa-IR')} تومان`;
}

function propertyStatusBadge(p) {
  if (p.isActive === false) return '<span class="status-badge status-inactive">مخفی</span>';
  const label = STATUS_LABELS[p.status] || 'فعال';
  const cls = p.status === 'reserved' ? 'status-reserved' : p.status === 'sold' || p.status === 'rented' ? 'status-inactive' : 'status-active';
  return `<span class="status-badge ${cls}">${label}</span>`;
}

async function loadProperties() {
  const tbody = document.getElementById('propertiesTableBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="8"><div class="skeleton" style="height:48px;"></div></td></tr>';

  try {
    const res = await fetch(`${API}/admin/properties`, { headers: headers() });

    if (res.status === 401) {
      localStorage.clear();
      window.location.href = '/admin/';
      return;
    }

    if (!res.ok) throw new Error('load failed');

    const data = await res.json();

    if (!data.properties?.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><h3>هنوز ملکی ثبت نشده است</h3><p>اولین ملک خود را اضافه کنید تا در وب‌سایت نمایش داده شود.</p><button type="button" class="btn-secondary" onclick="navigateTo('add-property')">افزودن اولین ملک</button></div></td></tr>`;
      tbody.querySelector('tr')?.setAttribute('data-skip-filter', 'true');
      return;
    }

    tbody.innerHTML = data.properties.map((p) => `
      <tr data-title="${escapeHtml(p.title)}" data-type="${escapeHtml(p.type)}" data-location="${escapeHtml(p.location || '')}">
        <td><img src="${escapeHtml(p.image || '')}" class="table-img" alt="" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%2260%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23121822%22/%3E%3C/svg%3E'"></td>
        <td><strong>${escapeHtml(p.title)}</strong><br><small class="table-sub">${escapeHtml(p.location || '')}</small></td>
        <td>${escapeHtml(p.type)}</td>
        <td>${escapeHtml(formatPropertyPrice(p.price))}</td>
        <td>${propertyStatusBadge(p)}${p.isFeatured ? ' <span class="status-badge status-featured">شاخص</span>' : ''}${p.isExclusive ? ' <span class="status-badge status-exclusive">اختصاصی</span>' : ''}</td>
        <td>${(p.views || 0).toLocaleString('fa-IR')}</td>
        <td>${new Date(p.updatedAt || p.createdAt).toLocaleDateString('fa-IR')}</td>
        <td class="table-actions">
          <button class="btn-edit" onclick="editProperty('${p._id}')">ویرایش</button>
          <button class="btn-delete" onclick="confirmDelete('${p._id}')">حذف</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><h3>بارگذاری املاک انجام نشد</h3><p>اتصال به سرور برقرار نشد.</p><button type="button" class="btn-secondary" onclick="loadProperties()">تلاش مجدد</button></div></td></tr>';
    tbody.querySelector('tr')?.setAttribute('data-skip-filter', 'true');
  }
}

function filterPropertiesTable() {
  const q = document.getElementById('propertySearch')?.value.toLowerCase() || '';
  const tbody = document.getElementById('propertiesTableBody');
  if (!tbody) return;
  let visible = 0;
  tbody.querySelectorAll('tr').forEach((tr) => {
    if (tr.dataset.skipFilter) return;
    const show = tr.textContent.toLowerCase().includes(q);
    tr.style.display = show ? '' : 'none';
    if (show) visible += 1;
  });
  tbody.querySelector('.table-no-results')?.remove();
  if (q && visible === 0) {
    tbody.insertAdjacentHTML('beforeend', `<tr class="table-no-results" data-skip-filter="true"><td colspan="8">نتیجه‌ای برای «${escapeHtml(q)}» یافت نشد</td></tr>`);
  }
}
