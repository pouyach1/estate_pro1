/**
 * Seeded demo admin credentials for local/staging presentation.
 * Never exposed when NODE_ENV === 'production'.
 */
const DEMO_ADMIN_USERNAME = process.env.DEMO_ADMIN_USERNAME || 'admin@astoria.local';
const DEMO_ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || 'AstoriaDemo2026!';

function isDemoEnvironment() {
  return process.env.NODE_ENV !== 'production';
}

function getDemoCredentials() {
  return {
    username: DEMO_ADMIN_USERNAME,
    password: DEMO_ADMIN_PASSWORD,
  };
}

module.exports = {
  DEMO_ADMIN_USERNAME,
  DEMO_ADMIN_PASSWORD,
  isDemoEnvironment,
  getDemoCredentials,
};
