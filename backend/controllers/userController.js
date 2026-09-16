const User = require('../models/User');


  const getUsers = async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 10, 100);
      const skip = (page - 1) * limit;
      const { search } = req.query;

      
      const query = { deletedAt: null };
      if (search) {
        const safeSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        query.$or = [
          { name: { $regex: safeSearch, $options: 'i' } },
          { email: { $regex: safeSearch, $options: 'i' } }
        ];
      }

      const totalUsers = await User.countDocuments(query);
      const users = await User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      res.json({
        users,
        page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, deletedAt: null });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, deletedAt: null }).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (req.body.email && req.body.email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({
        email: req.body.email.toLowerCase(),
        _id: { $ne: user._id },
        deletedAt: null
      });
      if (emailExists) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre compte' });
      }
      user.email = req.body.email.toLowerCase();
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.role) user.role = req.body.role;

    if (req.body.password && req.body.password.trim().length >= 6) {
      user.password = req.body.password;
    } else if (req.body.password && req.body.password.trim().length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit comporter au moins 6 caractères' });
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, deletedAt: null });
    if (user) {
      user.deletedAt = new Date();
      await user.save();
      res.json({ message: 'Utilisateur supprimé (désactivé)' });
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateProfile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id, deletedAt: null });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (req.body.email && req.body.email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({
        email: req.body.email.toLowerCase(),
        _id: { $ne: user._id },
        deletedAt: null
      });
      if (emailExists) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre compte' });
      }
      user.email = req.body.email.toLowerCase();
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;

    if (req.body.password && req.body.password.trim().length >= 6) {
      user.password = req.body.password;
    } else if (req.body.password && req.body.password.trim().length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit comporter au moins 6 caractères' });
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser, updateProfile };
