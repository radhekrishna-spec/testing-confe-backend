require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');

const { FRONTEND_URL, ADMIN_URL, BASE_URL } = require('./config');
const confessionRoutes = require('./routes/confessionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const submitRoutes = require('./routes/submitRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const collegeRoutes = require('./routes/collegeRoutes');
const adminSetupRoutes = require('./routes/adminSetupRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

const { startWorkers } = require('./workers/index');
const { FRONTEND_URL, BASE_URL, ADMIN_URL } = require('./config');

// logs folder
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), {
  flags: 'a',
});

// middlewares
const allowedOrigins = [BASE_URL, FRONTEND_URL, ADMIN_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(compression());

app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log('🔥 INCOMING REQUEST:', {
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    query: req.query,
    body: req.body,
  });
  next();
});

//health
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'UP',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});
app.get('/api/song-search', async (req, res) => {
  try {
    const q = req.query.q;

    if (!q) {
      return res.json({ data: [] });
    }

    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(
        q,
      )}&entity=song&limit=5`,
    );

    const data = await response.json();

    const songs = (data.results || []).map((song) => ({
      id: song.trackId,
      title: song.trackName,
      artist: {
        name: song.artistName,
      },
      previewUrl: song.previewUrl,
      artwork: song.artworkUrl100,
    }));

    res.json({ data: songs });
  } catch (error) {
    console.error('Song search error:', error);
    res.status(500).json({ data: [] });
  }
});
// Routes
app.use('/api/confessions', confessionRoutes);

app.use('/api/payment', paymentRoutes);

app.post('/api/test-submit', (req, res) => {
  res.status(200).json({
    success: true,
    route: 'working',
  });
});

app.use('/api/confessions', submitRoutes);
app.use('/api', settingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminSetupRoutes);

app.use('/api/college', collegeRoutes);

async function startServer() {
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on ${PORT}`);

    setTimeout(() => {
      startWorkers();
      console.log('✅ All workers started');
    }, 10000);
  });
}
app.use(express.static(path.join(__dirname, '../frontend/admin-ui/dist')));

app.get(['/admin', '/backend', '/admin/*'], (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin-ui/dist/index.html'));
});
app.use('*', (req, res) => {
  console.log('❌ 404 HIT:', req.method, req.originalUrl);

  res.status(404).json({
    success: false,
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl,
  });
});

// error handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);

  res.status(500).json({
    success: false,
    error: err.message || 'Internal error',
  });
});

startServer();
// SAFE WORKER STARTUP

// process level errors
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED:', err);
});
