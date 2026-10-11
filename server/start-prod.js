/**
 * Production entry for single-process deploy (API + built frontend).
 * Safe to run from repo root or server/: dotenv path is resolved relative to this file.
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.SERVE_STATIC = 'true';

require('./server.js');
