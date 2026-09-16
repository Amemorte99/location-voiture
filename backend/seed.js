
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
    console.log('  Cars collection cleared');

    
    await Car.insertMany(cars);
    console.log(' 20 cars seeded successfully');

    
    const adminExists = await User.findOne({ email: 'admin@locafes.ma' });
    if (!adminExists) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'AdminLocafes2024!';
      await User.create({
        name: 'Admin LocaFès',
        email: 'admin@locafes.ma',
        password: adminPassword,
        role: 'admin',
        phone: '0535621020',
      });
      console.log('[OK] Admin user created (admin@locafes.ma)');
    } else {
      console.log('[INFO] Admin user already exists');
    }

    console.log('\n[SUCCESS] Seed completed!');
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
