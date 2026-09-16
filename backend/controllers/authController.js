const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const logger = require('../utils/logger');

const getErrorMessage = (error) => {
  if (!error) return "Une erreur inattendue est survenue";
  const msg = error.message || String(error);
  if (msg.includes('ECONNREFUSED') || msg.includes('buffering timed out') || msg.includes('topology was destroyed')) {
    return "Service temporairement indisponible. Veuillez réessayer dans un instant.";
  }
  return msg;
};

const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const user = await User.create({ name, email, password, phone });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: 'Données invalides' });
    }
  } catch (error) {
    logger.error('Erreur inscription:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const rawIdentifier = (email || '').trim();
    // Recherche par email OU par numéro de téléphone
    const user = await User.findOne({
      $or: [
        { email: rawIdentifier.toLowerCase() },
        { phone: rawIdentifier },
        { phone: rawIdentifier.replace(/[\s.-]/g, '') },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Identifiant ou mot de passe incorrect' });
    }

    if (user.deletedAt) {
      return res.status(403).json({ message: 'Ce compte a été désactivé. Contactez le support.' });
    }

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    logger.error('Erreur connexion:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.deletedAt) {
      return res.status(404).json({ message: 'Utilisateur non trouvé ou compte désactivé' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    logger.error('Erreur getMe:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  }
};

module.exports = { register, login, getMe };
