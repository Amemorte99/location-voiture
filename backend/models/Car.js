const mongoose = require('mongoose');

const carSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom de la voiture est requis'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'La marque de la voiture est requise'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: [0, 'Le prix ne peut pas être négatif'],
    },
    image: {
      type: String,
      required: [true, 'L\'image est requise'],
    },
    year: {
      type: Number,
      required: [true, 'L\'année est requise'],
    },
    fuel: {
      type: String,
      required: [true, 'Le type de carburant est requis'],
      enum: ['Essence', 'Diesel', 'Électrique', 'Hybride'],
    },
    gearbox: {
      type: String,
      required: [true, 'Le type de boîte est requis'],
      enum: ['Manuelle', 'Automatique'],
    },
    available: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères'],
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'User',
        },
        name: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      }
    ],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
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

carSchema.index({ available: 1 });
carSchema.index({ deletedAt: 1, price: 1, year: -1 });

module.exports = mongoose.model('Car', carSchema);
