import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaCar, FaUser, FaSignOutAlt, FaTachometerAlt, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';

export default function Navbar() {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  
  const isHeroPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Accueil' },
    { path: '/cars', label: 'Voitures' },
    { path: '/why-choose-us', label: 'Pourquoi nous choisir' },
    { path: '/contact', label: 'Contact' },
  ];

  
  const isTransparent = isHeroPage && !scrolled && !menuOpen;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isTransparent 
        ? 'bg-transparent py-5' 
        : 'bg-white/95 backdrop-blur-md shadow-lg shadow-black/[0.03] py-3'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {}
        <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold group">
          <div className={`p-2 rounded-xl group-hover:scale-110 transition-all duration-300 shadow-lg ${
            isTransparent 
              ? 'bg-white/10 backdrop-blur-md shadow-white/5' 
              : 'bg-[#111827] shadow-black/10'
          }`}>
            <FaCar className="text-white" size={24} />
          </div>
          <span className={`transition-colors duration-300 ${isTransparent ? 'text-white' : 'text-[#111827]'}`}>
            LOCA<span className="text-[#C4A47C]">FÈS</span>
          </span>
        </Link>

        {}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`font-semibold transition-all duration-300 relative group ${
                isActive(link.path) 
                  ? 'text-[#C4A47C]' 
                  : isTransparent
                    ? 'text-white/80 hover:text-white'
                    : 'text-[#6B7280] hover:text-[#C4A47C]'
              }`}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#C4A47C] transition-all ${
                isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
          ))}
          
          <div className={`h-6 w-px transition-colors duration-300 ${isTransparent ? 'bg-white/20' : 'bg-gray-200'}`}></div>

          {currentUser ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link 
                  to="/dashboard"
                  className={`flex items-center gap-2 font-semibold transition-colors duration-300 ${
                    isTransparent ? 'text-white/80 hover:text-white' : 'text-[#6B7280] hover:text-[#C4A47C]'
                  }`}
                >
                  <FaTachometerAlt />
                  Dashboard
                </Link>
              )}
              <Link to="/profile" className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                isTransparent 
                  ? 'bg-white/10 backdrop-blur-md hover:bg-white/20 text-white' 
                  : 'bg-[#F8F5F0] hover:bg-[#F0EBE3]'
              }`}>
                <FaUser className={isTransparent ? 'text-white' : 'text-[#C4A47C]'} />
                <span className={`text-sm font-bold ${isTransparent ? 'text-white' : 'text-[#111827]'}`}>
                  {currentUser.name || currentUser.email?.split('@')[0]}
                </span>
              </Link>
              <button 
                onClick={handleLogout} 
                className={`p-2.5 rounded-lg transition-all duration-300 ${
                  isTransparent 
                    ? 'text-red-300 hover:bg-white/10' 
                    : 'text-red-500 hover:bg-red-50'
                }`}
                title="Déconnexion"
              >
                <FaSignOutAlt size={20} />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className={`px-6 py-2.5 rounded-lg font-bold transition-all duration-300 ${
                isTransparent
                  ? 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 hover:-translate-y-0.5'
                  : 'bg-[#111827] text-white hover:shadow-lg hover:shadow-black/15 hover:-translate-y-0.5'
              }`}
            >
              Connexion
            </Link>
          )}
        </div>

        {}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label='Menu de navigation'
          className={`md:hidden p-2 rounded-lg transition-colors ${
            isTransparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'
          }`}
        >
          {menuOpen 
            ? <FaTimes size={24} className={isTransparent ? 'text-white' : 'text-[#111827]'} /> 
            : <FaBars size={24} className={isTransparent ? 'text-white' : 'text-[#111827]'} />
          }
        </button>
      </div>

      {}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t transition-all duration-300 ease-out ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
          <div className="p-6 space-y-4">
            {navLinks.map(link => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`block py-3 px-4 rounded-xl font-bold transition-all ${
                  isActive(link.path) 
                    ? 'bg-[#F8F5F0] text-[#C4A47C]' 
                    : 'text-[#6B7280] hover:bg-gray-50'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {currentUser ? (
              <div className="pt-4 border-t space-y-3">
                {isAdmin && (
                  <Link 
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-[#111827] font-bold"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FaTachometerAlt className="text-[#C4A47C]" />
                    Dashboard Administrateur
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-3 px-4 py-3 bg-[#F8F5F0] rounded-xl hover:bg-[#F0EBE3] transition-colors" onClick={() => setMenuOpen(false)}>
                  <FaUser className="text-[#C4A47C]" />
                  <span className="font-bold text-[#111827]">{currentUser.name || currentUser.email}</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-bold shadow-lg shadow-red-500/20"
                >
                  <FaSignOutAlt />
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="block text-center py-4 bg-[#111827] text-white rounded-xl font-bold shadow-lg shadow-black/15"
                onClick={() => setMenuOpen(false)}
              >
                Connexion
              </Link>
            )}

            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
              <a 
                href="tel:+212535621020" 
                className="flex items-center justify-center gap-2 py-3 bg-[#F8F5F0] text-[#111827] rounded-xl font-bold text-xs hover:bg-[#F0EBE3] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <FaPhoneAlt className="text-[#C4A47C]" size={12} />
                Appeler
              </a>
              <a 
                href="https://wa.me/212668898245" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <FaWhatsapp className="text-emerald-500" size={14} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
    </nav>
  );
}