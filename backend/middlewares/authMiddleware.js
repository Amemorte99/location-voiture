const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      
      token = req.headers.authorization.split(' ')[1];


      const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user || req.user.deletedAt) {
        return res.status(401).json({ message: 'Compte désactivé ou introuvable' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Session expirée ou jeton invalide' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Non autorisé, aucun jeton d'accès fourni" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    return res.status(403).json({ message: 'Accès interdit : droits administrateur requis' });
  }
};

module.exports = { protect, admin };
