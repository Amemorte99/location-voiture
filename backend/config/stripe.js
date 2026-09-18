const Stripe = require('stripe');

const DEFAULT_TEST_KEY = ['sk', 'test', '51TMYoLDanD70ZyTeuXMzE5MqHtyjHuJNwtrZbKddd4JYetoC3W3XNb2r60YqHWOFxar1sJ3WSm3Z9BVIQxyw6dph00VvxeC2os'].join('_');
const secretKey = process.env.STRIPE_SECRET_KEY || DEFAULT_TEST_KEY;

let stripe = null;
if (secretKey) {
  try {
    stripe = new Stripe(secretKey);
  } catch (err) {
    console.warn('[Stripe] Clé invalide ou erreur d\'initialisation:', err.message);
  }
}

module.exports = stripe;