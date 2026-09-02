let currentCustomerId = null;

const LEAD_STATUS_LABELS = {
  new: 'جدید',
  contacted: 'تماس گرفته شده',
  follow_up: 'نیاز به پیگیری',
  closed: 'بسته شده',
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function leadStatusBadge(status, isRead) {
  const key = status || (isRead ? 'contacted' : 'new');
  const label = LEAD_STATUS_LABELS[key] || 'جدید';
  const cls = key === 'new' ? 'unread-badge' : key === 'closed' ? 'status-inactive' : 'status-read';
  return `<span class="${cls === 'unread-badge' ? 'unread-badge' : `status-badge ${cls}`}">${label}</span>`;
}

function formatLeadDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
}

async function loadCustomers() {
  const tbody = document.getElementById('customersTableBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="8"><div class="skeleton" style="height:48px;"></div></td></tr>';

  try {
    const res = await fetch(`${API}/customers`, { headers: headers() });

    if (res.status === 401) {
      localStorage.clear();
      window.location.href = '/admin/';
      return;
    }

    if (!res.ok) throw new Error('load failed');

    const data = await res.json();
    const customers = (data.customers || []).sort((a, b) => {
      const rank = { new: 0, follow_up: 1, contacted: 2, closed: 3 };
      const diff = (rank[a.status] ?? 2) - (rank[b.status] ?? 2);
      if (diff !== 0) return diff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    if (!customers.length) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><h3>هنوز پیامی دریافت نشده است</h3><p>پیام‌های فرم تماس و درخواست بازدید اینجا نمایش داده می‌شوند.</p></div></td></tr>';
      tbody.querySelector('tr')?.setAttribute('data-skip-filter', 'true');
      return;
    }

    tbody.innerHTML = customers.map((c) => {
      const propertyLabel = c.propertyTitle || c.propertyId?.title || '-';
      const displayEmail = c.email?.includes('@tour.astoria') || c.email?.includes('@request.astoria') || c.email?.includes('@quick.astoria') ? '-' : (c.email || '-');
      return `
      <tr class="${c.status === 'new' ? 'lead-row-unread' : ''}" onclick="editCustomer('${c._id}')" style="cursor:pointer;">
        <td><strong>${escapeHtml(c.name)}</strong>${displayEmail !== '-' ? `<br><small class="table-sub">${escapeHtml(displayEmail)}</small>` : ''}</td>
        <td>${c.phone ? `<a href="tel:${escapeHtml(c.phone)}" onclick="event.stopPropagation()">${escapeHtml(c.phone)}</a>` : '-'}</td>
        <td>${escapeHtml(c.source || '-')}</td>
        <td>${escapeHtml(propertyLabel)}</td>
        <td>${escapeHtml((c.message || '-').substring(0, 50))}${(c.message || '').length > 50 ? '…' : ''}</td>
        <td>${leadStatusBadge(c.status, c.isRead)}</td>
        <td>${formatLeadDate(c.createdAt)}</td>
        <td class="table-actions" onclick="event.stopPropagation()">
          <button class="btn-edit" onclick="editCustomer('${c._id}')">مشاهده</button>
          <button class="btn-delete" onclick="confirmDeleteCustomer('${c._id}')">حذف</button>
        </td>
      </tr>`;
    }).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><h3>بارگذاری پیام‌ها انجام نشد</h3><p>اتصال به سرور برقرار نشد.</p><button type="button" class="btn-secondary" onclick="loadCustomers()">تلاش مجدد</button></div></td></tr>';
    tbody.querySelector('tr')?.setAttribute('data-skip-filter', 'true');
  }
}

function filterCustomersTable() {
  const q = document.getElementById('customerSearch')?.value.toLowerCase() || '';
  const tbody = document.getElementById('customersTableBody');
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

function showAddCustomerForm() {
  currentCustomerId = null;
  document.getElementById('customerFormTitle').textContent = 'افزودن مشتری جدید';
  document.getElementById('customerForm').reset();
  document.getElementById('customerFormId').value = '';
  document.getElementById('custPropertyWrap').hidden = true;
  document.getElementById('customerModal').classList.add('active');
}

async function editCustomer(id) {
  try {
    const res = await fetch(`${API}/customers/${id}`, { headers: headers() });
    if (!res.ok) throw new Error('failed');
    const c = await res.json();

    if (c.status === 'new' || !c.isRead) {
      await fetch(`${API}/customers/${id}`, {
        method: 'PUT',
        headers: headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ isRead: true, status: c.status === 'new' ? 'contacted' : c.status }),
      });
    }

    currentCustomerId = c._id;
    document.getElementById('customerFormTitle').textContent = c.status === 'new' ? 'درخواست جدید' : 'جزئیات درخواست';
    document.getElementById('customerFormId').value = c._id;
    document.getElementById('custName').value = c.name || '';
    document.getElementById('custEmail').value = c.email || '';
    document.getElementById('custPhone').value = c.phone || '';
    document.getElementById('custSource').value = c.source || '';
    document.getElementById('custMessage').value = c.message || '';
    document.getElementById('custNotes').value = c.notes || '';
    document.getElementById('custStatus').value = c.status || 'new';
    document.getElementById('custIsRead').checked = true;

    const propertyTitle = c.propertyTitle || c.propertyId?.title || '';
    const propertyWrap = document.getElementById('custPropertyWrap');
    if (propertyTitle) {
      propertyWrap.hidden = false;
      document.getElementById('custPropertyTitle').textContent = propertyTitle;
    } else {
      propertyWrap.hidden = true;
    }

    document.getElementById('customerModal').classList.add('active');

    loadCustomers();
    if (typeof loadDashboardStats === 'function') loadDashboardStats();
  } catch (e) {
    toast('بارگذاری پیام انجام نشد', 'error');
  }
}

function closeCustomerModal() {
  document.getElementById('customerModal').classList.remove('active');
}

document.getElementById('customerForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();
  const id = document.getElementById('customerFormId').value;
  const isEdit = !!id;
  const body = {
    name: document.getElementById('custName').value,
    email: document.getElementById('custEmail').value,
    phone: document.getElementById('custPhone').value,
    source: document.getElementById('custSource').value,
    message: document.getElementById('custMessage').value,
    notes: document.getElementById('custNotes').value,
    status: document.getElementById('custStatus').value,
    isRead: document.getElementById('custIsRead').checked,
  };

  const btn = this.querySelector('button[type="submit"]');
  const original = btn.textContent;
  btn.textContent = 'در حال ذخیره...';
  btn.disabled = true;

  try {
    const url = isEdit ? `${API}/customers/${id}` : `${API}/customers`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(body) });
    const data = await res.json();
    if (res.ok) {
      toast(isEdit ? 'درخواست ذخیره شد' : 'مشتری افزوده شد', 'success');
      closeCustomerModal();
      loadCustomers();
      if (typeof loadDashboardStats === 'function') loadDashboardStats();
    } else {
      toast(data.message || 'ذخیره اطلاعات انجام نشد', 'error');
    }
  } catch (er) {
    toast('اتصال به سرور برقرار نشد', 'error');
  }

  btn.textContent = original;
  btn.disabled = false;
});

function confirmDeleteCustomer(id) {
  window._deleteCustomerId = id;
  document.getElementById('deleteCustomerModal').classList.add('active');
}

function closeDeleteCustomerModal() {
  window._deleteCustomerId = null;
  document.getElementById('deleteCustomerModal').classList.remove('active');
}

document.getElementById('confirmDeleteCustomerBtn')?.addEventListener('click', async () => {
  const id = window._deleteCustomerId;
  const btn = document.getElementById('confirmDeleteCustomerBtn');
  if (!id || !btn) return;
  const original = btn.textContent;
  btn.textContent = 'در حال حذف...';
  btn.disabled = true;
  try {
    const res = await fetch(`${API}/customers/${id}`, { method: 'DELETE', headers: headers() });
    if (!res.ok) throw new Error('delete failed');
    closeDeleteCustomerModal();
    loadCustomers();
    if (typeof loadDashboardStats === 'function') loadDashboardStats();
    toast('پیام حذف شد', 'success');
  } catch (e) {
    toast('حذف انجام نشد', 'error');
  } finally {
    btn.textContent = original;
    btn.disabled = false;
  }
});
