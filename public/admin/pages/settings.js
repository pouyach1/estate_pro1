async function loadSettingsPreview() {
  const preview = document.getElementById('bgPreview');
  if (!preview) return;
  try {
    const res = await fetch(`${API}/settings`);
    const data = await res.json();
    if (data.heroBackground) {
      preview.src = data.heroBackground;
      preview.style.display = 'block';
    }
  } catch (e) {
    // silent — settings preview is optional
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadSettingsPreview();
});
