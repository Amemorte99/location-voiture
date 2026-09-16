require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./utils/errorHandler');


const logger = require('./utils/logger');
const { initCronJobs } = require('./services/cronService');

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
requiredEnvVars.forEach(key => {
  if (!process.env[key]) {
    logger.error(`CRITICAL: Missing environment variable: ${key}`);
    process.exit(1);
  }
});

if (!process.env.STRIPE_SECRET_KEY) {
  logger.warn('STRIPE_SECRET_KEY non configurée — paiements par carte désactivés');
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  logger.warn('STRIPE_WEBHOOK_SECRET non configurée — webhook Stripe désactivé en mode local');
}

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const carRoutes = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const driverRoutes = require('./routes/driverRoutes');

const seedInitialDrivers = async () => {
  try {
    const Driver = require('./models/Driver');
    const count = await Driver.countDocuments({ deletedAt: null });
    if (count === 0) {
      await Driver.insertMany([
        {
          name: 'Karim Alami',
          phone: '06 61 48 92 15',
          whatsapp: '212661489215',
          zone: 'Spécialiste Aéroport Fès-Saïss',
          licenseNumber: '23/184920',
          status: 'disponible',
          completedMissions: 148,
        },
        {
          name: 'Youssef Benmoussa',
          phone: '06 68 89 82 45',
          whatsapp: '212668898245',
          zone: 'Agence Quartier Atlas & Centre',
          licenseNumber: '23/159834',
          status: 'disponible',
          completedMissions: 192,
        },
        {
          name: 'Rachid Tazi',
          phone: '06 63 74 19 82',
          whatsapp: '212663741982',
          zone: 'Hôtels & Riads (Médina)',
          licenseNumber: '23/132470',
          status: 'en_mission',
          completedMissions: 116,
        },
        {
          name: 'Omar El Fassi',
          phone: '06 62 35 88 19',
          whatsapp: '212662358819',
          zone: 'Gare Ferroviaire Fès-Ville',
          licenseNumber: '23/198751',
          status: 'repos',
          completedMissions: 85,
        },
      ]);
      logger.info('Équipe de 4 chauffeurs professionnels initialisée avec données réelles');
    }
  } catch (err) {
    logger.error('Erreur seed chauffeurs:', err.message);
  }
};

let server;



const app = express();

app.set('trust proxy', 1);

app.use(compression({
  level: 6,
  threshold: 1024, 
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));



app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); 
app.use(mongoSanitize()); 


const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300, 
  message: { message: 'Trop de requêtes, veuillez réessayer dans 15 minutes' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, 
  message: { message: 'Trop de tentatives de connexion, réessayez dans 15 minutes' }
});



const allowedOrigins = ['http://localhost:3000', 'https://location-voiture.vercel.app'];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(...process.env.CLIENT_URL.split(',').map(u => u.trim()));
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;

    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const { handleStripeWebhook } = require('./controllers/stripeController');
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json({ limit: '10kb' }));


const staticCacheOptions = {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : '0',
  etag: true,
  lastModified: true,
};

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), staticCacheOptions));
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images'), staticCacheOptions));


app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/drivers', driverRoutes);


app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});


app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/', (req, res) => {
  res.json({ message: 'API LocaFès is running...' });
});


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedInitialDrivers();
  initCronJobs();
  server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}).catch(err => {
  logger.error('Failed to initialize database and start server:', err.message);
  process.exit(1);
});

const { stopDB } = require('./config/db');
const gracefulShutdown = () => {
  logger.info('Shutting down server gracefully...');
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await stopDB();
        logger.info('MongoDB connection closed.');
      } catch (err) {
        logger.error('Error closing MongoDB connection:', err.message);
      }
      process.exit(0);
    });
  } else {
    stopDB().finally(() => process.exit(0));
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

