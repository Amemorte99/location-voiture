const cron = require('node-cron');
const Booking = require('../models/Booking');
const logger = require('../utils/logger');

const initCronJobs = () => {
  // Run every hour to mark passed bookings as completed
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const result = await Booking.updateMany(
        {
          status: 'confirmed',
          endDate: { $lt: now },
          deletedAt: null
        },
        {
          $set: { status: 'completed' }
        }
      );

      if (result.modifiedCount > 0) {
        logger.info(`Cron: ${result.modifiedCount} réservation(s) échue(s) marquée(s) comme terminée(s)`);
      }
    } catch (error) {
      logger.error('Erreur lors de l\'exécution du cron job:', error.message);
    }
  });

  logger.info('Tâches planifiées (cron) initialisées avec succès');
};

module.exports = { initCronJobs };
