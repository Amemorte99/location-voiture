import { useState, useEffect } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, Tooltip,
} from 'recharts';
import {
  FaUsers, FaCar, FaCalendarAlt, FaMoneyBillWave,
  FaChevronRight, FaArrowUp, FaArrowDown,
} from 'react-icons/fa';

import { STATUS_LABELS } from '../../utils/constants';

const PERIODS = [
  { key: '7j', label: '7 jours' },
  { key: '30j', label: '30 jours' },
  { key: '3m', label: '3 mois' },
  { key: 'annee', label: 'Année' },
];

export default function OverviewTab({ stats, setActiveTab, fetchStats }) {
  const [period, setPeriod] = useState('7j');

  useEffect(() => {
    if (fetchStats) fetchStats(period);
  }, [period, fetchStats]); 

  if (!stats) return null;

  const getStatusBadge = (status) => {
    const customStyles = {
      confirmed: 'bg-[#0F2F75] text-[#E3383C] border-slate-900',
      completed: 'bg-[#EEF3FB] text-[#A61F23] border-[#D3E0F4]',
      pending: 'bg-slate-100 text-slate-700 border-slate-200/80',
      cancelled: 'bg-slate-50 text-slate-400 border-slate-200',
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${customStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {STATUS_LABELS[status] || status}
      </span>
    );
  };

  const kpiCards = [
    {
      label: 'Utilisateurs',
      val: stats.totalUsers,
      icon: <FaUsers size={18} />,
      color: 'text-[#E3383C]',
      bg: 'bg-[#EEF3FB]',
      border: 'border-[#D3E0F4]',
      trend: stats.growth?.users || 0,
      sparkData: stats?.userTrends || null,
      sparkColor: '#E3383C',
    },
    {
      label: 'Véhicules',
      val: stats.totalCars,
      icon: <FaCar size={18} />,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-100',
      trend: stats.growth?.cars || 0,
      sparkData: null,
      sparkColor: '#64748B',
    },
    {
      label: 'Réservations',
      val: stats.totalBookings,
      icon: <FaCalendarAlt size={18} />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      trend: stats.growth?.bookings || 0,
      sparkData: stats?.trends?.length > 0 ? stats.trends.map(t => t.count) : null,
      sparkColor: '#D97706',
    },
    {
      label: 'Revenus',
      val: `${(stats.totalRevenue || 0).toLocaleString('fr-FR')} DH`,
      icon: <FaMoneyBillWave size={18} />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      trend: stats.growth?.revenue || 0,
      sparkData: stats?.trends?.length > 0 ? stats.trends.map(t => t.revenue) : null,
      sparkColor: '#059669',
    },
  ];

  return (
    <div className="space-y-10">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#111827]">
            Tableau de <span className="text-[#E3383C]">Bord</span>
          </h2>
          <p className="text-[#6B7280] text-xs font-medium mt-0.5">
            Activité et indicateurs de performance de l'agence à Fès
          </p>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${card.bg} ${card.color} mb-3 border border-gray-100`}>
              {card.icon}
            </div>

            <p className="text-xs font-medium text-[#6B7280] mb-0.5">{card.label}</p>
            <h3 className="text-2xl font-bold tracking-tight text-[#111827] mb-2">{card.val}</h3>

            {card.trend !== 0 && (
              <div className={`flex items-center gap-1 text-[11px] font-semibold ${card.trend > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {card.trend > 0 ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />}
                <span>{Math.abs(card.trend)}% ce mois</span>
              </div>
            )}

            {card.sparkData && (
              <div className="h-8 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={card.sparkData.map((v, idx) => ({ v, idx }))}>
                    <defs>
                      <linearGradient id={`spark-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={card.sparkColor} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={card.sparkColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={card.sparkColor} strokeWidth={1.5} fill={`url(#spark-${i})`} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Graphique de revenus */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-[#111827]">Évolution des Revenus</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Activité sur la période sélectionnée</p>
          </div>
          {/* Sélecteur de période */}
          <div className="flex items-center gap-1.5 bg-[#F9FAFB] p-1.5 rounded-xl border border-gray-100">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  period === p.key
                    ? 'bg-[#0F2F75] text-white shadow-lg shadow-black/10'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.trends || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E3383C" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#E3383C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                tick={{ fontSize: 10, fontWeight: 'bold' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [`${value} DH`, 'Revenus']}
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 10px 40px -5px rgba(0,0,0,0.15)',
                  fontWeight: '800',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#E3383C"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
                dot={{ r: 4, fill: '#E3383C', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#E3383C', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deux sections inférieures */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Dernières Réservations */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-gray-200/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#111827]">Dernières Réservations</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">5 demandes les plus récentes</p>
            </div>
            <button
              onClick={() => setActiveTab('bookings')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F9FAFB] rounded-xl text-xs font-bold text-[#6B7280] hover:bg-[#EEF3FB] hover:text-[#E3383C] transition-all border border-gray-100"
            >
              Voir tout <FaChevronRight size={8} />
            </button>
          </div>

          <div className="space-y-2.5">
            {stats.recentBookings?.map((booking) => {
              return (
                <div
                  key={booking._id}
                  onClick={() => setActiveTab('bookings')}
                  className="grid grid-cols-[1fr_auto_auto] gap-3 items-center p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#0F2F75] text-[#E3383C] shrink-0 flex items-center justify-center shadow-xs">
                      <FaCar size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{booking.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-slate-700">{booking.car?.name || 'Véhicule'}</span>
                        {booking.pickupLocation?.includes('Aéroport') && (
                          <span className="text-[9px] font-bold text-[#A61F23] bg-[#EEF3FB] px-2 py-0.5 rounded-md border border-[#D3E0F4]">
                            Aéroport
                          </span>
                        )}
                        {(booking.pickupLocation?.includes('Hôtel') || booking.pickupLocation?.includes('Riad')) && (
                          <span className="text-[9px] font-bold text-[#A61F23] bg-[#EEF3FB] px-2 py-0.5 rounded-md border border-[#D3E0F4]">
                            Riad/Hôtel
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-black text-[#E3383C] whitespace-nowrap text-right">
                    {Number(booking.totalPrice || 0).toLocaleString('fr-FR')} <span className="text-[10px] text-slate-400 font-normal">DH</span>
                  </p>

                  <div className="flex justify-end">
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nouveaux Inscrits */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-gray-200/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#111827]">Nouveaux Inscrits</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">Comptes récents enregistrés</p>
            </div>
            <button
              onClick={() => setActiveTab('users')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F9FAFB] rounded-xl text-xs font-bold text-[#6B7280] hover:bg-[#EEF3FB] hover:text-[#E3383C] transition-all border border-gray-100"
            >
              Voir tout <FaChevronRight size={8} />
            </button>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2 px-3 mb-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#9CA3AF]">Utilisateur</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#9CA3AF] text-right">Inscrit le</span>
          </div>

          <div className="space-y-2.5">
            {stats.recentUsers?.map((user) => {
              const isAdmin = user.role === 'admin';

              return (
                <div
                  key={user._id}
                  onClick={() => setActiveTab('users')}
                  className="grid grid-cols-[1fr_auto] gap-2 items-center p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      isAdmin
                        ? 'bg-[#0F2F75] text-[#E3383C] shadow-xs'
                        : 'bg-[#EEF3FB] text-[#A61F23] border border-[#D3E0F4]'
                    }`}>
                      {(user.name?.charAt(0) || user.email?.charAt(0) || '?').toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name || '—'}</p>
                        {isAdmin && (
                          <span className="px-1.5 py-0.5 bg-[#EEF3FB] text-[#E3383C] text-[8px] font-black uppercase tracking-widest rounded-full border border-[#D3E0F4] shrink-0">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-medium text-slate-500 truncate mt-0.5">{user.email}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
