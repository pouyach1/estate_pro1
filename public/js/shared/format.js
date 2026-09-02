export function formatPrice(price) {
  if (price === null || price === undefined || price === '') return null;
  const num = Number(price);
  if (Number.isNaN(num)) return null;
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1).replace('.0', '')} میلیارد`;
  if (num >= 1000000) return `${Math.floor(num / 1000000).toLocaleString('fa-IR')} میلیون`;
  if (num >= 1000) return `${Math.floor(num / 1000).toLocaleString('fa-IR')} هزار`;
  return num.toLocaleString('fa-IR');
}

export function formatPriceDisplay(price) {
  const formatted = formatPrice(price);
  return formatted ? `${formatted} تومان` : 'تماس برای اطلاع از قیمت';
}

export function formatArea(area) {
  const num = Number(area);
  if (!num) return '';
  return `${num.toLocaleString('fa-IR')} متر`;
}

export function formatBedrooms(beds) {
  const num = Number(beds);
  if (!num) return '';
  return `${num.toLocaleString('fa-IR')} خواب`;
}

export function formatBathrooms(baths) {
  const num = Number(baths);
  if (!num) return '';
  return `${num.toLocaleString('fa-IR')} حمام`;
}

export function formatParking(parking) {
  const num = Number(parking);
  if (!num) return '';
  return `${num.toLocaleString('fa-IR')} پارکینگ`;
}

export function getPropertyMetric(property) {
  const parts = [];
  const area = formatArea(property?.area);
  const beds = formatBedrooms(property?.beds);
  const baths = formatBathrooms(property?.baths);
  const parking = formatParking(property?.features?.common?.parking ?? property?.parking);
  if (area) parts.push(area);
  if (beds) parts.push(beds);
  if (baths) parts.push(baths);
  if (parking) parts.push(parking);
  return parts.join(' · ');
}

export const PROPERTY_STATUS_LABELS = {
  available: 'فعال',
  reserved: 'رزرو شده',
  sold: 'فروخته شده',
  rented: 'اجاره رفته',
};

export function getStatusLabel(status) {
  return PROPERTY_STATUS_LABELS[status] || '';
}

export function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
