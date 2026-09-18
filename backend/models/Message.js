const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },
    phone: {
      type: String,
      required: [true, 'Le numéro de téléphone est obligatoire'],
      trim: true,
      maxlength: [30, 'Le numéro de téléphone ne peut pas dépasser 30 caractères'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    subject: {
      type: String,
      trim: true,
      default: "Demande d'information",
      maxlength: [150, "L'objet ne peut pas dépasser 150 caractères"],
    },
    message: {
      type: String,
      required: [true, 'Le message est obligatoire'],
      trim: true,
      maxlength: [2000, 'Le message ne peut pas dépasser 2000 caractères'],
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'archived'],
      default: 'unread',
    },
    treatedAt: {
      type: Date,
      default: null,
    },
    treatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
    },
    source: {
      type: String,
      default: 'website_contact',
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
