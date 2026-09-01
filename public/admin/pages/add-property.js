// ==============================================
// ASTORIA ADMIN — Add/Edit Property Page
// ==============================================

let currentStep = 1;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Show step 1 by default
  showStep(1);
  
  // Form submit
  const form = document.getElementById('propertyForm');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
});

// ===== TYPE SELECTION =====
function selectType(type) {
  document.getElementById('selectedType').value = type;
  document.querySelectorAll('.property-type-card').forEach(c => c.classList.remove('selected'));
  const card = document.querySelector(`.property-type-card[data-type="${type}"]`);
  if (card) {
    card.classList.add('selected');
    card.style.transform = 'scale(1.03)';
    setTimeout(() => { card.style.transform = ''; }, 300);
  }
  setTimeout(() => nextStep(), 500);
}

// ===== STEP NAVIGATION =====
function showStep(step) {
  currentStep = step;
  
  // Hide all steps
  document.querySelectorAll('.form-step').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  
  // Show current step
  const currentEl = document.getElementById(`step-${step}`);
  if (currentEl) {
    currentEl.classList.add('active');
    currentEl.style.display = 'block';
    currentEl.style.animation = 'fadeSlideIn 0.5s ease forwards';
  }
  
  // Update progress bar
  document.querySelectorAll('.progress-step').forEach(p => {
    p.classList.remove('active', 'done');
  });
  for (let i = 1; i <= 3; i++) {
    const progressEl = document.querySelector(`.progress-step[data-step="${i}"]`);
    if (progressEl) {
      if (i < step) progressEl.classList.add('done');
      else if (i === step) progressEl.classList.add('active');
    }
  }
  
  // Update buttons
  const btnBack = document.getElementById('btnBack');
  const btnNext = document.getElementById('btnNext');
  const submitBtn = document.getElementById('submitBtn');
  
  if (btnBack) btnBack.style.display = step > 1 ? 'inline-flex' : 'none';
  if (btnNext) btnNext.style.display = step < 3 ? 'inline-flex' : 'none';
  if (submitBtn) {
    submitBtn.style.display = step === 3 ? 'inline-flex' : 'none';
    const editId = document.getElementById('editPropertyId')?.value;
    submitBtn.textContent = editId ? 'بروزرسانی ملک' : 'ثبت ملک';
  }
  
  // Load features on step 3
  if (step === 3) {
    const type = document.getElementById('selectedType')?.value;
    if (type) renderFeatureFields(type);
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep() {
  if (currentStep === 1) {
    const type = document.getElementById('selectedType')?.value;
    if (!type) {
      toast('لطفاً نوع ملک را انتخاب کنید', 'error');
      return;
    }
  }
  if (currentStep === 2) {
    const title = document.getElementById('propTitle')?.value?.trim();
    if (!title) {
      toast('عنوان ملک الزامی است', 'error');
      return;
    }
  }
  showStep(currentStep + 1);
}

function prevStep() {
  showStep(currentStep - 1);
}

// ===== RESET =====
function resetForm() {
  document.getElementById('propertyForm')?.reset();
  const selectedType = document.getElementById('selectedType');
  if (selectedType) selectedType.value = '';
  const editId = document.getElementById('editPropertyId');
  if (editId) editId.value = '';
  const editIndicator = document.getElementById('editModeIndicator');
  if (editIndicator) editIndicator.classList.remove('active');
  const preview = document.getElementById('propImagePreview');
  if (preview) preview.style.display = 'none';
  const dynamicFeatures = document.getElementById('dynamicFeatures');
  if (dynamicFeatures) dynamicFeatures.innerHTML = '';
  document.querySelectorAll('.property-type-card').forEach(c => c.classList.remove('selected'));
  showStep(1);
}

// ===== FEATURE RENDERING =====
function renderFeatureFields(type) {
  const container = document.getElementById('dynamicFeatures');
  if (!container) return;
  if (!type) { container.innerHTML = ''; return; }
  
  const feats = getFeaturesForType(type);
  let html = '';
  
  const categories = [
    { cat: 'common', data: feats.common, title: FEATURE_CATEGORIES.common },
    { cat: 'specific', data: feats.specific, title: FEATURE_CATEGORIES.specific },
    { cat: 'luxury', data: feats.luxury, title: FEATURE_CATEGORIES.luxury }
  ];
  
  categories.forEach(({ cat, data, title }) => {
    if (!data || !data.length) return;
    html += `<h4 class="form-section-subtitle">${title}</h4>`;
    html += '<div class="features-grid">';
    data.forEach(f => {
      html += renderField(f, cat);
    });
    html += '</div>';
  });
  
  container.innerHTML = html;
}

function renderField(f, cat) {
  const id = `feat_${cat}_${f.key}`;
  
  if (f.field_type === 'boolean') {
    return `<label class="checkbox-label">
      <input type="checkbox" id="${id}"> ${f.label_fa}
    </label>`;
  }
  
  if (f.field_type === 'number') {
    return `<div class="form-group">
      <label for="${id}">${f.label_fa}</label>
      <input type="number" id="${id}" min="${f.min || 0}" max="${f.max || ''}" value="${f.min || 0}">
    </div>`;
  }
  
  if (f.field_type === 'select') {
    const options = (f.options || []).map(o => `<option value="${o}">${o}</option>`).join('');
    return `<div class="form-group">
      <label for="${id}">${f.label_fa}</label>
      <select id="${id}">
        <option value="">انتخاب کنید</option>
        ${options}
      </select>
    </div>`;
  }
  
  return '';
}

// ===== FORM HELPERS =====
function setFeat(cat, key, val) {
  const el = document.getElementById(`feat_${cat}_${key}`);
  if (!el) return;
  if (el.type === 'checkbox') {
    el.checked = val === true || val === 'true';
  } else {
    el.value = val || '';
  }
}

function collectFeatures() {
  const type = document.getElementById('selectedType')?.value;
  if (!type) return { common: {}, specific: {}, luxury: {} };
  
  const feats = getFeaturesForType(type);
  const result = { common: {}, specific: {}, luxury: {} };
  
  feats.common.forEach(f => {
    const el = document.getElementById(`feat_common_${f.key}`);
    result.common[f.key] = f.field_type === 'boolean' ? (el?.checked || false) : (el?.value || '');
  });
  
  feats.specific.forEach(f => {
    const el = document.getElementById(`feat_specific_${f.key}`);
    result.specific[f.key] = f.field_type === 'boolean' ? (el?.checked || false) : (el?.value || '');
  });
  
  feats.luxury.forEach(f => {
    const el = document.getElementById(`feat_luxury_${f.key}`);
    result.luxury[f.key] = el?.checked || false;
  });
  
  return result;
}

// ===== EDIT PROPERTY =====
async function editProperty(id) {
  try {
    const res = await fetch(`${API}/admin/properties/${id}`, { headers: headers() });
    if (!res.ok) throw new Error('failed');
    const p = await res.json();

    navigateTo('add-property');

    document.getElementById('selectedType').value = p.type;
    document.querySelectorAll('.property-type-card').forEach((c) => c.classList.remove('selected'));
    const card = document.querySelector(`.property-type-card[data-type="${p.type}"]`);
    if (card) card.classList.add('selected');

    document.getElementById('editPropertyId').value = p._id;
    document.getElementById('editPropertyTitle').textContent = p.title;
    document.getElementById('editModeIndicator').classList.add('active');

    document.getElementById('propTitle').value = p.title || '';
    document.getElementById('propPrice').value = p.price || '';
    document.getElementById('propArea').value = p.area || 0;
    document.getElementById('propAge').value = p.age || 0;
    document.getElementById('propBeds').value = p.beds || 0;
    document.getElementById('propBaths').value = p.baths || 0;
    document.getElementById('propLocation').value = p.location || '';
    document.getElementById('propDesc').value = p.description || '';
    document.getElementById('propListingType').value = p.listingType || 'آگهی ویژه';

    const preview = document.getElementById('propImagePreview');
    if (preview && p.image) {
      preview.src = p.image;
      preview.style.display = 'block';
    }

    showStep(2);

    setTimeout(() => {
      const f = p.features || {};
      if (f.common) Object.entries(f.common).forEach(([k, v]) => setFeat('common', k, v));
      if (f.specific) Object.entries(f.specific).forEach(([k, v]) => setFeat('specific', k, v));
      if (f.luxury) Object.entries(f.luxury).forEach(([k, v]) => setFeat('luxury', k, v));
    }, 250);
  } catch (e) {
    toast('بارگذاری ملک انجام نشد', 'error');
  }
}

function cancelEdit() {
  resetForm();
  navigateTo('properties');
}

// ===== FORM SUBMIT =====
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const editId = document.getElementById('editPropertyId')?.value;
  const isEdit = !!editId;
  
  const fd = new FormData();
  fd.append('title', document.getElementById('propTitle')?.value || '');
  fd.append('type', document.getElementById('selectedType')?.value || '');
  fd.append('price', document.getElementById('propPrice')?.value || '');
  fd.append('area', document.getElementById('propArea')?.value || '0');
  fd.append('age', document.getElementById('propAge')?.value || '0');
  fd.append('beds', document.getElementById('propBeds')?.value || '0');
  fd.append('baths', document.getElementById('propBaths')?.value || '0');
  fd.append('location', document.getElementById('propLocation')?.value || '');
  fd.append('description', document.getElementById('propDesc')?.value || '');
  fd.append('listingType', document.getElementById('propListingType')?.value || 'آگهی ویژه');
  fd.append('isExclusive', true);
  fd.append('isActive', true);
  fd.append('features', JSON.stringify(collectFeatures()));
  
  const imgFile = document.getElementById('propImage')?.files?.[0];
  if (imgFile) fd.append('image', imgFile);
  
  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn?.textContent || 'ثبت';
  if (submitBtn) {
    submitBtn.textContent = 'در حال ثبت...';
    submitBtn.disabled = true;
  }
  
  try {
    const url = isEdit ? `${API}/properties/${editId}` : `${API}/properties`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: headers({}), body: fd });
    const data = await res.json();
    
    if (res.ok) {
      toast(isEdit ? 'اطلاعات ملک به‌روزرسانی شد' : 'ملک با موفقیت ثبت شد', 'success');
      resetForm();
      navigateTo('properties');
      if (typeof loadProperties === 'function') loadProperties();
      if (typeof loadDashboardStats === 'function') loadDashboardStats();
    } else {
      toast(data.message || 'ذخیره اطلاعات انجام نشد', 'error');
    }
  } catch (err) {
    toast('اتصال به سرور برقرار نشد', 'error');
  }
  
  if (submitBtn) {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}