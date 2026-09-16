import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getMyBookings, updateBookingStatus } from '../services/bookingService';
import { FaCalendarAlt, FaCar, FaTimes, FaCheck, FaDownload, FaUser, FaEnvelope, FaPhone, FaLock, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { generateInvoicePDF } from '../utils/generatePDF';
import { updateProfile } from '../services/userService';
import { resolveImageUrl } from '../utils/imageUrl';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function Profile() {
  const { currentUser, logout, updateUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [editFormData, setEditFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    password: ''
  });
  const [updating, setUpdating] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(Array.isArray(data) ? data : (data?.bookings || []));
    } catch (err) {
      toast.error("Erreur lors de la récupération des réservations.");
    } finally {
      setLoading(false);
    }
  };

  const confirmedBookingsCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;

  const totalSpent = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

  const handleCancel = (id) => {
    setConfirmCancel(id);
  };

  const doCancel = async () => {
    const id = confirmCancel;
    setConfirmCancel(null);
    try {
      await updateBookingStatus(id, 'cancelled');
      setBookings(bookings.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
      toast.success("Réservation annulée avec succès");
    } catch (err) {
      toast.error("Impossible d'annuler la réservation");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    if (!editFormData.name.trim()) {
      toast.error("Le nom est requis");
      setUpdating(false);
      return;
    }
    if (!editFormData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      toast.error("Veuillez fournir un email valide");
      setUpdating(false);
      return;
    }
    if (editFormData.phone && !/^\+?[0-9\s-]{8,20}$/.test(editFormData.phone)) {
      toast.error("Veuillez fournir un numéro de téléphone valide");
      setUpdating(false);
      return;
    }
    if (editFormData.password && editFormData.password.length < 6) {
      toast.error("Le mot de passe doit comporter au moins 6 caractères");
      setUpdating(false);
      return;
    }

    try {
      const data = { ...editFormData };
      if (!data.password) delete data.password;
      const updatedUser = await updateProfile(data);
      updateUser(updatedUser);
      toast.success("Profil mis à jour !");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur de mise à jour");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      cancelled: "bg-rose-50 text-rose-700 border-rose-200",
      completed: "bg-gray-100 text-gray-700 border-gray-200",
    };
    const labels = {
      pending: "En attente",
      confirmed: "Confirmée",
      cancelled: "Annulée",
      completed: "Terminée",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen pt-28 pb-20 bg-gray-50/50">
      <Helmet>
        <title>Mon Profil | LocaFès</title>
        <meta name="description" content="Gérez votre profil et vos réservations LocaFès." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-6">
        {/* En-tête profil réel et épuré */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Avatar initiales */}
            <div className="w-20 h-20 rounded-2xl bg-[#F8F5F0] border border-[#E8DDD0] flex items-center justify-center text-2xl font-bold text-[#C4A47C] shrink-0 shadow-inner">
              {currentUser.name?.charAt(0).toUpperCase()}
            </div>

            {/* Infos utilisateur */}
            <div className="text-center md:text-left flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-[#111827] truncate">
                  {currentUser.name}
                </h1>
                <span className="inline-flex px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-[#4B5563] w-fit mx-auto md:mx-0">
                  {currentUser.role === 'admin' ? 'Administrateur' : 'Client LocaFès'}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] font-medium">{currentUser.email}</p>
              {currentUser.phone && (
                <p className="text-xs text-[#6B7280] mt-0.5">{currentUser.phone}</p>
              )}
            </div>

            {/* Statistiques réelles */}
            <div className="flex gap-4 w-full md:w-auto shrink-0 justify-center">
              <div className="text-center px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 min-w-[90px]">
                <p className="text-xl font-bold text-[#111827]">{bookings.length}</p>
                <p className="text-[11px] font-medium text-[#6B7280] mt-0.5">Réservations</p>
              </div>
              <div className="text-center px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 min-w-[90px]">
                <p className="text-xl font-bold text-emerald-600">{confirmedBookingsCount}</p>
                <p className="text-[11px] font-medium text-[#6B7280] mt-0.5">Validées</p>
              </div>
              <div className="text-center px-4 py-3 rounded-xl bg-[#F8F5F0] border border-[#E8DDD0] min-w-[100px]">
                <p className="text-xl font-bold text-[#111827]">{totalSpent} <span className="text-xs font-semibold text-[#C4A47C]">DH</span></p>
                <p className="text-[11px] font-medium text-[#6B7280] mt-0.5">Dépenses</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Navigation latérale */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-4">
              <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200/80 space-y-1">
                <button 
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                    activeTab === 'bookings' 
                      ? 'bg-[#111827] text-white shadow-sm' 
                      : 'text-[#4B5563] hover:bg-gray-50'
                  }`}
                >
                  <FaCalendarAlt size={14} className={activeTab === 'bookings' ? 'text-[#C4A47C]' : 'text-gray-400'} />
                  Mes Réservations
                  <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'bookings' ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#4B5563]'
                  }`}>{bookings.length}</span>
                </button>

                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                    activeTab === 'settings' 
                      ? 'bg-[#111827] text-white shadow-sm' 
                      : 'text-[#4B5563] hover:bg-gray-50'
                  }`}
                >
                  <FaUser size={14} className={activeTab === 'settings' ? 'text-[#C4A47C]' : 'text-gray-400'} />
                  Mon Profil
                </button>
              </div>

              <Link 
                to="/cars"
                className="flex items-center gap-2.5 w-full px-5 py-3.5 bg-white border border-gray-200/80 rounded-xl text-xs font-bold text-[#111827] hover:border-[#C4A47C] hover:text-[#C4A47C] transition-all shadow-sm group"
              >
                <FaCar className="text-[#C4A47C]" />
                Nouvelle réservation
                <FaArrowRight size={11} className="ml-auto text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Onglet Réservations */}
              {activeTab === 'bookings' && (
                <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  {/* Filtres par statut */}
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {[
                      { key: 'all', label: 'Toutes' },
                      { key: 'pending', label: 'En attente' },
                      { key: 'confirmed', label: 'Confirmées' },
                      { key: 'completed', label: 'Terminées' },
                      { key: 'cancelled', label: 'Annulées' },
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => setFilterStatus(f.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${
                          filterStatus === f.key
                            ? 'bg-[#111827] text-white border-[#111827]'
                            : 'bg-white text-[#6B7280] border-gray-200 hover:border-gray-300 hover:text-[#111827]'
                        }`}
                      >
                        {f.label}
                        {statusCounts[f.key] > 0 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            filterStatus === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#4B5563]'
                          }`}>{statusCounts[f.key]}</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-16">
                      <div className="w-8 h-8 border-3 border-[#C4A47C] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80 shadow-sm">
                      <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <FaCar size={24} />
                      </div>
                      <p className="text-lg font-bold text-[#111827] mb-1">
                        {filterStatus === 'all' ? 'Aucune réservation' : `Aucune réservation "${filterStatus}"`}
                      </p>
                      <p className="text-xs text-[#6B7280] mb-6 max-w-sm mx-auto">
                        {filterStatus === 'all' 
                          ? "Vous n'avez pas encore effectué de réservation."
                          : "Aucune réservation trouvée pour ce statut."}
                      </p>
                      {filterStatus === 'all' && (
                        <Link to="/cars" className="inline-flex items-center gap-2 px-6 py-3 bg-[#111827] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors shadow-sm">
                          Découvrir le catalogue <FaArrowRight size={10} />
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredBookings.map((booking) => (
                        <div
                          key={booking._id}
                          className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:border-[#C4A47C]/40 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row gap-5">
                            {/* Photo véhicule */}
                            <div className="w-full sm:w-40 h-28 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center p-2">
                              {booking.car?.image ? (
                                <img 
                                  src={resolveImageUrl(booking.car.image)} 
                                  alt={booking.car?.name} 
                                  className="w-full h-full object-contain" 
                                />
                              ) : (
                                <FaCar size={24} className="text-gray-300" />
                              )}
                            </div>

                            {/* Données de la réservation */}
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start gap-3 mb-1">
                                  <h4 className="text-lg font-bold text-[#111827]">{booking.car?.name || 'Véhicule'}</h4>
                                  {getStatusBadge(booking.status)}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                                  <FaCalendarAlt size={12} className="text-gray-400" />
                                  <span>{new Date(booking.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                  <span className="text-gray-300">→</span>
                                  <span>{new Date(booking.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                                {booking.pickupLocation && (
                                  <div className="flex items-center gap-1.5 text-[11px] text-[#A68B5B] font-semibold mt-1">
                                    <FaMapMarkerAlt size={10} />
                                    <span>{booking.pickupLocation}</span>
                                    {booking.flightNumber && <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] font-bold">Vol {booking.flightNumber}</span>}
                                    {booking.pickupTime && <span className="text-gray-400">· {booking.pickupTime}</span>}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap items-center justify-between pt-4 mt-2 border-t border-gray-100 gap-3">
                                <div>
                                  <p className="text-[11px] text-[#6B7280]">Montant total</p>
                                  <p className="text-lg font-bold text-[#111827]">{Number(booking.totalPrice || 0).toLocaleString('fr-FR')} <span className="text-xs font-normal text-[#6B7280]">DH</span></p>
                                  <div className="mt-1">
                                    {booking.paymentMethod === 'card' ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                                        ✓ Réglé en ligne (Carte)
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F8F5F0] text-[#8C6D3F] text-[10px] font-bold border border-[#E8DDD0]">
                                        • Espèces à la remise des clés
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {booking.status === 'pending' && (
                                    <button 
                                      onClick={() => handleCancel(booking._id)}
                                      className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
                                    >
                                      Annuler
                                    </button>
                                  )}
                                  
                                  {booking.status !== 'cancelled' && (
                                    <button 
                                      onClick={() => generateInvoicePDF(booking, true)}
                                      className="px-4 py-2 bg-gray-50 border border-gray-200 text-[#111827] rounded-xl text-xs font-bold hover:border-gray-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <FaDownload size={10} className="text-[#6B7280]" /> Facture / Bon PDF
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Onglet Profil / Paramètres */}
              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
                      <div className="w-9 h-9 bg-[#F8F5F0] text-[#C4A47C] rounded-xl flex items-center justify-center text-sm">
                        <FaUser />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#111827]">Données Personnelles</h3>
                        <p className="text-xs text-[#6B7280]">Mettez à jour vos coordonnées de contact</p>
                      </div>
                    </div>
                    
                    <form onSubmit={handleProfileUpdate} className="space-y-5">
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label htmlFor="profile-name" className="block text-xs font-bold text-[#6B7280]">
                            Nom Complet
                          </label>
                          <div className="relative">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                            <input 
                              id="profile-name"
                              value={editFormData.name} 
                              onChange={e => setEditFormData({...editFormData, name: e.target.value})} 
                              className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl focus:bg-white focus:border-[#C4A47C] outline-none transition-colors font-medium text-sm text-[#111827]" 
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="profile-email" className="block text-xs font-bold text-[#6B7280]">
                            Adresse Email
                          </label>
                          <div className="relative">
                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                            <input 
                              id="profile-email"
                              type="email"
                              value={editFormData.email} 
                              onChange={e => setEditFormData({...editFormData, email: e.target.value})} 
                              className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl focus:bg-white focus:border-[#C4A47C] outline-none transition-colors font-medium text-sm text-[#111827]" 
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="profile-phone" className="block text-xs font-bold text-[#6B7280]">
                            Téléphone
                          </label>
                          <div className="relative">
                            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                            <input 
                              id="profile-phone"
                              type="tel"
                              value={editFormData.phone} 
                              onChange={e => setEditFormData({...editFormData, phone: e.target.value})} 
                              className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl focus:bg-white focus:border-[#C4A47C] outline-none transition-colors font-medium text-sm text-[#111827]" 
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="profile-password" className="block text-xs font-bold text-[#6B7280]">
                            Nouveau Mot de Passe (optionnel)
                          </label>
                          <div className="relative">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                            <input 
                              id="profile-password"
                              type="password"
                              value={editFormData.password} 
                              onChange={e => setEditFormData({...editFormData, password: e.target.value})} 
                              placeholder="Laisser vide pour conserver l'actuel"
                              className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl focus:bg-white focus:border-[#C4A47C] outline-none transition-colors font-medium text-sm text-[#111827] placeholder:text-gray-400" 
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <button 
                          type="submit" 
                          disabled={updating} 
                          className="px-6 py-3 bg-[#111827] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                        >
                          {updating ? 'Enregistrement...' : <><FaCheck size={11} /> Enregistrer les modifications</>}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Déconnexion */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#111827]">Session active</h4>
                      <p className="text-xs text-[#6B7280]">Déconnectez-vous de votre compte sur cet appareil.</p>
                    </div>
                    <button 
                      onClick={logout}
                      className="px-5 py-2.5 bg-gray-50 border border-gray-200 text-rose-600 rounded-xl font-bold text-xs hover:bg-rose-50 hover:border-rose-200 transition-colors"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modal confirmation annulation */}
      <AnimatePresence>
        {confirmCancel && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmCancel(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative bg-white rounded-3xl shadow-2xl p-7 sm:p-8 max-w-sm w-full text-center border border-slate-100"
            >
              <div className="w-12 h-12 bg-rose-50 text-rose-600 border border-rose-100/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg">
                <FaTimes size={16} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">Annuler la réservation ?</h3>
              <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">
                Cette action annulera définitivement la réservation sélectionnée auprès de notre service.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmCancel(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Garder
                </button>
                <button
                  type="button"
                  onClick={doCancel}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                >
                  Oui, annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
