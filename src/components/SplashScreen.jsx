import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCar } from 'react-icons/fa';

export default function SplashScreen({ onComplete }) {
  const [alreadySeen] = useState(() => sessionStorage.getItem('locafes_splash_shown') === 'true');
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (alreadySeen) {
      onComplete();
    }
  }, [alreadySeen, onComplete]);

  useEffect(() => {
    if (alreadySeen) return;
    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem('locafes_splash_shown', 'true');
      setTimeout(onComplete, 400); 
    }, 1100);
    return () => clearTimeout(timer);
  }, [alreadySeen, onComplete]);

  if (alreadySeen) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0F2F75]"
        >
          {}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-[#E3383C]/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-[#E3383C]/5 rounded-full animate-ping" style={{ animationDuration: '4s' }} />

          {}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="relative mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-[#E3383C] to-[#C42A2E] rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(227, 56, 60,0.3)]">
              <FaCar className="text-white" size={40} />
            </div>
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
              LOCA<span className="text-[#E3383C]">FÈS</span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-[10px] text-[#F0585B]/60 font-bold uppercase tracking-[0.4em]"
            >
              L'Excellence Automobile
            </motion.p>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, delay: 1.0, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-[#E3383C] to-[#F0585B] rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
