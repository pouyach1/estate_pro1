const STATUS_LABELS = {
  available: 'فعال',
  reserved: 'رزرو',
  sold: 'فروخته',
  rented: 'اجاره',
};

const LEAD_STATUS_LABELS = {
  new: 'جدید',
  contacted: 'تماس',
  follow_up: 'پیگیری',
  closed: 'بسته',
};

async function loadSettingsPreview() {
  const preview = document.getElementById('bgPreview');
  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }
  try {
    const res = await fetch(`${API}/settings`);
    const data = await res.json();
    if (preview && data.heroBackground) {
      preview.src = data.heroBackground;
      preview.style.display = 'block';
    }
    document.getElementById('settingContactPhone').value = data.contactPhone || '';
    document.getElementById('settingContactEmail').value = data.contactEmail || '';
    document.getElementById('settingContactAddress').value = data.contactAddress || '';

    const featuredSelect = document.getElementById('settingFeaturedProperty');
    if (featuredSelect) {
      const propsRes = await fetch(`${API}/admin/properties`, { headers: headers() });
      if (propsRes.ok) {
        const propsData = await propsRes.json();
        const current = data.featuredPropertyId || '';
        featuredSelect.innerHTML = '<option value="">انتخاب خودکار</option>' + (propsData.properties || []).map((p) =>
          `<option value="${p._id}" ${String(p._id) === String(current) ? 'selected' : ''}>${esc(p.title)}</option>`
        ).join('');
      }
    }
  } catch (e) {
    // optional preview
  }
}

async function saveSiteSettings() {
  const msg = document.getElementById('settingsMessage');
  const body = {
    contactPhone: document.getElementById('settingContactPhone')?.value || '',
    contactEmail: document.getElementById('settingContactEmail')?.value || '',
    contactAddress: document.getElementById('settingContactAddress')?.value || '',
    featuredPropertyId: document.getElementById('settingFeaturedProperty')?.value || '',
  };

  try {
    const res = await fetch(`${API}/settings`, {
      method: 'PUT',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'failed');
    if (msg) {
      msg.textContent = 'تنظیمات با موفقیت ذخیره شد';
      msg.className = 'admin-message success';
    }
    toast('تنظیمات ذخیره شد', 'success');
  } catch (e) {
    if (msg) {
      msg.textContent = 'ذخیره تنظیمات انجام نشد';
      msg.className = 'admin-message error';
    }
    toast('ذخیره تنظیمات انجام نشد', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadSettingsPreview();
});
