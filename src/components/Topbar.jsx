import { useState, useEffect, useRef } from 'react';
import { FaBell, FaBars, FaChevronDown, FaUserShield, FaCalendarDay } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { STATUS_LABELS, STATUS_STYLES } from '../utils/constants';

export default function Topbar({ setIsOpen, isCollapsed, toggleCollapse, pendingBookings = [], recentBookings = [] }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [date] = useState(new Date());
  const [showNotif, setShowNotif] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const formatNotifTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Il y a ${hrs}h`;
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const pendingCount = pendingBookings.length;

  const formattedDate = date.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between gap-4">

      {/* Left */}
      <div className="flex items-center gap-3.5 flex-1">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="lg:hidden p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[#C4A47C] hover:bg-slate-100 transition-all cursor-pointer"
          title="Ouvrir le menu"
        >
          <FaBars size={17} />
        </button>

        {/* Desktop Sidebar collapse toggle */}
        {toggleCollapse && (
          <button
            type="button"
            onClick={toggleCollapse}
            className="hidden lg:flex p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-slate-500 hover:text-slate-900 transition-all cursor-pointer items-center justify-center shadow-2xs"
            title={isCollapsed ? "Développer le menu latéral" : "Réduire le menu latéral"}
            aria-label={isCollapsed ? "Développer le menu latéral" : "Réduire le menu latéral"}
          >
            <FaBars size={14} />
          </button>
        )}

        {/* Date — desktop only */}
        <div className="hidden lg:flex items-center gap-2 text-slate-500">
          <FaCalendarDay className="text-[#C4A47C]" size={12} />
          <span className="text-xs font-semibold capitalize">{formattedDate}</span>
          <span className="text-slate-300">·</span>
          <span className="text-xs font-bold tabular-nums text-slate-900">{formattedTime}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(v => !v)}
            aria-haspopup="menu"
            aria-expanded={showNotif}
            className="relative p-2.5 bg-[#F9FAFB] border border-gray-100 rounded-xl text-[#6B7280] hover:text-[#C4A47C] hover:border-[#E8DDD0] transition-all"
          >
            <FaBell size={17} />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-76 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[200]"
                style={{ width: '300px' }}
              >
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827]">
                    Réservations en attente
                  </span>
                  {pendingCount > 0 && (
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[10px] font-bold rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {pendingBookings.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                      <p className="text-xs text-[#6B7280]">Aucune réservation en attente</p>
                    </div>
                  ) : (
                    pendingBookings.slice(0, 5).map((b) => (
                      <div key={b._id} className="px-5 py-3.5 hover:bg-[#F9FAFB] transition-colors border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#F8F5F0] text-[#C4A47C] flex items-center justify-center font-bold text-sm shrink-0">
                            {b.fullName?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#111827] truncate">{b.fullName}</p>
                            <p className="text-[11px] text-[#6B7280] truncate">{b.car?.name} · {b.totalPrice} DH</p>
                            {b.createdAt && (
                              <p className="text-[10px] text-gray-400 mt-0.5">{formatNotifTime(b.createdAt)}</p>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${STATUS_STYLES[b.status]}`}>
                            {STATUS_LABELS[b.status]}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-100" />

        {/* Profile */}
        <div className="relative" ref={profileMenuRef}>
          <div
            onClick={() => setShowProfileMenu(v => !v)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="hidden text-right md:block">
              <p className="text-sm font-bold text-[#111827] leading-tight">{currentUser?.name || 'Administrateur'}</p>
              <p className="text-[10px] text-[#C4A47C] font-semibold capitalize">{currentUser?.role || 'admin'}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#111827] flex items-center justify-center font-bold text-[#C4A47C] text-sm shadow-sm">
              {currentUser?.name?.charAt(0)?.toUpperCase() || <FaUserShield size={14} />}
            </div>
            <FaChevronDown className={`text-[#6B7280] text-xs transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[200] py-1"
              >
                <Link to="/" className="block px-4 py-2.5 text-xs font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors">
                  Retour au site
                </Link>
                <Link to="/profile" className="block px-4 py-2.5 text-xs font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors">
                  Mon profil
                </Link>
                <div className="h-px bg-gray-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  Déconnexion
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
