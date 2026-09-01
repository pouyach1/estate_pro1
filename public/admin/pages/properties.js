function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function formatPropertyPrice(price) {
  if (!price && price !== 0) return 'تماس بگیرید';
  return `${Number(price).toLocaleString('fa-IR')} تومان`;
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
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><h3>هنوز ملکی ثبت نشده است</h3><p>اولین ملک خود را اضافه کنید تا در وب‌سایت نمایش داده شود.</p><button type="button" class="btn-gold-outline" onclick="navigateTo('add-property')">افزودن اولین ملک</button></div></td></tr>`;
      return;
    }

    tbody.innerHTML = data.properties.map((p) => `
      <tr data-title="${escapeHtml(p.title)}" data-type="${escapeHtml(p.type)}" data-location="${escapeHtml(p.location || '')}">
        <td><img src="${escapeHtml(p.image || '')}" class="table-img" alt="" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%2260%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23121822%22/%3E%3C/svg%3E'"></td>
        <td><strong>${escapeHtml(p.title)}</strong><br><small class="table-sub">${escapeHtml(p.location || '')}</small></td>
        <td>${escapeHtml(p.type)}</td>
        <td>${escapeHtml(formatPropertyPrice(p.price))}</td>
        <td>${p.isActive !== false ? '<span class="status-badge status-active">فعال</span>' : '<span class="status-badge status-inactive">غیرفعال</span>'}</td>
        <td>${(p.views || 0).toLocaleString('fa-IR')}</td>
        <td>${new Date(p.updatedAt || p.createdAt).toLocaleDateString('fa-IR')}</td>
        <td class="table-actions">
          <button class="btn-edit" onclick="editProperty('${p._id}')">ویرایش</button>
          <button class="btn-delete" onclick="confirmDelete('${p._id}')">حذف</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><h3>بارگذاری املاک انجام نشد</h3><p>اتصال به سرور برقرار نشد.</p><button type="button" class="btn-gold-outline" onclick="loadProperties()">تلاش مجدد</button></div></td></tr>';
  }
}

function filterPropertiesTable() {
  const q = document.getElementById('propertySearch')?.value.toLowerCase() || '';
  document.querySelectorAll('#propertiesTableBody tr').forEach((tr) => {
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}
