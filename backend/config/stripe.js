const Stripe = require('stripe');

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  } catch (err) {
    console.warn('[Stripe] Clé invalide ou erreur d\'initialisation:', err.message);
  }
}

module.exports = stripe;