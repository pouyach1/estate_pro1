// ==============================================
// ASTORIA ADMIN — Shared Module
// ==============================================

const API = 'http://localhost:5000/api';
const token = localStorage.getItem('astoria_token');

// Only redirect if we're NOT on the login page
const currentPage = window.location.pathname.split('/').pop();
if (!token && currentPage !== 'index.html' && currentPage !== '') {
  window.location.href = 'index.html';
}

function headers(custom = {}) {
  return { ...custom, 'Authorization': `Bearer ${token}` };
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function navigateTo(page) {
  document.querySelectorAll('.sidebar-nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));

  const navBtn = document.querySelector(`[data-page="${page}"]`);
  const pageEl = document.getElementById(`page-${page}`);

  if (navBtn) navBtn.classList.add('active');
  if (pageEl) pageEl.classList.add('active');

  if (window.innerWidth < 768) toggleSidebar();

  if (page === 'dashboard' && typeof loadDashboardStats === 'function') loadDashboardStats();
  if (page === 'properties' && typeof loadProperties === 'function') loadProperties();
  if (page === 'customers' && typeof loadCustomers === 'function') loadCustomers();
  if (page === 'add-property' && typeof resetForm === 'function') resetForm();
}

function toast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent.replace(/[^0-9]/g, '')) || 0;
  const duration = 800;
  const startTime = performance.now();
  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    el.textContent = Math.floor(start + (target - start) * progress).toLocaleString('fa-IR');
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function previewImage(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = document.getElementById('propImagePreview');
      if (img) { img.src = ev.target.result; img.style.display = 'block'; }
    };
    reader.readAsDataURL(file);
  }
}

function previewBg(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = document.getElementById('bgPreview');
      if (img) { img.src = ev.target.result; img.style.display = 'block'; }
    };
    reader.readAsDataURL(file);
  }
}

function confirmDelete(id) {
  window._deleteTargetId = id;
  document.getElementById('deleteModal').classList.add('active');
}

function closeModal() {
  window._deleteTargetId = null;
  document.getElementById('deleteModal').classList.remove('active');
}

async function uploadBackground() {
  const file = document.getElementById('bgImage').files[0];
  if (!file) return toast('تصویر انتخاب کنید', 'error');
  const fd = new FormData();
  fd.append('image', file);
  try {
    const res = await fetch(`${API}/settings/background`, { method: 'POST', headers: headers({}), body: fd });
    if (res.ok) {
      toast('✅ آپلود شد', 'success');
    } else {
      toast('❌ خطا', 'error');
    }
  } catch (e) {
    toast('❌ خطا', 'error');
  }
}

// Drag & Drop
document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('imageUploadZone');
  if (dropZone) {
    ['dragover', 'dragenter'].forEach(ev => dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.add('drag-over'); }));
    ['dragleave', 'drop'].forEach(ev => dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.remove('drag-over'); }));
    dropZone.addEventListener('drop', e => {
      const file = e.dataTransfer.files[0];
      if (file) {
        document.getElementById('propImage').files = e.dataTransfer.files;
        previewImage({ target: { files: [file] } });
      }
    });
  }

  document.getElementById('confirmDeleteBtn')?.addEventListener('click', async () => {
    const id = window._deleteTargetId;
    if (!id) return;
    const res = await fetch(`${API}/properties/${id}`, { method: 'DELETE', headers: headers() });
    if (res.ok) {
      closeModal();
      if (typeof loadProperties === 'function') loadProperties();
      if (typeof loadDashboardStats === 'function') loadDashboardStats();
      toast('حذف شد', 'info');
    }
  });
});