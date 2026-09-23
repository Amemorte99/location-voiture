import { useState } from "react";
import { motion } from "framer-motion";
import { FaChartLine, FaCar, FaCalendarAlt, FaUsers, FaCog, FaSignOutAlt, FaTimes, FaUserTie, FaChevronLeft, FaChevronRight, FaEnvelope } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  isCollapsed,
  toggleCollapse,
  pendingBookings = 0,
  stats = null,
  availableDrivers = 0,
  unreadMessages = 0
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const effectiveCollapsed = isCollapsed !== undefined ? isCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    if (toggleCollapse) {
      toggleCollapse();
    } else {
      setInternalCollapsed(prev => {
        const next = !prev;
        localStorage.setItem('sidebar_collapsed', String(next));
        return next;
      });
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: <FaChartLine /> },
    { id: 'bookings', label: 'Réservations', icon: <FaCalendarAlt />, badge: pendingBookings },
    { id: 'messages', label: 'Messages & Demandes', icon: <FaEnvelope />, badge: unreadMessages || stats?.unreadMessagesCount || 0 },
    { id: 'cars', label: 'Gestion Voitures', icon: <FaCar />, badge: stats?.totalCars || null },
    { id: 'drivers', label: 'Chauffeurs & Livreurs', icon: <FaUserTie />, badge: availableDrivers || null },
    { id: 'users', label: 'Clients', icon: <FaUsers />, badge: stats?.totalUsers || null },
    { id: 'settings', label: 'Paramètres', icon: <FaCog /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Voile sombre pour mobile */}
      <div
        className={`fixed inset-0 bg-[#0F2F75]/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-slate-100 z-[70] transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          effectiveCollapsed ? 'w-72 lg:w-20' : 'w-72'
        } flex flex-col`}
      >
        {/* En-tête : Logo & Bouton de réduction */}
        <div
          className={`shrink-0 transition-all duration-300 ${
            effectiveCollapsed
              ? 'p-6 pb-8 flex items-center justify-between lg:p-3 lg:py-5 lg:flex-col lg:items-center lg:gap-3 lg:border-b lg:border-slate-100'
              : 'p-6 pb-8 flex items-center justify-between'
          }`}
        >
          <Link to="/" className="flex items-center gap-3 group" title="LocaFès - Accueil">
            <div className="w-10 h-10 rounded-xl bg-[#0F2F75] flex items-center justify-center shadow-md text-[#E3383C] group-hover:scale-105 transition-transform shrink-0">
              <FaCar size={18} />
            </div>
            <span className={`text-xl font-black uppercase tracking-tighter text-slate-900 ${effectiveCollapsed ? 'lg:hidden' : ''}`}>
              LOCA<span className="text-[#E3383C]">FÈS</span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            {/* Bouton pour Réduire / Développer sur Bureau */}
            <button
              type="button"
              onClick={handleToggleCollapse}
              className={`hidden lg:flex rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 items-center justify-center transition-all cursor-pointer shadow-2xs ${
                effectiveCollapsed ? 'w-7 h-7 mt-1' : 'w-8 h-8'
              }`}
              title={effectiveCollapsed ? "Agrandir le menu latéral" : "Réduire le menu latéral"}
              aria-label={effectiveCollapsed ? "Agrandir le menu latéral" : "Réduire le menu latéral"}
            >
              {effectiveCollapsed ? <FaChevronRight size={11} /> : <FaChevronLeft size={11} />}
            </button>

            {/* Bouton fermer sur mobile */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="lg:hidden w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              title="Fermer le menu"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>

        {/* Navigation principale */}
        <nav className={`space-y-1.5 flex-1 overflow-y-auto px-4 ${effectiveCollapsed ? 'lg:px-2.5' : ''}`}>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="relative group">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={`w-full flex items-center rounded-2xl font-bold transition-all duration-200 cursor-pointer gap-3.5 px-5 py-3.5 ${
                    effectiveCollapsed
                      ? 'lg:justify-center lg:py-3.5 lg:px-0'
                      : ''
                  } ${
                    isActive
                      ? 'bg-[#0F2F75] text-white shadow-md shadow-slate-900/10'
                      : 'text-slate-500 hover:text-[#E3383C] hover:bg-slate-50'
                  }`}
                  title={effectiveCollapsed ? item.label : undefined}
                >
                  <span className={`text-lg transition-transform duration-200 shrink-0 ${isActive ? 'scale-110 text-[#E3383C]' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>

                  <span className={`text-[10px] uppercase tracking-[0.2em] font-extrabold flex-1 text-left truncate ${effectiveCollapsed ? 'lg:hidden' : ''}`}>
                    {item.label}
                  </span>

                  {item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${effectiveCollapsed ? 'lg:hidden' : ''} ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.id === 'bookings'
                        ? 'bg-rose-100 text-rose-600 animate-pulse'
                        : item.id === 'messages'
                        ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                        : 'bg-slate-100 text-[#E3383C]'
                    }`}>
                      {item.badge}
                    </span>
                  )}

                  {/* Badge compact en mode réduit */}
                  {effectiveCollapsed && item.badge > 0 && (
                    <span className={`hidden lg:flex absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-[9px] font-black items-center justify-center shadow-xs ${
                      item.id === 'bookings'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : item.id === 'messages'
                        ? 'bg-emerald-500 text-white animate-pulse'
                        : 'bg-[#E3383C] text-slate-900'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </motion.button>

                {/* Tooltip flottant au survol en mode réduit */}
                {effectiveCollapsed && (
                  <div className="hidden lg:flex absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0F2F75] text-white text-xs font-bold rounded-xl shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 items-center gap-2">
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Résumé d'activité (affiché seulement en mode développé) */}
        {stats && (
          <div className={`mx-4 mb-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 ${effectiveCollapsed ? 'lg:hidden' : ''}`}>
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-2.5">Résumé</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Revenus', val: `${(stats.totalRevenue || 0).toLocaleString('fr-FR')} DH` },
                { label: 'Réservations', val: stats.totalBookings || 0 },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                  <p className="text-xs font-black text-slate-900">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Déconnexion */}
        <div className={`border-t border-slate-100 shrink-0 px-4 py-4 ${effectiveCollapsed ? 'lg:p-2.5' : ''}`}>
          <div className="relative group">
            <button
              type="button"
              onClick={handleLogout}
              className={`w-full flex items-center rounded-2xl font-bold text-rose-500 hover:bg-rose-50 transition-all cursor-pointer gap-3.5 px-5 py-3.5 ${
                effectiveCollapsed
                  ? 'lg:justify-center lg:py-3.5 lg:px-0'
                  : ''
              }`}
              title={effectiveCollapsed ? "Déconnexion" : undefined}
            >
              <FaSignOutAlt className="text-lg shrink-0 group-hover:rotate-12 transition-transform" />
              <span className={`text-[10px] uppercase tracking-[0.2em] font-extrabold ${effectiveCollapsed ? 'lg:hidden' : ''}`}>
                Déconnexion
              </span>
            </button>

            {effectiveCollapsed && (
              <div className="hidden lg:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                Déconnexion
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
