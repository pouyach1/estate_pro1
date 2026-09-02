require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const securityHeaders = require('./middleware/securityHeaders');
const errorHandler = require('./middleware/errorHandler');

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? false : true);

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB error:', err.message);
    process.exit(1);
  });

const app = express();

app.disable('x-powered-by');
app.use(securityHeaders);
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/agents', require('./routes/agentRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'ASTORIA ELITE ESTATES API', version: '1.0.0' });
});

if (process.env.NODE_ENV === 'production' && process.env.SERVE_STATIC === 'true') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    const notFound = path.join(distPath, '404.html');
    res.status(404).sendFile(notFound, (err) => {
      if (err) res.status(404).send('Not Found');
    });
  });
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
