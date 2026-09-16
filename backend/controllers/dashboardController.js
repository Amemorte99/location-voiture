const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');


const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ deletedAt: null });
    const totalCars = await Car.countDocuments({ deletedAt: null });
    const totalBookings = await Booking.countDocuments({ deletedAt: null });

    const revenueResult = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] }, deletedAt: null } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const bookingsByStatus = await Booking.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const recentBookings = await Booking.find({ deletedAt: null })
      .populate('car', 'name image price')
      .populate('user', 'name email')
      .populate('assignedDriver', 'name phone whatsapp status zone')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(5);
  
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const calcGrowth = async (Model, matchQuery, sumField = null) => {
      const currentPeriod = await Model.aggregate([
        { $match: { ...matchQuery, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: sumField ? `$${sumField}` : 1 } } }
      ]);
      const prevPeriod = await Model.aggregate([
        { $match: { ...matchQuery, createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: sumField ? `$${sumField}` : 1 } } }
      ]);
      const cur = currentPeriod[0]?.total || 0;
      const prev = prevPeriod[0]?.total || 0;
      if (prev === 0) return cur > 0 ? 100 : 0;
      return Number((((cur - prev) / prev) * 100).toFixed(1));
    };

    const growth = {
      users: await calcGrowth(User, { deletedAt: null }),
      cars: await calcGrowth(Car, { deletedAt: null }),
      bookings: await calcGrowth(Booking, { status: { $ne: 'cancelled' }, deletedAt: null }),
      revenue: await calcGrowth(Booking, { status: { $ne: 'cancelled' }, deletedAt: null }, 'totalPrice')
    };

    const period = req.query.period || '7j';
    let daysToFetch = 7;
    let format = "%Y-%m-%d";
    
    if (period === '30j') daysToFetch = 30;
    else if (period === '3m') daysToFetch = 90;
    else if (period === 'annee') daysToFetch = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToFetch);

    const dailyTrends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' },
          deletedAt: null
        }
      },
      {
        $group: {
          _id: { $dateToString: { format, date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    
    const trends = [];
    
    if (period === '7j' || period === '30j') {
      
      for (let i = daysToFetch - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayData = dailyTrends.find(t => t._id === dateStr);
        
        let label = dateStr.split('-').slice(1).reverse().join('/');
        if (i === 0) label = 'Auj.';
        else if (i === 1) label = 'Hier';
        
        trends.push({
          name: label,
          revenue: dayData ? dayData.revenue : 0,
          count: dayData ? dayData.count : 0
        });
      }
    } else {
      
       const points = 15;
       const step = Math.max(1, Math.floor(daysToFetch / points));
       for (let i = points - 1; i >= 0; i--) {
         const d = new Date();
         d.setDate(d.getDate() - (i * step));
         const dateStr = d.toISOString().split('T')[0];
         
         let spanRevenue = 0;
         let spanCount = 0;
         for(let j = 0; j < step; j++) {
           const spanD = new Date(d);
           spanD.setDate(d.getDate() - j);
           const sStr = spanD.toISOString().split('T')[0];
           const sData = dailyTrends.find(t => t._id === sStr);
           if(sData) {
             spanRevenue += sData.revenue;
             spanCount += sData.count;
           }
         }
         
         trends.push({
           name: dateStr.split('-').slice(1).reverse().join('/'),
           revenue: spanRevenue,
           count: spanCount
         });
       }
    }

    res.json({
      totalUsers,
      totalCars,
      totalBookings,
      totalRevenue,
      bookingsByStatus,
      recentBookings,
      recentUsers,
      trends,
      growth,
      pendingBookingsCount: bookingsByStatus.find(s => s._id === 'pending')?.count || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats };
