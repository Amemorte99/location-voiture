const dotenv = require('dotenv');
const Car = require('./models/Car');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config({ quiet: true });

const { cars } = require('./config/seedData');

const seedDB = async () => {
  try {
    await connectDB();

    await Car.deleteMany();
    console.log('[DB] Flotte automobile réinitialisée');

    await Car.insertMany(cars);
    console.log('[DB] Véhicules insérés avec succès');

    const adminExists = await User.findOne({ email: 'admin@locafes.ma' });
    if (!adminExists) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'AdminLocafes2024!';
      await User.create({
        name: 'Admin LocaN’Djamena',
        email: 'admin@locafes.ma',
        password: adminPassword,
        role: 'admin',
        phone: '22000000',
      });
      console.log('[DB] Administrateur créé (admin@locafes.ma)');
    } else {
      console.log('[DB] Administrateur déjà existant');
    }

    console.log('[SUCCESS] Initialisation terminée');
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Erreur initialisation :', error.message);
    process.exit(1);
  }
};

seedDB();
