const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const analyzeRoutes = require('./routes/analyze');
const prRoutes = require('./routes/pr');
const repoRoutes = require('./routes/repo');
const webhooksRoutes = require('./routes/webhooks');
const settingsRoutes = require('./routes/settings');
const rateLimiter = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { client: promClient } = require('./services/metricsService');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '500kb' }));
app.use('/api', rateLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'prsense-backend', timestamp: Date.now() });
});

app.use('/api', analyzeRoutes);
app.use('/api', prRoutes);
app.use('/api', repoRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api', settingsRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (e) {
    res.status(500).end(e && e.message ? e.message : 'error');
  }
});

const server = app.listen(port, () => {
  console.log(`PRSense backend listening on port ${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
