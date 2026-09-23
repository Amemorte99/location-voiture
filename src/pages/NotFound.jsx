import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FaHome, FaSearch } from 'react-icons/fa';

export default function NotFound() {
  return (
    <>
    <Helmet><title>Page non trouvée | LocaFès</title></Helmet>
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#F9FAFB] relative overflow-hidden">
      {}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E3EBF8]/50 rounded-full blur-[150px] pointer-events-none" />

      <div className="text-center z-10 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative inline-block mb-10"
        >
          <h1 className="text-[120px] md:text-[200px] font-black tracking-tighter leading-none text-[#111827]/5 select-none drop-shadow-sm">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-8 py-3 bg-[#0F2F75] text-white font-black uppercase tracking-[0.3em] text-sm md:text-lg rounded-2xl shadow-xl shadow-black/15 rotate-[-5deg]">
              Hors Trajectoire
            </div>
          </div>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-5xl font-black tracking-tight text-[#111827] mb-6"
        >
          Destination Inconnue
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-[#6B7280] mb-12 max-w-md mx-auto font-medium"
        >
          Il semble que vous ayez quitté la route. Reprenez le contrôle et retournez vers l'accueil de LocaFès.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link 
            to="/" 
            className="w-full sm:w-auto px-10 py-5 bg-[#0F2F75] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-black/10 hover:scale-105 transition-all"
          >
            <FaHome size={16} /> Retour à l'accueil
          </Link>
          <Link 
            to="/cars" 
            className="w-full sm:w-auto px-10 py-5 bg-white text-[#111827] border border-gray-100 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:shadow-lg hover:border-[#E3383C] transition-all"
          >
            <FaSearch size={16} /> Voir les Voitures
          </Link>
        </motion.div>
      </div>
    </div>
    </>
  );
}
