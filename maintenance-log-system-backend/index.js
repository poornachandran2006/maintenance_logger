// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const maintenanceRoutes = require('./routes/maintenance.route');
const machinesRoutes = require('./routes/machines.route');
const analyticsRoutes = require('./routes/analytics.route');
// optionally auth / file routes if you already have them
const authRoutes = require('./routes/auth.route') || null;
const fileRoutes = require('./routes/file.route') || null;

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

const corsOptions = {
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/machines', machinesRoutes);
app.use('/api/analytics', analyticsRoutes);

if (authRoutes) app.use('/api/auth', authRoutes);
if (fileRoutes) app.use('/api/file', fileRoutes);

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI not set in .env — please add it');
  process.exit(1);
}

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Mongo connection error', err);
    process.exit(1);
  });
