const Driver = require('../models/Driver');
const Booking = require('../models/Booking');

// Format phone for WhatsApp (e.g. 66000000 -> 23566000000)
const formatWhatsAppNumber = (rawPhone) => {
  if (!rawPhone) return '';
  let cleaned = rawPhone.replace(/\D/g, '');
  if (cleaned.startsWith('00235')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('235')) {
    // already starts with 235
  } else if (cleaned.length === 8) {
    cleaned = '235' + cleaned;
  }
  return cleaned;
};

// @desc    Obtenir la liste des chauffeurs
// @route   GET /api/drivers
// @access  Admin
const getDrivers = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = { deletedAt: null };

    if (status && ['disponible', 'en_mission', 'repos'].includes(status)) {
      query.status = status;
    }

    if (search) {
      const safeSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { phone: { $regex: safeSearch, $options: 'i' } },
        { zone: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const drivers = await Driver.find(query).sort({ status: 1, name: 1 }).lean();

    // Stats globales
    const allActive = await Driver.find({ deletedAt: null }).lean();
    const stats = {
      total: allActive.length,
      disponible: allActive.filter(d => d.status === 'disponible').length,
      en_mission: allActive.filter(d => d.status === 'en_mission').length,
      repos: allActive.filter(d => d.status === 'repos').length,
    };

    res.json({ drivers, stats });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Erreur lors du chargement des chauffeurs' });
  }
};

// @desc    Créer un nouveau chauffeur
// @route   POST /api/drivers
// @access  Admin
const createDriver = async (req, res) => {
  try {
    const { name, phone, whatsapp, zone, licenseNumber, status } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Le nom et le numéro de téléphone sont obligatoires' });
    }

    const formattedWhatsApp = whatsapp ? formatWhatsAppNumber(whatsapp) : formatWhatsAppNumber(phone);

    const driver = await Driver.create({
      name: name.trim(),
      phone: phone.trim(),
      whatsapp: formattedWhatsApp,
      zone: zone || 'Toutes zones (N’Djamena)',
      licenseNumber: licenseNumber || '',
      status: status || 'disponible',
    });

    res.status(201).json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Erreur lors de la création du chauffeur' });
  }
};

// @desc    Modifier un chauffeur
// @route   PUT /api/drivers/:id
// @access  Admin
const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findOne({ _id: req.params.id, deletedAt: null });
    if (!driver) {
      return res.status(404).json({ message: 'Chauffeur non trouvé' });
    }

    const { name, phone, whatsapp, zone, licenseNumber, status, completedMissions } = req.body;

    if (name) driver.name = name.trim();
    if (phone) {
      driver.phone = phone.trim();
      if (!whatsapp) driver.whatsapp = formatWhatsAppNumber(phone);
    }
    if (whatsapp !== undefined) driver.whatsapp = formatWhatsAppNumber(whatsapp);
    if (zone !== undefined) driver.zone = zone;
    if (licenseNumber !== undefined) driver.licenseNumber = licenseNumber;
    if (status && ['disponible', 'en_mission', 'repos'].includes(status)) driver.status = status;
    if (completedMissions !== undefined) driver.completedMissions = Number(completedMissions) || 0;

    const updated = await driver.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Erreur lors de la mise à jour du chauffeur' });
  }
};

// @desc    Bascule rapide de statut d'un chauffeur
// @route   PATCH /api/drivers/:id/status
// @access  Admin
const updateDriverStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['disponible', 'en_mission', 'repos'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const driver = await Driver.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { status },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ message: 'Chauffeur non trouvé' });
    }

    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Erreur lors du changement de statut' });
  }
};

// @desc    Supprimer un chauffeur (soft delete)
// @route   DELETE /api/drivers/:id
// @access  Admin
const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findOne({ _id: req.params.id, deletedAt: null });
    if (!driver) {
      return res.status(404).json({ message: 'Chauffeur non trouvé' });
    }

    driver.deletedAt = new Date();
    driver.active = false;
    await driver.save();

    // Détacher le chauffeur des réservations en cours non terminées
    await Booking.updateMany(
      { assignedDriver: driver._id, status: { $nin: ['completed', 'cancelled'] } },
      { assignedDriver: null }
    );

    res.json({ message: 'Chauffeur retiré avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Erreur lors de la suppression' });
  }
};

// @desc    Assigner un chauffeur à une réservation
// @route   POST /api/drivers/assign
// @access  Admin
const assignDriverToBooking = async (req, res) => {
  try {
    const { bookingId, driverId, setDriverInMission } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, deletedAt: null });
    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    if (!driverId) {
      // Désassigner
      booking.assignedDriver = null;
      await booking.save();
      const populatedBooking = await Booking.findById(booking._id)
        .populate('car', 'name image price')
        .populate('user', 'name email')
        .lean();
      return res.json({ message: 'Chauffeur désassigné avec succès', booking: populatedBooking });
    }

    const driver = await Driver.findOne({ _id: driverId, deletedAt: null });
    if (!driver) {
      return res.status(404).json({ message: 'Chauffeur non trouvé' });
    }

    booking.assignedDriver = driver._id;
    await booking.save();

    if (setDriverInMission && driver.status === 'disponible') {
      driver.status = 'en_mission';
      driver.completedMissions = (driver.completedMissions || 0) + 1;
      await driver.save();
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('car', 'name image price')
      .populate('user', 'name email')
      .populate('assignedDriver', 'name phone whatsapp status zone')
      .lean();

    res.json({ 
      message: `Chauffeur ${driver.name} assigné avec succès`, 
      booking: populatedBooking,
      driver
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Erreur lors de l\'assignation du chauffeur' });
  }
};

module.exports = {
  getDrivers,
  createDriver,
  updateDriver,
  updateDriverStatus,
  deleteDriver,
  assignDriverToBooking,
  formatWhatsAppNumber,
};
