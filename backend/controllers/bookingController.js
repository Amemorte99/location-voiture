const Booking = require('../models/Booking');
const Car = require('../models/Car');
const { resolveImageUrl } = require('../utils/imageHelper');
const { sendBookingConfirmation } = require('../services/mailService');

const createBooking = async (req, res) => {
  try {
    const { 
      car, fullName, phone, startDate, endDate, paymentMethod, 
      pickupLocation, pickupTime, flightNumber, deliveryAddress, deliveryNotes, babySeat 
    } = req.body;

    const carDetails = await Car.findOne({ _id: car, deletedAt: null });
    if (!carDetails) {
      return res.status(404).json({ message: 'Véhicule non trouvé ou indisponible' });
    }

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    
    if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
      return res.status(400).json({ message: 'Dates de début ou de fin invalides' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkStartDate = new Date(sDate);
    checkStartDate.setHours(0, 0, 0, 0);
    if (checkStartDate < today) {
      return res.status(400).json({ message: "La date de début doit être dans le futur ou aujourd'hui" });
    }

    if (eDate <= sDate) {
      return res.status(400).json({ message: 'La date de fin doit être strictement après la date de début' });
    }

    const diffTime = Math.abs(eDate - sDate);
    const calculatedTotalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const isBabySeat = Boolean(babySeat);
    const calculatedTotalPrice = (calculatedTotalDays * carDetails.price) + (isBabySeat ? calculatedTotalDays * 2000 : 0);

    const overlapping = await Booking.findOne({
      car,
      deletedAt: null,
      status: { $nin: ['cancelled', 'completed'] },
      $and: [
        { startDate: { $lt: new Date(endDate) } },
        { endDate: { $gt: new Date(startDate) } }
      ]
    });

    if (overlapping) {
      // Si la réservation chevauchante est celle créée par le webhook Stripe pour le même utilisateur, on la retourne
      if (paymentMethod === 'card' && overlapping.user.toString() === req.user._id.toString()) {
        const existingPopulated = await Booking.findById(overlapping._id)
          .populate('car', 'name image price')
          .populate('user', 'name email');
        existingPopulated.car.image = resolveImageUrl(existingPopulated.car.image);
        return res.status(200).json(existingPopulated);
      }
      return res.status(400).json({ message: 'Ce véhicule est déjà réservé pour cette période. Veuillez choisir d\'autres dates.' });
    }

    const booking = await Booking.create({
      user: req.user._id,
      car,
      fullName,
      phone,
      startDate,
      endDate,
      totalDays: calculatedTotalDays,
      totalPrice: calculatedTotalPrice,
      paymentMethod,
      pickupLocation: pickupLocation || 'Aéroport de N’Djamena (Terminal Arrivées)',
      pickupTime: pickupTime || '',
      flightNumber: flightNumber || '',
      deliveryAddress: deliveryAddress || '',
      deliveryNotes: deliveryNotes || '',
      babySeat: isBabySeat,
      status: 'confirmed', // Réservation immédiatement confirmée et garantie pour le client
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('car', 'name image price')
      .populate('user', 'name email');

    populatedBooking.car.image = resolveImageUrl(populatedBooking.car.image);

    if (populatedBooking.user?.email) {
      sendBookingConfirmation(populatedBooking, populatedBooking.user.email).catch(() => {});
    }

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const getMyBookings = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const query = { user: req.user._id, deletedAt: null };

    const totalBookings = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('car', 'name image price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const bookingsWithImages = bookings.map(b => {
      if (b.car) {
        b.car.image = resolveImageUrl(b.car.image);
      }
      return b;
    });

    res.json({
      bookings: bookingsWithImages,
      page,
      totalPages: Math.ceil(totalBookings / limit),
      totalBookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getAllBookings = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;
    const { search } = req.query;

    
    const query = { deletedAt: null };
    if (search) {
      const safeSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      query.$or = [
        { fullName: { $regex: safeSearch, $options: 'i' } },
        { phone: { $regex: safeSearch, $options: 'i' } },
        { flightNumber: { $regex: safeSearch, $options: 'i' } },
        { deliveryAddress: { $regex: safeSearch, $options: 'i' } },
        { pickupLocation: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const totalBookings = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('car', 'name image price')
      .populate('user', 'name email')
      .populate('assignedDriver', 'name phone whatsapp status zone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const bookingsWithImages = bookings.map(b => {
      if (b.car) {
        b.car.image = resolveImageUrl(b.car.image);
      }
      return b;
    });

    res.json({
      bookings: bookingsWithImages,
      page,
      totalPages: Math.ceil(totalBookings / limit),
      totalBookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, deletedAt: null });
    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = booking.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
       return res.status(403).json({ message: 'Non autorisé' });
    }

    if (req.body.status) {
      const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({ message: 'Statut de réservation invalide' });
      }
    }

    if (!isAdmin) {
       if (req.body.status !== 'cancelled' || booking.status !== 'pending') {
          return res.status(400).json({ message: "Vous ne pouvez annuler qu'une réservation en attente" });
       }
    }

    booking.status = req.body.status || booking.status;
    if (isAdmin && req.body.assignedDriver !== undefined) {
      booking.assignedDriver = req.body.assignedDriver || null;
    }
    const updatedBooking = await booking.save();

    const populated = await Booking.findById(updatedBooking._id)
      .populate('car', 'name image price')
      .populate('user', 'name email')
      .populate('assignedDriver', 'name phone whatsapp status zone')
      .lean();
    
    if (populated && populated.car) {
      populated.car.image = resolveImageUrl(populated.car.image);
    }
    
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, deletedAt: null });
    if (booking) {
      booking.deletedAt = new Date();
      await booking.save();
      
      res.json({ message: 'Réservation supprimée' });
    } else {
      res.status(404).json({ message: 'Réservation non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createBooking, 
  getMyBookings, 
  getAllBookings, 
  updateBookingStatus, 
  deleteBooking
};
