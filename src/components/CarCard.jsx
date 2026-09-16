import { memo } from "react";
import { Link } from "react-router-dom";
import { FaGasPump, FaCog, FaCalendarAlt, FaArrowRight, FaCar, FaStar } from "react-icons/fa";
import { resolveImageUrl } from "../utils/imageUrl";

const CarCard = memo(function CarCard({ car }) {
  if (!car) return null;

  const isAvailable = car.isAvailableNow !== false;

  return (
    <div className="transform transition-all duration-300 hover:-translate-y-2">
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
        <div className="relative h-56 overflow-hidden bg-[#F9FAFB] flex items-center justify-center">
          {car.image ? (
            <img 
              src={resolveImageUrl(car.image)}
              alt={car.name} 
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              onError={(e) => {
                e.target.onerror = null; 
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold tracking-wide backdrop-blur-md shadow-sm ${
              isAvailable 
                ? 'bg-white/95 text-slate-800 border border-emerald-500/30' 
                : 'bg-white/95 text-slate-500 border border-slate-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              {isAvailable ? 'Disponible à Fès' : 'Réservé'}
            </span>
          </div>

          <div className="absolute top-3.5 right-3.5 px-3 py-1 bg-white/95 backdrop-blur-md rounded-lg text-[11px] font-semibold text-slate-800 border border-slate-100 shadow-sm z-10">
            {car.gearbox === 'Automatique' ? 'Boîte Auto' : 'Manuelle'}
          </div>

          <div style={{display: !car.image ? 'flex' : 'none'}} className="flex-col items-center justify-center gap-2 text-gray-400 absolute inset-0 bg-[#F9FAFB]">
            <FaCar size={40} className="opacity-20" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#6B7280]">Image indisponible</span>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xl font-bold text-[#111827] group-hover:text-[#C4A47C] transition-colors line-clamp-1">
                {car.name}
              </h3>
              {car.numReviews > 0 ? (
                <div className="flex items-center gap-1 text-xs text-amber-500 shrink-0">
                  <FaStar size={11} />
                  <span className="font-bold text-[#111827]">{car.rating.toFixed(1)}</span>
                  <span className="text-gray-400 text-[10px]">({car.numReviews})</span>
                </div>
              ) : (
                <span className="text-[11px] text-gray-400 font-medium shrink-0">Nouveau</span>
              )}
            </div>
            <p className="text-[#8B7355] text-xs font-semibold tracking-wider mt-0.5">
              {car.brand || 'Gamme Récente'} • Fès Saïss
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-6">
            <div className="flex flex-col items-center p-2.5 bg-[#F9FAFB] rounded-xl border border-gray-100 group-hover:bg-[#F8F5F0]/60 transition-colors">
              <FaCalendarAlt className="text-[#C4A47C] mb-1" size={13} />
              <span className="text-xs text-[#111827] font-bold">{car.year}</span>
            </div>

            <div className="flex flex-col items-center p-2.5 bg-[#F9FAFB] rounded-xl border border-gray-100 group-hover:bg-[#F8F5F0]/60 transition-colors">
              <FaGasPump className="text-[#C4A47C] mb-1" size={13} />
              <span className="text-xs text-[#111827] font-bold">{car.fuel}</span>
            </div>

            <div className="flex flex-col items-center p-2.5 bg-[#F9FAFB] rounded-xl border border-gray-100 group-hover:bg-[#F8F5F0]/60 transition-colors">
              <FaCog className="text-[#C4A47C] mb-1" size={13} />
              <span className="text-xs text-[#111827] font-bold">{car.gearbox === 'Automatique' ? 'Auto' : 'Manuelle'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">À partir de</p>
              <p className="text-2xl font-black text-[#111827] leading-none">
                {car.price} <span className="text-xs font-bold text-[#C4A47C]">DH / jour</span>
              </p>
              <p className="text-[10px] text-emerald-600 font-medium mt-1">Assurance incluse</p>
            </div>
            
            <Link 
              to={`/cars/${car._id || car.id}`} 
              aria-label={`Réserver la voiture ${car.name}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#111827] text-white rounded-xl font-bold text-xs hover:bg-[#C4A47C] hover:text-[#111827] hover:shadow-lg transition-all active:scale-95 group/btn"
            >
              Réserver
              <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CarCard;
