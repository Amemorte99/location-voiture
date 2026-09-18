import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser, 
  FaPhoneAlt, FaArrowRight, FaArrowLeft 
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function Login({ defaultRegister = false }) {
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(() => {
    return defaultRegister || location.pathname === '/register' || Boolean(location.state?.register);
  });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isRegister) {
        if (!formData.name?.trim()) {
          toast.error('Veuillez renseigner votre nom complet');
          setLoading(false);
          return;
        }
        if (!formData.phone?.trim()) {
          toast.error('Veuillez renseigner votre numéro de téléphone');
          setLoading(false);
          return;
        }
        if (!formData.email?.trim()) {
          toast.error('Veuillez renseigner une adresse email valide');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          toast.error('Le mot de passe doit contenir au moins 6 caractères');
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error("Les mots de passe ne correspondent pas");
          setLoading(false);
          return;
        }
        const newUser = await register({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: formData.phone.trim()
        });
        toast.success("Compte créé avec succès ! Bienvenue chez LocaFès.");
        if (newUser?.role === 'admin') {
          navigate('/dashboard', { replace: true });
          return;
        }
      } else {
        const user = await login(formData.email.trim().toLowerCase(), formData.password);
        toast.success("Ravi de vous revoir !");
        
        if (user?.role === 'admin') {
          navigate('/dashboard', { replace: true });
          return;
        }
      }
      navigate(from === '/' ? '/profile' : from, { replace: true });
    } catch (err) {
      let errorMsg = "Une erreur est survenue lors de l'authentification";
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors) && err.response.data.errors.length > 0) {
        errorMsg = Object.values(err.response.data.errors[0])[0];
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return null;
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { label: 'Mot de passe robuste', color: '#10b981', width: '100%' };
    }
    if (password.length >= 6) {
      return { label: 'Mot de passe correct', color: '#f59e0b', width: '60%' };
    }
    return { label: 'Trop court (min. 6 caractères)', color: '#ef4444', width: '30%' };
  };

  const strength = isRegister ? getPasswordStrength(formData.password) : null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#070B14] py-10 px-4 sm:px-6 font-sans">
      <Helmet>
        <title>{isRegister ? 'Inscription Prestige | LocaFès' : 'Connexion Espace Client Privilège | LocaFès'}</title>
        <meta name="description" content="Accédez à votre espace client LocaFès pour gérer vos réservations et vos contrats de location." />
      </Helmet>

      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none select-none z-0" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="moroccan-zellige" width="70" height="70" patternUnits="userSpaceOnUse">
            <path d="M35 0 L70 35 L35 70 L0 35 Z" fill="none" stroke="#C4A47C" strokeWidth="0.8" />
            <path d="M35 12 L58 35 L35 58 L12 35 Z" fill="none" stroke="#C4A47C" strokeWidth="0.5" />
            <circle cx="35" cy="35" r="4.5" fill="none" stroke="#C4A47C" strokeWidth="0.8" />
            <path d="M0 0 L18 18 M70 0 L52 18 M70 70 L52 52 M0 70 L18 52" stroke="#C4A47C" strokeWidth="0.6" />
            <path d="M35 0 L35 12 M35 58 L35 70 M0 35 L12 35 M58 35 L70 35" stroke="#C4A47C" strokeWidth="0.5" />
            <rect x="30" y="30" width="10" height="10" transform="rotate(45 35 35)" fill="none" stroke="#C4A47C" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#moroccan-zellige)" />
      </svg>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C4A47C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 -left-28 w-80 h-80 bg-[#1A2E4C]/40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 -right-28 w-80 h-80 bg-[#C4A47C]/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#0A1120] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#04060B] to-transparent pointer-events-none" />

      {/* Arrière-plan cinématique : Flotte prestige en showroom */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 0.52, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src="/images/login-luxury-cars.jpg" 
            alt="Flotte de prestige LocaFès" 
            className="w-full h-full object-cover object-center filter contrast-[1.08] brightness-[0.95]"
          />
          {/* Dégradés d'assombrissement et de fusion pour le thème LocaFès #070B14 */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/30 to-[#070B14]/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070B14]/75 via-transparent to-[#070B14]/75" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#070B14_85%)]" />
        </motion.div>
      </div>

      <div className="relative z-10 w-full max-w-[460px] my-auto">
        <motion.div 
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full bg-white/95 backdrop-blur-xl rounded-[28px] p-7 sm:p-10 border border-[#C4A47C]/30 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),0_0_50px_rgba(196,164,124,0.12)] overflow-hidden text-left"
        >
          <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-[#C4A47C]/80 to-transparent" />
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#C4A47C]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-7">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#0B1329] transition-colors group"
            >
              <FaArrowLeft size={11} className="text-[#C4A47C] group-hover:-translate-x-1 transition-transform" />
              <span className="group-hover:text-[#0B1329] transition-colors">Retour au catalogue</span>
            </Link>
            <Link to="/" className="flex flex-col items-end group">
              <span className="text-xl font-black tracking-tight text-[#0B1329]">
                LOCA<span className="text-[#C4A47C]">FÈS</span>
              </span>
              <span className="text-[8px] tracking-[0.25em] font-extrabold text-[#C4A47C]/90 uppercase -mt-0.5">
                Prestige Car
              </span>
            </Link>
          </div>

          {/* Sélecteur d'onglets (Segmented Control) avec accent Or & Marine */}
          <div className="grid grid-cols-2 p-1.5 bg-[#F3F4F6] rounded-2xl mb-7 border border-gray-200/80 shadow-inner">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`relative py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                !isRegister 
                  ? 'bg-[#0B1329] text-white shadow-md border border-[#C4A47C]/40' 
                  : 'text-gray-500 hover:text-[#0B1329] hover:bg-white/60'
              }`}
            >
              {!isRegister && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C4A47C] shadow-[0_0_8px_#C4A47C]" />
              )}
              <span>Se connecter</span>
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`relative py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                isRegister 
                  ? 'bg-[#0B1329] text-white shadow-md border border-[#C4A47C]/40' 
                  : 'text-gray-500 hover:text-[#0B1329] hover:bg-white/60'
              }`}
            >
              {isRegister && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C4A47C] shadow-[0_0_8px_#C4A47C]" />
              )}
              <span>Créer un compte</span>
            </button>
          </div>

          {/* Titre principal */}
          <div className="mb-7">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-4 h-[1.5px] bg-[#C4A47C]" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#C4A47C]">
                {isRegister ? 'Adhésion Prestige' : 'Espace Privilège'}
              </span>
            </div>
            <h1 
              className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight leading-snug"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {isRegister ? (
                <>Créer votre compte <span className="text-[#C4A47C] italic font-normal">Privilège</span></>
              ) : (
                <>Bienvenue chez <span className="text-[#C4A47C] italic font-normal">LocaFès</span></>
              )}
            </h1>
            <p className="text-gray-500 text-xs font-medium mt-1.5 leading-relaxed">
              {isRegister 
                ? 'Complétez vos coordonnées pour réserver en toute sérénité à Fès et à l\'Aéroport Saïss.' 
                : 'Saisissez vos identifiants pour accéder à vos réservations et contrats.'
              }
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {isRegister && (
                <motion.div 
                  key="register-name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 group overflow-hidden"
                >
                  <label className="block text-[10px] font-black text-[#475569] uppercase tracking-[0.16em]">
                    Nom & Prénom
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C4A47C] transition-colors duration-200 pointer-events-none">
                      <FaUser size={14} />
                    </div>
                    <input
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Ex: Mohammed Benjelloun"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#F8FAFC] border border-gray-200/90 rounded-xl font-semibold text-sm text-[#0F172A] placeholder:text-gray-400 placeholder:font-normal outline-none transition-all duration-200 focus:bg-white focus:border-[#C4A47C] focus:ring-4 focus:ring-[#C4A47C]/15"
                      required={isRegister}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Champ Email (ou Email / Téléphone en mode connexion) */}
            <div className="space-y-1.5 group">
              <label className="block text-[10px] font-black text-[#475569] uppercase tracking-[0.16em]">
                {isRegister ? 'Adresse email' : 'Adresse email ou Téléphone'}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C4A47C] transition-colors duration-200 pointer-events-none">
                  <FaEnvelope size={14} />
                </div>
                <input
                  name="email"
                  type={isRegister ? 'email' : 'text'}
                  autoComplete="email"
                  placeholder={isRegister ? 'nom@exemple.com' : 'nom@exemple.com ou 06 68 89 82 45'}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 bg-[#F8FAFC] border border-gray-200/90 rounded-xl font-semibold text-sm text-[#0F172A] placeholder:text-gray-400 placeholder:font-normal outline-none transition-all duration-200 focus:bg-white focus:border-[#C4A47C] focus:ring-4 focus:ring-[#C4A47C]/15"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {isRegister && (
                <motion.div 
                  key="register-phone-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 group overflow-hidden"
                >
                  <label className="block text-[10px] font-black text-[#475569] uppercase tracking-[0.16em]">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C4A47C] transition-colors duration-200 pointer-events-none">
                      <FaPhoneAlt size={14} />
                    </div>
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Ex: 06 68 89 82 45"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#F8FAFC] border border-gray-200/90 rounded-xl font-semibold text-sm text-[#0F172A] placeholder:text-gray-400 placeholder:font-normal outline-none transition-all duration-200 focus:bg-white focus:border-[#C4A47C] focus:ring-4 focus:ring-[#C4A47C]/15"
                      required={isRegister}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Champ Mot de passe */}
            <div className="space-y-1.5 group">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-black text-[#475569] uppercase tracking-[0.16em]">
                  Mot de passe
                </label>
                {!isRegister && (
                  <button 
                    type="button" 
                    onClick={() => toast('Pour réinitialiser votre accès, contactez notre équipe au 05 35 62 10 20 ou sur WhatsApp.')} 
                    className="text-[10px] font-bold text-[#C4A47C] hover:text-[#A68B5B] transition-colors hover:underline decoration-1 underline-offset-2"
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C4A47C] transition-colors duration-200 pointer-events-none">
                  <FaLock size={14} />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3.5 bg-[#F8FAFC] border border-gray-200/90 rounded-xl font-semibold text-sm text-[#0F172A] placeholder:text-gray-400 placeholder:font-normal outline-none transition-all duration-200 focus:bg-white focus:border-[#C4A47C] focus:ring-4 focus:ring-[#C4A47C]/15"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C4A47C] transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
              </div>

              {strength && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: strength.width, backgroundColor: strength.color }}
                    />
                  </div>
                  <p className="text-[10px] font-bold" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <AnimatePresence>
              {isRegister && (
                <motion.div 
                  key="confirm-password-field"
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 group overflow-hidden"
                >
                  <label className="block text-[10px] font-black text-[#475569] uppercase tracking-[0.16em]">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C4A47C] transition-colors duration-200 pointer-events-none">
                      <FaLock size={14} />
                    </div>
                    <input
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-11 pr-12 py-3.5 bg-[#F8FAFC] border border-gray-200/90 rounded-xl font-semibold text-sm text-[#0F172A] placeholder:text-gray-400 placeholder:font-normal outline-none transition-all duration-200 focus:bg-white focus:border-[#C4A47C] focus:ring-4 focus:ring-[#C4A47C]/15"
                      required={isRegister}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-4 px-6 bg-gradient-to-r from-[#0B1329] via-[#152238] to-[#0B1329] text-white rounded-xl font-extrabold text-xs uppercase tracking-[0.2em] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-lg shadow-black/30 hover:shadow-[0_12px_28px_rgba(11,19,41,0.4),0_0_25px_rgba(196,164,124,0.2)] border border-[#C4A47C]/40 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer group"
            >
              {loading ? (
                <div className="flex items-center gap-2 text-white">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-[#C4A47C] rounded-full animate-spin" />
                  <span>Traitement en cours...</span>
                </div>
              ) : (
                <>
                  <span className="group-hover:text-[#F3E5AB] transition-colors">
                    {isRegister ? "Créer mon compte Privilège" : "Se connecter"}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-[#C4A47C]/20 border border-[#C4A47C]/50 flex items-center justify-center text-[#C4A47C] group-hover:translate-x-1 group-hover:bg-[#C4A47C] group-hover:text-[#0B1329] transition-all duration-300">
                    <FaArrowRight size={10} />
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 font-medium">
              {isRegister ? 'Vous disposez déjà d’un compte ?' : 'Première visite chez LocaFès ?'}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="ml-1.5 text-[#0B1329] font-extrabold hover:text-[#C4A47C] transition-colors underline decoration-[#C4A47C]/50 decoration-2 underline-offset-4 cursor-pointer"
              >
                {isRegister ? 'Se connecter' : 'Créer un compte'}
              </button>
            </p>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-[#F8FAFC] border border-gray-200/70 text-center flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C4A47C]" />
            <p className="text-[11px] text-gray-500">
              Besoin d'aide ? Contactez notre agence au{' '}
              <a href="tel:+212535621020" className="font-bold text-[#0B1329] hover:text-[#C4A47C] transition-colors">
                +212 535 62 10 20
              </a>
            </p>
          </div>
        </motion.div>

        {/* Mention de bas de page */}
        <p className="mt-6 text-center text-xs text-gray-400/80 font-medium tracking-wide">
          © {new Date().getFullYear()} LocaFès • Conciergerie Automobile & Location de Prestige à Fès
        </p>
      </div>
    </div>
  );
}

