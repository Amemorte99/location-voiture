const stripe = require('../config/stripe');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const logger = require('../utils/logger');
const { sendBookingConfirmation } = require('../services/mailService');



const createPaymentIntent = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ message: 'Paiement par carte en ligne non configuré.' });
  }
  try {
    const { 
      carId, startDate, endDate, fullName, phone, optionsPrice = 0,
      pickupLocation, pickupTime, flightNumber, deliveryAddress, deliveryNotes
    } = req.body;

    const car = await Car.findOne({ _id: carId, deletedAt: null });
    if (!car) {
      return res.status(404).json({ message: 'Voiture non trouvée ou indisponible' });
    }

    const overlapping = await Booking.findOne({
      car: carId,
      deletedAt: null,
      status: { $nin: ['cancelled', 'completed'] },
      $and: [
        { startDate: { $lt: new Date(endDate) } },
        { endDate: { $gt: new Date(startDate) } }
      ]
    });
    if (overlapping) {
      return res.status(400).json({
        message: "Ce véhicule est déjà réservé pour cette période. Veuillez choisir d'autres dates."
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const finalTotalPrice = (totalDays * car.price) + Number(optionsPrice);

    
    const amountInCentimes = Math.round(finalTotalPrice * 100); 

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCentimes,
      currency: 'mad',
      payment_method_types: ['card'],
      metadata: {
        carId: car._id.toString(),
        carName: car.name,
        userId: req.user._id.toString(),
        userEmail: req.user.email,
        fullName,
        phone,
        startDate,
        endDate,
        totalDays: totalDays.toString(),
        totalPrice: finalTotalPrice.toString(),
        pickupLocation: (pickupLocation || '').slice(0, 100),
        pickupTime: (pickupTime || '').slice(0, 20),
        flightNumber: (flightNumber || '').slice(0, 50),
        deliveryAddress: (deliveryAddress || '').slice(0, 150),
        deliveryNotes: (deliveryNotes || '').slice(0, 200),
      }
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    logger.error("Stripe Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};


const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    logger.error(' STRIPE_WEBHOOK_SECRET manquant dans .env');
    return res.status(500).send('Webhook secret non configuré');
  }

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error(`Webhook signature invalide: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { metadata } = paymentIntent;

    try {
      
      const existingBooking = await Booking.findOne({
        user: metadata.userId,
        car: metadata.carId,
        startDate: new Date(metadata.startDate),
        deletedAt: null,
      });

      if (!existingBooking) {
        const overlapping = await Booking.findOne({
          car: metadata.carId,
          deletedAt: null,
          status: { $nin: ['cancelled', 'completed'] },
          $and: [
            { startDate: { $lt: new Date(metadata.endDate) } },
            { endDate: { $gt: new Date(metadata.startDate) } }
          ]
        });

        if (overlapping) {
          logger.error(`Webhook: chevauchement détecté pour ${metadata.fullName}, réservation non créée`);
          return res.json({ received: true });
        }

        const newBooking = await Booking.create({
          user: metadata.userId,
          car: metadata.carId,
          fullName: metadata.fullName,
          phone: metadata.phone,
          startDate: new Date(metadata.startDate),
          endDate: new Date(metadata.endDate),
          totalDays: Number(metadata.totalDays),
          totalPrice: Number(metadata.totalPrice),
          paymentMethod: 'card',
          status: 'confirmed',
          pickupLocation: metadata.pickupLocation || 'Aéroport Fès-Saïss (Terminal Arrivées)',
          pickupTime: metadata.pickupTime || '',
          flightNumber: metadata.flightNumber || '',
          deliveryAddress: metadata.deliveryAddress || '',
          deliveryNotes: metadata.deliveryNotes || '',
        });
        logger.info(`Réservation confirmée via Webhook pour ${metadata.fullName}`);

        if (metadata.userEmail) {
          sendBookingConfirmation(newBooking, metadata.userEmail).catch(() => {});
        }
      } else {
        if (existingBooking.status !== 'confirmed' && existingBooking.status !== 'completed') {
          existingBooking.status = 'confirmed';
          await existingBooking.save();
          logger.info(`Réservation mise à jour à 'confirmed' via Webhook pour ${metadata.fullName}`);
          if (metadata.userEmail) {
            sendBookingConfirmation(existingBooking, metadata.userEmail).catch(() => {});
          }
        }
      }
    } catch (error) {
      logger.error(`Erreur création réservation via Webhook: ${error.message}`);
    }
  }

  
  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object;
    logger.warn(`  Paiement échoué pour PaymentIntent ${pi.id} — ${pi.last_payment_error?.message || 'raison inconnue'}`);
  }

  res.json({ received: true });
};

module.exports = { createPaymentIntent, handleStripeWebhook };
