const Car = require('../models/Car');
const Booking = require('../models/Booking');
const { resolveImageUrl } = require('../utils/imageHelper');


const getCars = async (req, res) => {
  try {
    const { fuel, gearbox, search, sort, startDate, endDate } = req.query;
    let query = { deletedAt: null };

    if (fuel && fuel !== 'all') query.fuel = fuel;
    if (gearbox && gearbox !== 'all') query.gearbox = gearbox;
    if (search) {
      const safeSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      query.name = { $regex: safeSearch, $options: 'i' };
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const overlappingBookings = await Booking.find({
        deletedAt: null,
        status: { $nin: ['cancelled', 'completed'] },
        $and: [
          { startDate: { $lt: end } },
          { endDate: { $gt: start } }
        ]
      });

      const bookedCarIds = overlappingBookings.map(b => b.car);
      query._id = { $nin: bookedCarIds };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'year') sortOption = { year: -1 };

    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;

    const totalCars = await Car.countDocuments(query);
    const carsDocs = await Car.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();
    
    const now = new Date();
    const activeBookings = await Booking.find({
      deletedAt: null,
      status: { $nin: ['cancelled', 'completed'] },
      endDate: { $gte: now }
    });
    const activeBookedCarIds = activeBookings.map(b => b.car.toString());

    const cars = carsDocs.map(car => ({
      ...car,
      image: resolveImageUrl(car.image),
      isAvailableNow: !activeBookedCarIds.includes(car._id.toString())
    }));

    res.json({
      cars,
      page,
      totalPages: Math.ceil(totalCars / limit),
      totalCars
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getCarById = async (req, res) => {
  try {
    const carDoc = await Car.findOne({ _id: req.params.id, deletedAt: null }).lean();
    if (carDoc) {
      const now = new Date();

      const activeBooking = await Booking.findOne({
        car: carDoc._id,
        deletedAt: null,
        status: { $nin: ['cancelled', 'completed'] },
        endDate: { $gte: now } 
      });
      
      const car = {
        ...carDoc,
        image: resolveImageUrl(carDoc.image),
        isAvailableNow: !activeBooking
      };
      
      res.json(car);
    } else {
      res.status(404).json({ message: 'Voiture non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const whitelistedKeys = ['name', 'brand', 'price', 'year', 'fuel', 'gearbox', 'available', 'description'];
const extractWhitelistedCarData = (body) => {
  const data = {};
  whitelistedKeys.forEach(k => {
    if (body[k] !== undefined) {
      data[k] = body[k];
    }
  });
  return data;
};

const createCar = async (req, res) => {
  try {
    const carData = extractWhitelistedCarData(req.body);
    if (req.file) {
      carData.image = `/uploads/${req.file.filename}`;
    }
    const car = await Car.create(carData);
    
    const carResponse = car.toObject();
    carResponse.image = resolveImageUrl(carResponse.image);

    res.status(201).json(carResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const updateCar = async (req, res) => {
  try {
    const carData = extractWhitelistedCarData(req.body);
    if (req.file) {
      carData.image = `/uploads/${req.file.filename}`;
    }
    const car = await Car.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      carData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (car) {
      const carResponse = car.toObject();
      carResponse.image = resolveImageUrl(carResponse.image);
      res.json(carResponse);
    } else {
      res.status(404).json({ message: 'Voiture non trouvée' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const deleteCar = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, deletedAt: null });
    if (car) {
      car.deletedAt = new Date();
      await car.save();
      res.json({ message: 'Voiture supprimée (désactivée)' });
    } else {
      res.status(404).json({ message: 'Voiture non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const createCarReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "La note doit être un nombre entre 1 et 5" });
    }
    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({ message: "Le commentaire ne peut pas être vide" });
    }

    const car = await Car.findOne({ _id: req.params.id, deletedAt: null });

    if (car) {
      const alreadyReviewed = car.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Vous avez déjà laissé un avis pour ce véhicule.' });
      }

      const review = {
        name: req.user.name || req.user.email.split('@')[0],
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      car.reviews.push(review);
      car.numReviews = car.reviews.length;
      car.rating = Number((
        car.reviews.reduce((acc, item) => item.rating + acc, 0) /
        car.reviews.length
      ).toFixed(1));

      await car.save();
      res.status(201).json({ message: 'Avis ajouté avec succès' });
    } else {
      res.status(404).json({ message: 'Véhicule non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCars, getCarById, createCar, updateCar, deleteCar, createCarReview };
