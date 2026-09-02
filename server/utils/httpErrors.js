function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function clientErrorMessage(error, fallback = 'درخواست نامعتبر است') {
  if (!error) return fallback;
  if (isProduction()) return fallback;
  return error.message || fallback;
}

function serverPayload(error, fallback = 'خطای سرور') {
  const payload = { message: fallback };
  if (!isProduction() && error?.message) payload.detail = error.message;
  return payload;
}

module.exports = { isProduction, clientErrorMessage, serverPayload };
