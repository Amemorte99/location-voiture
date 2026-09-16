const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Le nom complet est requis'],
      maxlength: [100, 'Le nom complet ne peut pas dépasser 100 caractères'],
    },
    phone: {
      type: String,
      required: [true, 'Le téléphone est requis'],
      maxlength: [20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères'],
    },
    startDate: {
      type: Date,
      required: [true, 'La date de début est requise'],
    },
    endDate: {
      type: Date,
      required: [true, 'La date de fin est requise'],
    },
    totalDays: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card'],
      default: 'cash',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    pickupLocation: {
      type: String,
      default: 'Agence Quartier Atlas (Bd Allal Ben Abdellah)',
      maxlength: 200,
    },
    pickupTime: {
      type: String,
      default: '',
      maxlength: 20,
    },
    flightNumber: {
      type: String,
      default: '',
      maxlength: 50,
    },
    deliveryAddress: {
      type: String,
      default: '',
      maxlength: 250,
    },
    deliveryNotes: {
      type: String,
      default: '',
      maxlength: 500,
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    babySeat: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ car: 1, startDate: 1, endDate: 1, status: 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ car: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ deletedAt: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
