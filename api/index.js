process.env.VERCEL = '1';
const connectDB = require('../backend/config/db');
const app = require('../backend/server');

// Démarrer la connexion MongoDB dès le démarrage du conteneur serverless
connectDB().catch(err => {
  console.error('[Vercel Serverless] Erreur connexion MongoDB initiale:', err.message);
});

// Middleware pour s'assurer que MongoDB est connecté avant chaque requête
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless] Erreur vérification MongoDB:', err.message);
  }
  next();
});

// Export direct de l'application Express (format standard Vercel)
module.exports = app;
