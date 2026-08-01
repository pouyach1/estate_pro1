let currentCustomerId = null;

async function loadCustomers() {
  const tbody = document.getElementById('customersTableBody');
  if (!tbody) return;
  try {
    const res = await fetch(`${API}/customers`, { headers: headers() });
    const data = await res.json();
    if (!data.customers?.length) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><h3>هیچ مشتری یافت نشد</h3></div></td></tr>';
      return;
    }
    tbody.innerHTML = data.customers.map(c => `
      <tr>
        <td>${c.name}</td>
        <td>${c.email}</td>
        <td>${c.phone || '-'}</td>
        <td>${c.source || '-'}</td>
        <td>${c.message?.substring(0, 40) || '-'}</td>
        <td>${c.isRead ? '<span class="status-badge status-read">خوانده شده</span>' : '<span class="unread-badge">جدید</span>'}</td>
        <td>
          <button class="btn-edit" onclick="editCustomer('${c._id}')">ویرایش</button>
          <button class="btn-delete" onclick="confirmDeleteCustomer('${c._id}')">حذف</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><h3>خطا</h3></div></td></tr>';
  }
}

function filterCustomersTable() {
  const q = document.getElementById('customerSearch')?.value.toLowerCase() || '';
  document.querySelectorAll('#customersTableBody tr').forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

// ===== ADD / EDIT CUSTOMER =====
function showAddCustomerForm() {
  currentCustomerId = null;
  document.getElementById('customerFormTitle').textContent = 'افزودن مشتری جدید';
  document.getElementById('customerForm').reset();
  document.getElementById('customerFormId').value = '';
  document.getElementById('customerModal').classList.add('active');
}

async function editCustomer(id) {
  try {
    const res = await fetch(`${API}/customers/${id}`, { headers: headers() });
    const c = await res.json();
    currentCustomerId = c._id;
    document.getElementById('customerFormTitle').textContent = 'ویرایش مشتری';
    document.getElementById('customerFormId').value = c._id;
    document.getElementById('custName').value = c.name || '';
    document.getElementById('custEmail').value = c.email || '';
    document.getElementById('custPhone').value = c.phone || '';
    document.getElementById('custSource').value = c.source || '';
    document.getElementById('custMessage').value = c.message || '';
    document.getElementById('custNotes').value = c.notes || '';
    document.getElementById('custIsRead').checked = c.isRead || false;
    document.getElementById('customerModal').classList.add('active');
  } catch (e) { toast('خطا', 'error'); }
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
    isRead: document.getElementById('custIsRead').checked,
  };

  const btn = this.querySelector('button[type="submit"]');
  btn.textContent = 'در حال ذخیره...';
  btn.disabled = true;

  try {
    const url = isEdit ? `${API}/customers/${id}` : `${API}/customers`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(body) });
    const data = await res.json();
    if (res.ok) {
      toast(isEdit ? 'بروزرسانی شد' : 'افزوده شد', 'success');
      closeCustomerModal();
      loadCustomers();
      if (typeof loadDashboardStats === 'function') loadDashboardStats();
    } else {
      toast(data.message || 'خطا', 'error');
    }
  } catch (er) { toast('خطا', 'error'); }
  btn.textContent = 'ذخیره';
  btn.disabled = false;
});

// ===== DELETE =====
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
  if (!id) return;
  await fetch(`${API}/customers/${id}`, { method: 'DELETE', headers: headers() });
  closeDeleteCustomerModal();
  loadCustomers();
  if (typeof loadDashboardStats === 'function') loadDashboardStats();
  toast('حذف شد', 'info');
});