const WEAK_JWT_SECRETS = new Set([
  'your-secret-here',
  'secret',
  'jwt_secret',
  'changeme',
  'astoria',
  'password',
  'development',
]);

function validateEnv() {
  const errors = [];
  const isProduction = process.env.NODE_ENV === 'production';

  if (!process.env.MONGODB_URI) {
    errors.push('MONGODB_URI is required');
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    errors.push('JWT_SECRET is required');
  } else if (jwtSecret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters');
  } else if (WEAK_JWT_SECRETS.has(jwtSecret.toLowerCase())) {
    errors.push('JWT_SECRET is too weak — use a long random value');
  }

  if (isProduction && process.env.SERVE_STATIC !== 'true' && !process.env.CORS_ORIGIN) {
    errors.push('CORS_ORIGIN is required in production when SERVE_STATIC is not true');
  }

  if (errors.length) {
    console.error('Environment configuration error:');
    errors.forEach((message) => console.error(`  - ${message}`));
    process.exit(1);
  }

  if (!isProduction && jwtSecret && jwtSecret.length < 48) {
    console.warn('[env] Use a longer JWT_SECRET before staging/production deployment.');
  }
}

module.exports = { validateEnv };
