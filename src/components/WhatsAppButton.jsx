import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const WHATSAPP_NUMBER = '212668898245';

export default function WhatsAppButton() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState(false);

  const getMessage = () => {
    if (location.pathname.startsWith('/cars/')) {
      return 'Bonjour, je suis intéressé par un véhicule sur votre site LocaFès. Pouvez-vous me donner plus d\'informations ?';
    }
    return 'Bonjour, je souhaite des informations sur la location de voiture chez LocaFès.';
  };

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); };
  }, []);

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(getMessage())}`;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>

      {}
      {tooltip && (
        <div className="animate-fadeIn bg-[#111827] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-xl whitespace-nowrap relative">
          Contactez-nous sur WhatsApp
          <div className="absolute bottom-[-6px] right-5 w-3 h-3 bg-[#111827] rotate-45"></div>
        </div>
      )}

      {}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-11 h-11 bg-white border border-gray-200 text-[#C4A47C] rounded-full shadow-lg hover:shadow-xl hover:border-[#C4A47C] hover:scale-110 transition-all flex items-center justify-center"
        aria-label="Retour en haut de page"
        title="Retour en haut"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 12V4M4 8l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        aria-label="Nous contacter sur WhatsApp"
        className="relative w-14 h-14 rounded-full shadow-2xl shadow-emerald-500/30 flex items-center justify-center hover:scale-110 transition-all duration-300"
        style={{ background: '#25D366' }}
      >
        {}
        <svg width="30" height="30" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.61 1.832 6.5L4 29l7.75-1.813A11.94 11.94 0 0016 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10a9.94 9.94 0 01-5.06-1.375l-.36-.219-4.6 1.078 1.094-4.484-.234-.375A9.94 9.94 0 016 15c0-5.523 4.477-10 10-10zm-3.094 5c-.218 0-.562.078-.859.39-.297.313-1.125 1.094-1.125 2.672s1.157 3.094 1.313 3.313c.156.218 2.234 3.531 5.468 4.812.766.328 1.36.516 1.829.657.766.234 1.468.203 2.015.125.61-.094 1.89-.781 2.157-1.532.265-.75.265-1.39.187-1.531-.078-.14-.297-.219-.625-.375-.328-.156-1.89-.938-2.187-1.047-.297-.11-.516-.156-.719.156-.203.313-.781.985-.953 1.188-.172.203-.344.234-.672.078-.328-.156-1.39-.516-2.656-1.64-1.094-.985-1.453-2.188-1.625-2.5-.172-.313-.016-.485.125-.64.14-.141.328-.375.485-.563.156-.187.203-.312.313-.515.109-.203.046-.39-.016-.547-.062-.156-.719-1.75-.984-2.39C13.609 10.11 13.312 10 13.125 10a5.532 5.532 0 00-.219 0z"/>
        </svg>
      </a>
    </div>
  );
}
