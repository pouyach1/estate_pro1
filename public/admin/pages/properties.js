async function loadProperties() {
  const tbody = document.getElementById('propertiesTableBody');
  if (!tbody) return;
  try {
    const res = await fetch(`${API}/properties`);
    const data = await res.json();
    if (!data.properties?.length) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><h3>هیچ ملکی یافت نشد</h3></div></td></tr>';
      return;
    }
    tbody.innerHTML = data.properties.map(p => `
      <tr data-title="${p.title}" data-type="${p.type}">
        <td><img src="${p.image||'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=100&q=60'}" class="table-img" alt=""></td>
        <td>${p.title}</td>
        <td>${p.type}</td>
        <td>${p.price ? Number(p.price).toLocaleString('fa-IR')+' تومان' : 'تماس بگیرید'}</td>
        <td>${(p.views||0).toLocaleString('fa-IR')}</td>
        <td>
          <button class="btn-edit" onclick="editProperty('${p._id}')">ویرایش</button>
          <button class="btn-delete" onclick="confirmDelete('${p._id}')">حذف</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><h3>خطا در بارگذاری</h3></div></td></tr>';
  }
}

function filterPropertiesTable() {
  const q = document.getElementById('propertySearch')?.value.toLowerCase() || '';
  document.querySelectorAll('#propertiesTableBody tr').forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}