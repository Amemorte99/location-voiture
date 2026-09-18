const Message = require('../models/Message');

// @desc    Créer un message de contact (Public)
// @route   POST /api/messages
// @access  Public
const createMessage = async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    if (!name || !name.trim() || !phone || !phone.trim() || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez renseigner votre nom, votre numéro de téléphone et votre message.',
      });
    }

    const newMessage = await Message.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : '',
      subject: subject && subject.trim() ? subject.trim() : "Demande d'information",
      message: message.trim(),
      status: 'unread',
    });

    res.status(201).json({
      success: true,
      message: 'Votre message a été envoyé avec succès.',
      data: newMessage,
    });
  } catch (error) {
    console.error('[Error createMessage]:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'envoi de votre message.',
      error: error.message,
    });
  }
};

// @desc    Obtenir la liste des messages (Admin)
// @route   GET /api/messages
// @access  Private/Admin
const getMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { phone: regex },
        { email: regex },
        { subject: regex },
        { message: regex },
      ];
    }

    const [messages, total, unreadCount] = await Promise.all([
      Message.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Message.countDocuments(query),
      Message.countDocuments({ status: 'unread' }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.json({
      success: true,
      messages,
      total,
      page,
      totalPages,
      unreadCount,
    });
  } catch (error) {
    console.error('[Error getMessages]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages.',
      error: error.message,
    });
  }
};

// @desc    Mettre à jour le statut d'un message (Admin)
// @route   PATCH /api/messages/:id/status
// @access  Private/Admin
const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['unread', 'read', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide. Utilisez "unread", "read" ou "archived".',
      });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message introuvable.',
      });
    }

    const unreadCount = await Message.countDocuments({ status: 'unread' });

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès.',
      data: updatedMessage,
      unreadCount,
    });
  } catch (error) {
    console.error('[Error updateMessageStatus]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du message.',
      error: error.message,
    });
  }
};

// @desc    Supprimer un message (Admin)
// @route   DELETE /api/messages/:id
// @access  Private/Admin
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Message.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Message introuvable.',
      });
    }

    const unreadCount = await Message.countDocuments({ status: 'unread' });

    res.json({
      success: true,
      message: 'Message supprimé avec succès.',
      unreadCount,
    });
  } catch (error) {
    console.error('[Error deleteMessage]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du message.',
      error: error.message,
    });
  }
};

module.exports = {
  createMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage,
};
