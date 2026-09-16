const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Car = require('../models/Car');
const User = require('../models/User');
const { cars } = require('./seedData');

let mongodInstance = null;

const seedInitialDataIfEmpty = async () => {
  try {
    const carCount = await Car.countDocuments();
    if (carCount === 0) {
      await Car.insertMany(cars);
      console.log('[DB] Base initialisée avec 20 véhicules.');
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminLocafes2024!';
    let admin = await User.findOne({ email: 'admin@locafes.ma' }).select('+password');
    if (!admin) {
      await User.create({
        name: 'Admin LocaFès',
        email: 'admin@locafes.ma',
        password: adminPassword,
        role: 'admin',
        phone: '0535621020',
      });
      console.log('[DB] Administrateur initialisé : admin@locafes.ma');
    } else {
      const isMatch = await admin.matchPassword(adminPassword);
      if (!isMatch) {
        admin.password = adminPassword;
        await admin.save();
        console.log('[DB] Mot de passe administrateur réinitialisé avec succès.');
      }
    }
  } catch (err) {
    console.error('[DB] Erreur lors de l\'initialisation des données :', err.message);
  }
};

const connectDB = async () => {
  if (mongoose.connection && mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  if (process.env.MONGO_URI) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[DB] Connecté à MongoDB : ${conn.connection.host}`);
      await seedInitialDataIfEmpty();
      return conn;
    } catch (error) {
      console.error(`[DB] Erreur de connexion à MongoDB (${error.message}).`);
      try { await mongoose.disconnect(); } catch {}
      if (process.env.VERCEL) {
        return null;
      }
      console.info(`[DB] Démarrage de l'instance locale persistante...`);
    }
  } else if (process.env.VERCEL) {
    console.warn('[DB] Variable MONGO_URI non configurée sur Vercel.');
    return null;
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const dbDir = path.join(__dirname, '..', '.data', 'db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    } else {
      ['mongod.lock', 'WiredTiger.lock'].forEach(f => {
        const p = path.join(dbDir, f);
        if (fs.existsSync(p)) {
          try {
            fs.chmodSync(p, 0o666);
            fs.unlinkSync(p);
          } catch {}
        }
      });
    }

    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbPath: dbDir,
        storageEngine: 'wiredTiger',
        launchTimeout: 60000,
      }
    });

    const uri = mongodInstance.getUri();
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[DB] Instance locale prête avec stockage persistant à : ${uri}`);
    await seedInitialDataIfEmpty();
    return conn;
  } catch (memError) {
    console.error(`[DB] Erreur de connexion locale : ${memError.message}`);
    process.exit(1);
  }
};

const stopDB = async () => {
  try {
    await mongoose.disconnect();
  } catch {}
  if (mongodInstance) {
    try {
      await mongodInstance.stop();
      mongodInstance = null;
    } catch {}
  }
};

module.exports = connectDB;
module.exports.stopDB = stopDB;
