import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboardStats, getUsers, deleteUser, updateUser } from '../services/dashboardService';
import { getAllBookings, updateBookingStatus, deleteBooking } from '../services/bookingService';
import { getCars, createCar, deleteCar, updateCar } from '../services/carService';
import { FaCheck, FaTimes, FaExclamationTriangle, FaWhatsapp, FaPlane, FaMapMarkerAlt, FaClock, FaCar, FaFilePdf } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { resolveImageUrl } from '../utils/imageUrl';
import generateInvoicePDF, { generateInvoicePDF as namedGenerateInvoicePDF } from '../utils/generatePDF';

import OverviewTab from './admin/OverviewTab';
import UsersTab from './admin/UsersTab';
import BookingsTab from './admin/BookingsTab';
import CarsTab from './admin/CarsTab';
import DriversTab from './admin/DriversTab';
import SettingsTab from './admin/SettingsTab';
import MessagesTab from './admin/MessagesTab';
import { getDrivers, assignDriverToBooking } from '../services/driverService';
import { getMessages, updateMessageStatus, deleteMessage } from '../services/messageService';
import { STATUS_LABELS, STATUS_STYLES } from '../utils/constants';

const handleOpenInvoice = (booking) => {
  const fn = typeof generateInvoicePDF === 'function' 
    ? generateInvoicePDF 
    : (typeof namedGenerateInvoicePDF === 'function' ? namedGenerateInvoicePDF : null);
  if (typeof fn === 'function') {
    fn(booking);
  } else {
    toast.error("Veuillez rafraîchir la page pour synchroniser le module PDF.");
  }
};

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-[#0F2F75]/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative bg-white rounded-3xl p-7 sm:p-8 max-w-sm w-full shadow-2xl text-center border border-slate-100"
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100/80 flex items-center justify-center text-xl mx-auto mb-4">
          <FaExclamationTriangle size={18} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1.5">Confirmer la suppression</h3>
        <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
          >
            Supprimer
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Annuler
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function SkeletonRow({ cols = 5 }) {
  return (
    <tr className="border-b border-gray-50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-10 py-7">
          <div className="h-4 bg-gray-100 rounded-full animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse mb-4" />
      <div className="h-3 bg-gray-100 rounded-full animate-pulse w-20 mb-3" />
      <div className="h-7 bg-gray-100 rounded-full animate-pulse w-28 mb-2" />
      <div className="h-3 bg-gray-100 rounded-full animate-pulse w-16" />
    </div>
  );
}

function SkeletonOverview() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
      </div>
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-80 animate-pulse" />
    </div>
  );
}

function SkeletonTable({ cols = 5 }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <table className="w-full min-w-[800px]">
        <tbody>
          {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} cols={cols} />)}
        </tbody>
      </table>
    </div>
  );
}




export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [messageStatusFilter, setMessageStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCar, setNewCar] = useState({ name: '', brand: '', price: '', imageFile: null, fuel: 'Diesel', gearbox: 'Automatique', year: 2024, available: true });
  const [imagePreview, setImagePreview] = useState(null);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  
  const [confirmModal, setConfirmModal] = useState(null); 

  const showConfirm = (message, onConfirm) => {
    setConfirmModal({ message, onConfirm });
  };

  
  const pendingCount = activeTab === 'bookings' 
    ? bookings.filter(b => b.status === 'pending').length 
    : (stats?.pendingBookingsCount || 0);
  
  const pendingList = activeTab === 'bookings' 
    ? bookings.filter(b => b.status === 'pending')
    : (stats?.recentBookings?.filter(b => b.status === 'pending') || []);

  const fetchStats = useCallback(async (period = '7j') => {
    try {
      const data = await getDashboardStats(period);
      setStats(data);
      if (data && data.unreadMessagesCount !== undefined) {
        setUnreadMessagesCount(data.unreadMessagesCount);
      }
    } catch (err) {
      toast.error('Erreur chargement stats');
    }
  }, []);

  const fetchDrivers = useCallback(async () => {
    try {
      const data = await getDrivers();
      setDrivers(data.drivers || []);
    } catch (err) {
      console.error('Erreur chargement chauffeurs', err);
    }
  }, []);

  const handleAssignDriver = async (bookingId, driverId) => {
    try {
      const res = await assignDriverToBooking(bookingId, driverId);
      const updatedBooking = res.booking;
      setBookings(prev => prev.map(b => (b._id || b.id) === bookingId ? updatedBooking : b));
      if (selectedBooking && (selectedBooking._id || selectedBooking.id) === bookingId) {
        setSelectedBooking(updatedBooking);
      }
      fetchDrivers();
      toast.success(driverId ? 'Chauffeur assigné avec succès !' : 'Chauffeur retiré de la réservation');
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'assignation");
    }
  };

  const fetchData = useCallback(async (pageNum = page) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit, search: searchTerm };
      if (activeTab === 'overview') {
        await fetchStats();
      } else if (activeTab === 'users') {
        const data = await getUsers(params);
        if (data.users) { setUsers(data.users); setTotalPages(data.totalPages); }
        else { setUsers(data); setTotalPages(1); }
      } else if (activeTab === 'bookings') {
        const data = await getAllBookings(params);
        if (data.bookings) { setBookings(data.bookings); setTotalPages(data.totalPages); }
        else { setBookings(data); setTotalPages(1); }
      } else if (activeTab === 'cars') {
        const data = await getCars(params);
        if (data.cars) { setCars(data.cars); setTotalPages(data.totalPages); }
        else { setCars(data); setTotalPages(1); }
      } else if (activeTab === 'drivers') {
        await fetchDrivers();
      } else if (activeTab === 'messages') {
        const data = await getMessages({ ...params, status: messageStatusFilter });
        if (data.messages) {
          setMessages(data.messages);
          setTotalPages(data.totalPages);
          if (data.unreadCount !== undefined) {
            setUnreadMessagesCount(data.unreadCount);
          }
        } else {
          setMessages(Array.isArray(data) ? data : []);
          setTotalPages(1);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, messageStatusFilter, fetchStats, fetchDrivers, page]);

  useEffect(() => {
    fetchStats();
    fetchDrivers();
  }, [fetchStats, fetchDrivers]); 

  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [activeTab, fetchData]); 

  useEffect(() => {
    if (activeTab === 'overview') return;
    const timer = setTimeout(() => {
      setPage(1);
      fetchData(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, activeTab, fetchData]); 

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchData(newPage);
  };

  const handleDeleteUser = async (id) => {
    showConfirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.', async () => {
      setConfirmModal(null);
      try {
        await deleteUser(id);
        setUsers(users.filter(u => u._id !== id));
        toast.success('Utilisateur supprimé');
      } catch (err) {
        toast.error('Erreur lors de la suppression');
      }
    });
  };

  const handleUpdateBooking = async (id, status) => {
    try {
      const updated = await updateBookingStatus(id, status);
      if (activeTab === 'bookings') {
        setBookings(bookings.map(b => (b._id || b.id) === id ? updated : b));
      } else if (activeTab === 'overview') {
        setStats(prev => ({
          ...prev,
          recentBookings: prev.recentBookings.map(b => (b._id || b.id) === id ? updated : b)
        }));
      }
      await fetchData(page); 
      fetchStats(); 
      toast.success(`Statut mis à jour : ${STATUS_LABELS[status] || status}`);
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteBooking = async (id) => {
    showConfirm('Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.', async () => {
      setConfirmModal(null);
      try {
        await deleteBooking(id);
        setBookings(bookings.filter(b => b._id !== id));
        await fetchData(page); 
        fetchStats(); 
        toast.success('Réservation supprimée');
      } catch (err) {
        toast.error('Erreur suppression');
      }
    });
  };

  const handleCreateCar = async (e) => {
    e.preventDefault();
    if (!newCar.imageFile) { toast.error('Veuillez sélectionner une image !'); return; }
    try {
      const formData = new FormData();
      formData.append('name', newCar.name);
      formData.append('brand', newCar.brand);
      formData.append('price', newCar.price);
      formData.append('fuel', newCar.fuel);
      formData.append('gearbox', newCar.gearbox);
      formData.append('year', newCar.year);
      formData.append('available', newCar.available);
      formData.append('image', newCar.imageFile);
      const created = await createCar(formData);
      setCars([...cars, created]);
      setShowAddModal(false);
      setNewCar({ name: '', brand: '', price: '', imageFile: null, fuel: 'Diesel', gearbox: 'Automatique', year: 2024, available: true });
      setImagePreview(null);
      toast.success('Véhicule ajouté avec succès !');
    } catch (err) {
      toast.error("Erreur lors de l'ajout du véhicule");
    }
  };

  const handleDeleteCar = async (id) => {
    showConfirm('Êtes-vous sûr de vouloir retirer ce véhicule de la flotte ? Cette action est irréversible.', async () => {
      setConfirmModal(null);
      try {
        await deleteCar(id);
        setCars(cars.filter(c => c._id !== id));
        toast.success('Véhicule retiré');
      } catch (err) {
        toast.error('Erreur suppression');
      }
    });
  };

  const handleToggleRole = async (user) => {
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      const userId = user._id || user.id;
      const updated = await updateUser(userId, { role: newRole });
      setUsers(users.map(u => (u._id || u.id) === userId ? updated : u));
      toast.success(`Rôle mis à jour pour ${user.name}`);
    } catch (err) {
      toast.error('Erreur lors du changement de rôle');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const userId = editingUser._id || editingUser.id;
      const updated = await updateUser(userId, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        phone: editingUser.phone
      });
      setUsers(users.map(u => (u._id || u.id) === userId ? updated : u));
      setShowUserEditModal(false);
      toast.success('Utilisateur mis à jour !');
    } catch (err) {
      toast.error('Erreur de mise à jour');
    }
  };

  const handleToggleAvailability = async (car) => {
    try {
      const carId = car._id || car.id;
      const updated = await updateCar(carId, { available: !car.available });
      setCars(cars.map(c => (c._id || c.id) === carId ? updated : c));
      toast.success('Statut du véhicule mis à jour');
    } catch (err) {
      toast.error('Erreur de mise à jour');
    }
  };

  const handleUpdateCar = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      const editableFields = ['name', 'brand', 'price', 'fuel', 'gearbox', 'year', 'available'];
      editableFields.forEach(field => {
        if (editingCar[field] !== undefined) {
          formData.append(field, editingCar[field]);
        }
      });
      if (editingCar.imageFile) {
        formData.append('image', editingCar.imageFile);
      }
      const carId = editingCar._id || editingCar.id;
      const updated = await updateCar(carId, formData);
      setCars(cars.map(c => (c._id || c.id) === carId ? updated : c));
      setShowEditModal(false);
      setEditImagePreview(null);
      toast.success('Véhicule mis à jour !');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleToggleMessageStatus = async (id, targetStatus) => {
    try {
      const res = await updateMessageStatus(id, targetStatus);
      const updatedDoc = res.data;
      if (updatedDoc) {
        setMessages(prev => prev.map(m => (m._id || m.id) === id ? updatedDoc : m));
      } else {
        setMessages(prev => prev.map(m => (m._id || m.id) === id ? { ...m, status: targetStatus } : m));
      }
      if (res.unreadCount !== undefined) {
        setUnreadMessagesCount(res.unreadCount);
      } else {
        if (targetStatus === 'read') {
          setUnreadMessagesCount(prev => Math.max(0, prev - 1));
        } else {
          setUnreadMessagesCount(prev => prev + 1);
        }
      }
      toast.success(targetStatus === 'read' ? 'Demande marquée comme traitée' : 'Demande marquée comme non lue');
      fetchStats();
      return updatedDoc;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de mise à jour du message');
    }
  };

  const handleUpdateMessageNotes = async (id, adminNotes) => {
    try {
      const res = await updateMessageStatus(id, { adminNotes });
      const updatedDoc = res.data;
      if (updatedDoc) {
        setMessages(prev => prev.map(m => (m._id || m.id) === id ? updatedDoc : m));
      }
      toast.success('Note de suivi enregistrée');
      return updatedDoc;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement de la note');
    }
  };

  const handleDeleteMessage = async (id) => {
    showConfirm('Êtes-vous sûr de vouloir supprimer ce message de contact ?', async () => {
      setConfirmModal(null);
      try {
        await deleteMessage(id);
        setMessages(prev => prev.filter(m => (m._id || m.id) !== id));
        toast.success('Message supprimé');
        fetchData(page);
        fetchStats();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
      }
    });
  };

  const getStatusBadge = (status) => (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );

  
  const renderSkeleton = () => {
    if (activeTab === 'overview') return <SkeletonOverview />;
    if (activeTab === 'bookings') return <SkeletonTable cols={5} />;
    if (activeTab === 'cars') return <SkeletonTable cols={5} />;
    if (activeTab === 'users') return <SkeletonTable cols={6} />;
    if (activeTab === 'messages') return <SkeletonTable cols={5} />;
    return <div className="flex justify-center py-32"><div className="w-16 h-16 border-4 border-[#E3383C] border-t-transparent rounded-full animate-spin" /></div>;
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={sidebarCollapsed}
        toggleCollapse={toggleSidebarCollapse}
        pendingBookings={pendingCount}
        stats={stats}
        availableDrivers={drivers.filter(d => d.status === 'disponible').length}
        unreadMessages={unreadMessagesCount}
      />

      <main className={`flex-1 min-w-0 w-full overflow-x-hidden transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'} min-h-screen relative`}>
        <Topbar
          setIsOpen={setSidebarOpen}
          pendingBookings={pendingList}
          isCollapsed={sidebarCollapsed}
          toggleCollapse={toggleSidebarCollapse}
        />

        <div className="p-8 lg:p-12 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {renderSkeleton()}
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {activeTab === 'overview' && stats && (
                  <OverviewTab stats={stats} setActiveTab={setActiveTab} fetchStats={fetchStats} />
                )}
                {activeTab === 'users' && (
                  <UsersTab
                    users={users}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    handleToggleRole={handleToggleRole}
                    handleDeleteUser={handleDeleteUser}
                    setEditingUser={setEditingUser}
                    setShowUserEditModal={setShowUserEditModal}
                    page={page}
                    totalPages={totalPages}
                    handlePageChange={handlePageChange}
                  />
                )}
                {activeTab === 'bookings' && (
                  <BookingsTab
                    bookings={bookings}
                    drivers={drivers}
                    onAssignDriver={handleAssignDriver}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    setSelectedBooking={setSelectedBooking}
                    setShowDetailModal={setShowDetailModal}
                    handleUpdateBooking={handleUpdateBooking}
                    handleDeleteBooking={handleDeleteBooking}
                    page={page}
                    totalPages={totalPages}
                    handlePageChange={handlePageChange}
                  />
                )}
                {activeTab === 'cars' && (
                  <CarsTab
                    cars={cars}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    setShowAddModal={setShowAddModal}
                    handleToggleAvailability={handleToggleAvailability}
                    handleDeleteCar={handleDeleteCar}
                    setEditingCar={setEditingCar}
                    setShowEditModal={setShowEditModal}
                    page={page}
                    totalPages={totalPages}
                    handlePageChange={handlePageChange}
                  />
                )}
                {activeTab === 'drivers' && (
                  <DriversTab
                    drivers={drivers}
                    stats={stats}
                    onRefresh={fetchDrivers}
                  />
                )}
                {activeTab === 'messages' && (
                  <MessagesTab
                    messages={messages}
                    loading={loading}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={messageStatusFilter}
                    setStatusFilter={setMessageStatusFilter}
                    onToggleStatus={handleToggleMessageStatus}
                    onUpdateNotes={handleUpdateMessageNotes}
                    onDeleteMessage={handleDeleteMessage}
                    unreadCount={unreadMessagesCount}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
                {activeTab === 'settings' && <SettingsTab bookings={bookings} users={users} cars={cars} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {confirmModal && (
          <ConfirmModal
            message={confirmModal.message}
            onConfirm={confirmModal.onConfirm}
            onCancel={() => setConfirmModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal Ajout Véhicule */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-[#0F2F75]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-left flex flex-col max-h-[92vh]"
            >
              {/* En-tête épuré */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-white shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    Nouveau <span className="text-[#E3383C]">Véhicule</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Ajouter une nouvelle automobile à la flotte LocaFès</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setImagePreview(null); }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                  title="Fermer"
                >
                  <FaTimes size={13} />
                </button>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleCreateCar} className="p-6 sm:p-8 space-y-5 overflow-y-auto">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Modèle *</label>
                    <input
                      required
                      value={newCar.name}
                      onChange={e => setNewCar({ ...newCar, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#E3383C] focus:ring-2 focus:ring-[#E3383C]/15 transition-all"
                      placeholder="ex: Range Rover Sport"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Marque *</label>
                    <input
                      required
                      value={newCar.brand}
                      onChange={e => setNewCar({ ...newCar, brand: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#E3383C] focus:ring-2 focus:ring-[#E3383C]/15 transition-all"
                      placeholder="ex: Land Rover"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Tarif (DH / Jour) *</label>
                    <input
                      required
                      type="number"
                      value={newCar.price}
                      onChange={e => setNewCar({ ...newCar, price: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#E3383C] focus:ring-2 focus:ring-[#E3383C]/15 transition-all"
                      placeholder="ex: 450"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Année du Modèle *</label>
                    <input
                      required
                      type="number"
                      value={newCar.year}
                      onChange={e => setNewCar({ ...newCar, year: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#E3383C] focus:ring-2 focus:ring-[#E3383C]/15 transition-all"
                      placeholder="2024"
                    />
                  </div>
                </div>

                {/* Photo du véhicule */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Photo du Véhicule *</label>
                  <input
                    required
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      setNewCar({ ...newCar, imageFile: file });
                      if (file) setImagePreview(URL.createObjectURL(file));
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs text-slate-600 outline-none focus:border-[#E3383C] file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="relative mt-2 rounded-2xl overflow-hidden h-40 border border-slate-200/80 shadow-xs">
                      <img src={imagePreview} alt="Aperçu véhicule" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2.5 left-2.5 text-white bg-[#0F2F75]/70 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        Aperçu
                      </span>
                    </div>
                  )}
                </div>

                {/* Carburant & Boîte */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Carburant</label>
                    <select
                      value={newCar.fuel}
                      onChange={e => setNewCar({ ...newCar, fuel: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl font-semibold text-xs text-slate-800 outline-none focus:bg-white focus:border-[#E3383C] cursor-pointer"
                    >
                      <option>Diesel</option><option>Essence</option><option>Hybride</option><option>Électrique</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Boîte de vitesse</label>
                    <select
                      value={newCar.gearbox}
                      onChange={e => setNewCar({ ...newCar, gearbox: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl font-semibold text-xs text-slate-800 outline-none focus:bg-white focus:border-[#E3383C] cursor-pointer"
                    >
                      <option>Automatique</option><option>Manuelle</option>
                    </select>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="pt-3 flex gap-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-[#0F2F75] hover:bg-[#0A2463] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                  >
                    Enregistrer le véhicule
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setImagePreview(null); }}
                    className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Détails Réservation */}
      <AnimatePresence>
        {showDetailModal && selectedBooking && (() => {
          const currentDriver = typeof selectedBooking.assignedDriver === 'object' && selectedBooking.assignedDriver !== null
            ? selectedBooking.assignedDriver
            : drivers.find(d => d._id === selectedBooking.assignedDriver);
          const durationDays = Math.max(
            1,
            Math.round((new Date(selectedBooking.endDate) - new Date(selectedBooking.startDate)) / (1000 * 60 * 60 * 24))
          );
          const driverPhone = currentDriver?.whatsapp || currentDriver?.phone?.replace(/[^0-9]/g, '');
          const clientPhone = selectedBooking.phone?.replace(/[^0-9]/g, '');

          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDetailModal(false)}
                className="absolute inset-0 bg-[#0F2F75]/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-left flex flex-col max-h-[92vh]"
              >
                {/* En-tête épuré et aéré */}
                <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-white shrink-0">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                          Fiche <span className="text-[#E3383C]">Mission</span>
                        </h3>
                        <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                          #{selectedBooking._id?.slice(-6).toUpperCase() || 'REF'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Détails de réservation et logistique chauffeur</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(selectedBooking.status)}
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center"
                      title="Fermer"
                    >
                      <FaTimes size={13} />
                    </button>
                  </div>
                </div>

                {/* Détails réservation */}
                <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
                  {/* Véhicule & Locataire */}
                  <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    {/* Véhicule */}
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-14 rounded-xl overflow-hidden bg-white border border-slate-200/80 shrink-0 shadow-2xs">
                        <img
                          src={selectedBooking.car?.image ? resolveImageUrl(selectedBooking.car.image) : ''}
                          alt={selectedBooking.car?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E3383C]">
                          {selectedBooking.car?.brand || 'Véhicule'}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base leading-snug">
                          {selectedBooking.car?.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          {selectedBooking.car?.gearbox || 'Automatique'} • {selectedBooking.car?.fuel || 'Diesel'}
                        </p>
                      </div>
                    </div>

                    {/* Séparateur bureau */}
                    <div className="hidden sm:block w-px h-12 bg-slate-200/80" />

                    {/* Client & Période */}
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-5 sm:gap-7">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Locataire
                        </span>
                        <p className="text-sm font-bold text-slate-900 leading-snug">
                          {selectedBooking.fullName}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {selectedBooking.phone}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Période
                        </span>
                        <p className="text-xs font-bold text-slate-900 leading-snug">
                          Du {new Date(selectedBooking.startDate).toLocaleDateString('fr-FR')} au {new Date(selectedBooking.endDate).toLocaleDateString('fr-FR')}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-white rounded text-[10px] font-bold text-slate-600 border border-slate-200/80">
                          {durationDays} {durationDays > 1 ? 'jours' : 'jour'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Prise en charge & Logistique */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E3383C]" />
                        Prise en charge & Logistique
                      </h4>
                      {selectedBooking.pickupTime && (
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60 flex items-center gap-1.5">
                          <FaClock size={11} className="text-[#E3383C]" />
                          {selectedBooking.pickupTime}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Lieu de rendez-vous */}
                      <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <FaMapMarkerAlt size={11} className="text-[#E3383C]" />
                          Lieu de rendez-vous
                        </span>
                        <p className="text-xs font-bold text-slate-800">
                          {selectedBooking.pickupLocation || 'Agence Centre-Ville'}
                        </p>
                        {selectedBooking.deliveryAddress && (
                          <p className="text-xs text-slate-500 font-medium pt-0.5">
                            {selectedBooking.deliveryAddress}
                          </p>
                        )}
                      </div>

                      {/* Vol / Accueil */}
                      <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <FaPlane size={11} className="text-[#E3383C]" />
                          Vol / Accueil
                        </span>
                        {selectedBooking.flightNumber ? (
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                              Vol {selectedBooking.flightNumber}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">Terminal Arrivées</span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 font-medium pt-0.5">
                            Accueil direct en agence
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Consignes particulières */}
                    {selectedBooking.deliveryNotes && (
                      <div className="p-3.5 bg-amber-50/30 border border-amber-200/40 rounded-xl flex items-start gap-3 text-xs text-slate-700">
                        <span className="px-2 py-0.5 bg-white text-[#E3383C] font-extrabold text-[10px] rounded border border-slate-200 shrink-0 uppercase tracking-wider">
                          Consigne
                        </span>
                        <p className="leading-relaxed font-medium">
                          {selectedBooking.deliveryNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 3. Chauffeur Référent & Dispatch */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E3383C]" />
                      Chauffeur Référent & Dispatch
                    </h4>

                    <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-[#0F2F75] text-[#E3383C] flex items-center justify-center font-bold text-sm shrink-0">
                            <FaCar size={16} />
                          </div>
                          <div>
                            {currentDriver ? (
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="text-sm font-bold text-slate-900">
                                    {currentDriver.name}
                                  </h5>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                                    currentDriver.status === 'disponible' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    currentDriver.status === 'en_mission' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}>
                                    {currentDriver.status === 'disponible' ? 'Disponible' :
                                     currentDriver.status === 'en_mission' ? 'En mission' : 'En repos'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                  {currentDriver.phone} • Zone : {currentDriver.zone || 'Fès'}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-xs font-semibold text-slate-600">
                                  Aucun chauffeur assigné
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  Affectez un livreur ci-contre pour transmettre la mission
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Dropdown choix chauffeur */}
                        <div className="sm:w-60">
                          <select
                            value={currentDriver?._id || selectedBooking.assignedDriver || ''}
                            onChange={(e) => handleAssignDriver(selectedBooking._id || selectedBooking.id, e.target.value || null)}
                            className="w-full text-xs px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none focus:border-[#E3383C] transition-colors cursor-pointer"
                          >
                            <option value="">-- Assigner un chauffeur --</option>
                            {drivers.map(d => (
                              <option key={d._id} value={d._id}>
                                {d.name} ({d.zone || d.phone}) — {d.status === 'disponible' ? 'Dispo' : d.status === 'en_mission' ? 'Mission' : 'Repos'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Boutons de communication */}
                      <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-100">
                        <a
                          href={currentDriver ? `https://wa.me/${driverPhone}?text=${encodeURIComponent(
                            `ORDRE DE MISSION LOCAFÈS\n` +
                            `Chauffeur assigné : ${currentDriver.name}\n` +
                            `Véhicule : ${selectedBooking.car?.name || 'Véhicule'}\n` +
                            `Client : ${selectedBooking.fullName}\n` +
                            `Téléphone : ${selectedBooking.phone}\n` +
                            `Lieu de rendez-vous : ${selectedBooking.pickupLocation || 'Agence Quartier Atlas'}` +
                            (selectedBooking.flightNumber ? ` (Vol : ${selectedBooking.flightNumber})` : '') +
                            (selectedBooking.deliveryAddress ? ` - Adresse : ${selectedBooking.deliveryAddress}` : '') + `\n` +
                            `Date & Heure : ${new Date(selectedBooking.startDate).toLocaleDateString('fr-FR')} à ${selectedBooking.pickupTime || 'Heure convenue'}\n` +
                            `Montant à encaisser : ${selectedBooking.totalPrice} DH (${selectedBooking.paymentMethod === 'card' ? 'Payé par carte bancaire' : 'Espèces à encaisser'})` +
                            (selectedBooking.deliveryNotes ? `\nInstructions spéciales : ${selectedBooking.deliveryNotes}` : '')
                          )}` : '#'}
                          target={currentDriver ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                            currentDriver
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
                          }`}
                          title={currentDriver ? `Envoyer ordre de mission à ${currentDriver.name}` : 'Assignez d\'abord un chauffeur'}
                        >
                          <FaWhatsapp size={15} />
                          <span>
                            {currentDriver
                              ? `Envoyer la mission à ${currentDriver.name.split(' ')[0]} (WhatsApp)`
                              : 'Assignez un chauffeur pour envoyer la mission'}
                          </span>
                        </a>

                        <a
                          href={`https://wa.me/${clientPhone}?text=${encodeURIComponent(
                            `Bonjour ${selectedBooking.fullName}, nous préparons votre véhicule (${selectedBooking.car?.name || ''}) chez LocaFès pour votre arrivée.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shrink-0"
                          title="Contacter le client sur WhatsApp"
                        >
                          <FaWhatsapp size={15} className="text-emerald-600" />
                          <span>WhatsApp Client</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* 4. Récapitulatif Financier */}
                  <div className="p-5 bg-[#0F2F75] rounded-2xl text-white flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Montant Total TTC
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                          {selectedBooking.totalPrice?.toLocaleString('fr-FR')}
                        </span>
                        <span className="text-xs font-bold text-[#E3383C]">DH</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                        Mode de règlement
                      </span>
                      <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-semibold text-slate-200 border border-white/10">
                        {selectedBooking.paymentMethod === 'card' ? 'Carte bancaire en ligne' : 'Règlement en espèces sur place'}
                      </span>
                    </div>
                  </div>

                  {/* Bouton Facture & Contrat PDF */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenInvoice(selectedBooking)}
                      className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/90 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <FaFilePdf className="text-rose-500" size={13} />
                      Ouvrir la Facture & Contrat PDF
                    </button>
                  </div>

                  {/* 5. Boutons de décision / statut */}
                  {selectedBooking.status === 'pending' && (
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => { handleUpdateBooking(selectedBooking._id, 'confirmed'); setShowDetailModal(false); }}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs"
                      >
                        <FaCheck size={12} /> Confirmer la réservation
                      </button>
                      <button
                        onClick={() => { handleUpdateBooking(selectedBooking._id, 'cancelled'); setShowDetailModal(false); }}
                        className="py-3 px-6 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                      >
                        <FaTimes size={12} /> Refuser
                      </button>
                    </div>
                  )}

                  {selectedBooking.status === 'confirmed' && (
                    <div className="pt-1">
                      <button
                        onClick={() => { handleUpdateBooking(selectedBooking._id, 'completed'); setShowDetailModal(false); }}
                        className="w-full py-3 bg-[#0F2F75] hover:bg-[#0A2463] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2"
                      >
                        <FaCheck size={12} /> Marquer comme terminée
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Modal Modification Véhicule */}
      <AnimatePresence>
        {showEditModal && editingCar && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-[#0F2F75]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-left flex flex-col max-h-[92vh]"
            >
              {/* En-tête épuré */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-white shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    Modifier <span className="text-[#E3383C]">Véhicule</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Mettre à jour les spécifications et tarifs</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditImagePreview(null); }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                  title="Fermer"
                >
                  <FaTimes size={13} />
                </button>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleUpdateCar} className="p-6 sm:p-8 space-y-5 overflow-y-auto">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Modèle *</label>
                    <input
                      required
                      value={editingCar.name}
                      onChange={e => setEditingCar({ ...editingCar, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#E3383C] focus:ring-2 focus:ring-[#E3383C]/15 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Marque *</label>
                    <input
                      required
                      value={editingCar.brand}
                      onChange={e => setEditingCar({ ...editingCar, brand: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#E3383C] focus:ring-2 focus:ring-[#E3383C]/15 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Tarif (DH / Jour) *</label>
                    <input
                      required
                      type="number"
                      value={editingCar.price}
                      onChange={e => setEditingCar({ ...editingCar, price: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#E3383C] focus:ring-2 focus:ring-[#E3383C]/15 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Année *</label>
                    <input
                      type="number"
                      value={editingCar.year}
                      onChange={e => setEditingCar({ ...editingCar, year: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#E3383C] focus:ring-2 focus:ring-[#E3383C]/15 transition-all"
                    />
                  </div>
                </div>

                {/* Photo du véhicule */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Photo du Véhicule</label>
                  {(editImagePreview || editingCar.image) && (
                    <div className="relative rounded-2xl overflow-hidden h-40 border border-slate-200/80 shadow-xs mb-2">
                      <img src={editImagePreview || resolveImageUrl(editingCar.image)} alt="Aperçu véhicule" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2.5 left-2.5 text-white bg-[#0F2F75]/70 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {editImagePreview ? 'Nouvelle image' : 'Image actuelle'}
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      setEditingCar({ ...editingCar, imageFile: file });
                      if (file) setEditImagePreview(URL.createObjectURL(file));
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs text-slate-600 outline-none focus:border-[#E3383C] file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                </div>

                {/* Carburant & Boîte */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Carburant</label>
                    <select
                      value={editingCar.fuel}
                      onChange={e => setEditingCar({ ...editingCar, fuel: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl font-semibold text-xs text-slate-800 outline-none focus:bg-white focus:border-[#E3383C] cursor-pointer"
                    >
                      <option>Diesel</option><option>Essence</option><option>Hybride</option><option>Électrique</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Boîte de vitesse</label>
                    <select
                      value={editingCar.gearbox}
                      onChange={e => setEditingCar({ ...editingCar, gearbox: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl font-semibold text-xs text-slate-800 outline-none focus:bg-white focus:border-[#E3383C] cursor-pointer"
                    >
                      <option>Automatique</option><option>Manuelle</option>
                    </select>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="pt-3 flex gap-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-[#0F2F75] hover:bg-[#0A2463] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                  >
                    Enregistrer les modifications
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setEditImagePreview(null); }}
                    className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Modification Utilisateur */}
      <AnimatePresence>
        {showUserEditModal && editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUserEditModal(false)}
              className="absolute inset-0 bg-[#0F2F75]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-left flex flex-col"
            >
              {/* En-tête épuré */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-white shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    Modifier <span className="text-[#E3383C]">Utilisateur</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Mise à jour des informations du profil</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUserEditModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                  title="Fermer"
                >
                  <FaTimes size={13} />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="p-6 sm:p-8 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Nom Complet *</label>
                  <input
                    required
                    value={editingUser.name}
                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#E3383C] focus:ring-2 focus:ring-[#E3383C]/15 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Email *</label>
                  <input
                    required
                    type="email"
                    value={editingUser.email}
                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#E3383C] focus:ring-2 focus:ring-[#E3383C]/15 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Téléphone</label>
                  <input
                    value={editingUser.phone || ''}
                    onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#E3383C] focus:ring-2 focus:ring-[#E3383C]/15 transition-all"
                    placeholder="06 00 00 00 00"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Rôle du Compte</label>
                  <select
                    value={editingUser.role}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl font-semibold text-xs text-slate-800 outline-none focus:bg-white focus:border-[#E3383C] cursor-pointer"
                  >
                    <option value="user">Utilisateur (Client)</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div className="pt-3 flex gap-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-[#0F2F75] hover:bg-[#0A2463] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                  >
                    Sauvegarder
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUserEditModal(false)}
                    className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
