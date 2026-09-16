process.env.VERCEL = '1';
const app = require('../backend/server');
const connectDB = require('../backend/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless] Erreur connexion MongoDB:', err);
  }
  return app(req, res);
};
