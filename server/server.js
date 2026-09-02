require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { validateEnv } = require('./config/env');
const securityHeaders = require('./middleware/securityHeaders');
const errorHandler = require('./middleware/errorHandler');

validateEnv();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = Number(process.env.PORT) || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const serveStatic = process.env.SERVE_STATIC === 'true';
const CORS_ORIGIN = process.env.CORS_ORIGIN || (isProduction && !serveStatic ? false : true);

const app = express();

app.disable('x-powered-by');
app.use(securityHeaders);
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbOk = dbState === 1;
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'degraded',
    database: dbOk ? 'connected' : 'disconnected',
    version: '1.0.0',
    static: serveStatic,
  });
});

app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/agents', require('./routes/agentRoutes'));

app.get('/', (req, res) => {
  if (serveStatic) {
    return res.redirect(302, '/index.html');
  }
  res.json({ message: 'ASTORIA ELITE ESTATES API', version: '1.0.0' });
});

if (serveStatic) {
  const distPath = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distPath)) {
    console.error(`SERVE_STATIC=true but dist not found at ${distPath}. Run npm run build first.`);
    process.exit(1);
  }

  app.use(express.static(distPath, { index: 'index.html', fallthrough: true }));

  const sendSpa = (res, relativePath) => {
    const filePath = path.join(distPath, relativePath);
    if (fs.existsSync(filePath)) return res.sendFile(filePath);
    return res.status(404).sendFile(path.join(distPath, '404.html'));
  };

  app.get(['/property', '/property/'], (req, res) => sendSpa(res, 'property/index.html'));
  app.get(['/admin', '/admin/'], (req, res) => sendSpa(res, 'admin/index.html'));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    const notFound = path.join(distPath, '404.html');
    if (fs.existsSync(notFound)) {
      return res.status(404).sendFile(notFound);
    }
    return res.status(404).send('Not Found');
  });
}

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'مسیر API یافت نشد' });
});

app.use(errorHandler);

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}${serveStatic ? ' (static + API)' : ' (API only)'}`);
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} received — shutting down`);
      server.close(async () => {
        await mongoose.connection.close(false);
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

start();
