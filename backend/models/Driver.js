const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom du chauffeur est requis'],
      trim: true,
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },
    phone: {
      type: String,
      required: [true, 'Le numéro de téléphone est requis'],
      trim: true,
      maxlength: [25, 'Le numéro ne peut pas dépasser 25 caractères'],
    },
    whatsapp: {
      type: String,
      trim: true,
      default: '',
      maxlength: [25, 'Le numéro WhatsApp ne peut pas dépasser 25 caractères'],
    },
    status: {
      type: String,
      enum: ['disponible', 'en_mission', 'repos'],
      default: 'disponible',
    },
    zone: {
      type: String,
      default: 'Toutes zones (Fès)',
      maxlength: [100, 'La zone ne peut pas dépasser 100 caractères'],
    },
    licenseNumber: {
      type: String,
      default: '',
      maxlength: [50, 'Le numéro de permis ne peut pas dépasser 50 caractères'],
    },
    completedMissions: {
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
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

driverSchema.index({ deletedAt: 1, status: 1 });
driverSchema.index({ name: 1 });

module.exports = mongoose.model('Driver', driverSchema);
