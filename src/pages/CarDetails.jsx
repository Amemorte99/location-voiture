import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getCarById } from "../services/carService";
import { 
  FaGasPump, FaCog, FaCalendarAlt, FaArrowLeft, 
  FaCheckCircle, FaCar, FaStar, FaUsers, 
  FaSuitcase, FaDoorOpen, FaWhatsapp 
} from "react-icons/fa";
import SkeletonCard from "../components/SkeletonCard";
import { useAuth } from "../contexts/AuthContext";
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { resolveImageUrl } from "../utils/imageUrl";

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  
  
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchCar = useCallback(async () => {
    try {
      const data = await getCarById(id);
      setCar(data);
    } catch (err) {
      console.error("Erreur chargement détails voiture", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCar();
  }, [fetchCar]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await api.post(`/api/cars/${id}/reviews`, { rating, comment });
      toast.success("Avis ajouté avec succès !");
      setComment("");
      setRating(5);
      fetchCar();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout de l'avis");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <SkeletonCard />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-white">
        <div className="text-center">
          <FaCar className="text-red-400 mx-auto text-5xl mb-6" />
          <h2 className="text-3xl font-extrabold mb-4 text-[#111827]">Véhicule non trouvé</h2>
          <Link to="/cars" className="text-[#C4A47C] font-bold">Retour aux voitures</Link>
        </div>
      </div>
    );
  }

  const resolvedImg = resolveImageUrl(car?.image);

  const handleStartDateChange = (val) => {
    setStartDate(val);
    if (endDate && new Date(val) >= new Date(endDate)) {
      const nextDay = new Date(val);
      nextDay.setDate(nextDay.getDate() + 1);
      setEndDate(nextDay.toISOString().split('T')[0]);
    }
  };

  const getMinEndDate = () => {
    if (!startDate) return new Date().toISOString().split('T')[0];
    const d = new Date(startDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const totalDays = (startDate && endDate) 
    ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
    : 0;

  const totalPrice = totalDays * (car?.price || 0);
  const averageRating = car?.numReviews > 0 ? car.rating.toFixed(1) : null;

  return (
    <div className="min-h-screen pt-24 pb-24 bg-white">
      
      {}
      <div className="relative w-full max-w-7xl mx-auto px-6 mb-16">
        
        {}
        <div className="absolute top-4 left-6 z-30">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#4B5563] hover:text-[#111827] font-extrabold uppercase tracking-widest text-[10px] transition-all bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-gray-200/50">
            <FaArrowLeft size={10} /> Retour
          </button>
        </div>

        {/* Showcase Véhicule */}
        <div className="w-full h-[45vh] lg:h-[60vh] bg-gradient-to-b from-gray-50 to-gray-100/60 rounded-3xl overflow-hidden flex items-center justify-center relative border border-gray-100">
           <div className="relative z-10 w-full max-w-4xl h-full p-8 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={resolvedImg}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  src={resolvedImg} 
                  alt={car.name} 
                  className="max-h-[85%] max-w-[90%] object-contain"
                />
              </AnimatePresence>
           </div>
           
           {}
           <div className="absolute top-6 right-6 z-20">
             <button 
               onClick={() => {
                 if (car.isAvailableNow !== false) {
                   document.getElementById('reservation-panel')?.scrollIntoView({ behavior: 'smooth' });
                   setTimeout(() => document.getElementById('startDateInput')?.focus(), 500);
                 } else {
                   toast.error("Ce véhicule est actuellement occupé.");
                 }
               }}
               className={`flex items-center gap-2 px-3.5 py-1.5 mt-4 lg:mt-0 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm transition-colors cursor-pointer ${
                car.isAvailableNow !== false 
                  ? 'text-emerald-700 bg-white/90 border-emerald-200' 
                  : 'text-rose-700 bg-white/90 border-rose-200 cursor-not-allowed'
              }`}>
                <span className={`w-2 h-2 rounded-full ${car.isAvailableNow !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                {car.isAvailableNow !== false ? 'Véhicule Disponible' : 'Véhicule Occupé'}
                {car.isAvailableNow !== false && <span className="opacity-60 hidden sm:inline ml-1">- Réserver</span>}
              </button>
           </div>
        </div>
      </div>

      {}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_420px] gap-16 items-start relative">
          
          {}
          <div className="space-y-16">
            
             {/* Titre & Évaluation Desktop */}
             <div className="hidden lg:block border-b border-gray-100 pb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-2 tracking-tight">{car.brand} {car.name}</h1>
                <div className="flex items-center gap-4 text-sm font-bold text-[#6B7280]">
                  <span className="uppercase tracking-widest">{car.category || 'Premium'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  {car.numReviews > 0 ? (
                    <div className="flex items-center gap-1 text-amber-500">
                      <FaStar /> <span className="text-[#111827]">{averageRating}</span> <span className="font-medium text-gray-500">({car.numReviews} avis)</span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                      Nouveau en flotte
                    </span>
                  )}
                </div>
             </div>

             {/* Titre & Évaluation Mobile */}
             <div className="lg:hidden mb-12 border-b border-gray-100 pb-8">
               <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-2">{car.brand} {car.name}</h1>
               {car.numReviews > 0 ? (
                 <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                    <FaStar /> <span className="text-[#111827]">{averageRating}</span> <span className="font-medium text-gray-500">({car.numReviews} avis)</span>
                 </div>
               ) : (
                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                   Nouveau en flotte
                 </span>
               )}
             </div>



            {/* Spécifications Minimalistes Modernes */}
            <div>
              <h3 className="text-xl font-extrabold text-[#111827] mb-6">Spécifications Techniques</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <BentoCard icon={<FaCalendarAlt size={20}/>} label="Année" value={car.year} />
                <BentoCard icon={<FaGasPump size={20}/>} label="Carburant" value={car.fuel} />
                <BentoCard icon={<FaCog size={20}/>} label="Boîte" value={car.gearbox} />
                <BentoCard icon={<FaUsers size={20}/>} label="Places" value="5 places" />
                <BentoCard icon={<FaDoorOpen size={20}/>} label="Portes" value="5 portes" />
                <BentoCard icon={<FaSuitcase size={20}/>} label="Coffre" value="2 valises" />
              </div>
            </div>

            {/* Inclus avec la location */}
            <div>
              <h3 className="text-xl font-extrabold text-[#111827] mb-6">Inclus avec la location</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {["Assurance tous risques", "Assistance routière 24/7", "Kilométrage illimité", "Véhicule désinfecté"].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-[#F0EBE3] text-[#C4A47C] flex items-center justify-center shrink-0">
                      <FaCheckCircle size={14} />
                    </div>
                    <span className="font-bold text-[#4B5563] text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {car.description && (
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-extrabold text-[#111827] mb-4">À propos de ce véhicule</h3>
                <p className="text-[#4B5563] leading-relaxed font-medium">{car.description}</p>
              </div>
            )}

            {/* Avis Clients Réels */}
            <div className="pt-12 border-t border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-extrabold text-[#111827]">
                  Avis Clients {car.numReviews > 0 ? `(${car.numReviews})` : ''}
                </h3>
                {car.numReviews > 0 && (
                  <div className="flex items-center gap-1.5 text-sm font-bold text-amber-500">
                    <FaStar />
                    <span className="text-[#111827] font-extrabold">{averageRating} / 5</span>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                
                {}
                <div className="space-y-6">
                  {car.reviews?.length > 0 ? (
                    car.reviews.map(review => (
                      <div key={review._id} className="pb-6 border-b border-gray-50 last:border-0">
                        <div className="flex gap-1 text-amber-400 mb-2">
                           {[1, 2, 3, 4, 5].map(i => <FaStar key={i} size={14} fill={i <= review.rating ? "currentColor" : "#f3f4f6"} />)}
                        </div>
                        <p className="font-bold text-[#111827] text-base mb-2">{review.name}</p>
                        <p className="text-[#4B5563] leading-relaxed text-sm">"{review.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#6B7280] bg-gray-50 p-6 rounded-2xl text-center font-medium border border-gray-100">Soyez le premier à donner votre avis.</p>
                  )}
                </div>

                {}
                <div>
                  {currentUser ? (
                    <div className="bg-gray-50 p-8 rounded-[24px] border border-gray-100">
                      <h4 className="text-lg font-extrabold text-[#111827] mb-6">Écrire un avis</h4>
                      <form onSubmit={submitReview} className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-4">Note Globale</label>
                          <div className="flex gap-3">
                            {[1, 2, 3, 4, 5].map(i => {
                              const active = (hoverRating || rating) >= i;
                              return (
                                <button 
                                  key={i} 
                                  type="button" 
                                  onClick={() => setRating(i)}
                                  onMouseEnter={() => setHoverRating(i)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  className={`p-3 rounded-2xl border transition-all duration-300 transform ${
                                    active 
                                      ? 'bg-white border-[#C4A47C] text-amber-400 scale-105 shadow-sm shadow-black/8' 
                                      : 'bg-white border-gray-200 text-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <FaStar size={20} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-3">Votre message</label>
                          <textarea 
                            required 
                            rows="4" 
                            value={comment} 
                            onChange={e => setComment(e.target.value)} 
                            className="w-full p-4 rounded-2xl border border-gray-200 outline-none text-[#111827] resize-none focus:border-[#C4A47C] focus:ring-4 focus:ring-[#F8F5F0] transition-all font-medium text-sm" 
                            placeholder="Racontez-nous votre expérience..."
                          ></textarea>
                        </div>
                        <button type="submit" className="w-full py-4 bg-[#111827] text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-black transition-all shadow-lg shadow-gray-200">
                          Publier l'avis
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-8 rounded-[24px] text-center border border-gray-100 flex flex-col justify-center h-full min-h-[200px]">
                      <p className="text-[#4B5563] font-bold mb-6">Connectez-vous pour partager votre expérience avec la communauté.</p>
                      <Link to="/login" className="inline-block px-8 py-3.5 bg-white border border-gray-200 hover:border-[#C4A47C] hover:text-[#C4A47C] text-[#111827] rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                        Se connecter
                      </Link>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

          <div className="lg:sticky lg:top-24 z-20" id="reservation-panel">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
               
              <div className="mb-8">
                <p className="text-[10px] text-[#6B7280] font-black uppercase tracking-widest mb-1">Prix Journalier</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-[#111827]">{Number(car.price || 0).toLocaleString('fr-FR')}</span>
                  <span className="text-sm font-bold text-[#6B7280] uppercase tracking-widest">DH / Jour</span>
                </div>
              </div>

              {/* Calculateur de Prix Dynamique Épuré */}
              <div className="mb-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl border border-gray-200 p-3.5 focus-within:border-[#C4A47C] focus-within:ring-4 focus-within:ring-[#F8F5F0] transition-all">
                    <label className="block text-[9px] text-[#9CA3AF] font-black uppercase tracking-widest mb-1">Date de Départ</label>
                    <input 
                      id="startDateInput"
                      type="date" 
                      value={startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="w-full bg-transparent text-[#111827] font-bold outline-none text-sm cursor-pointer"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-2xl border border-gray-200 p-3.5 focus-within:border-[#C4A47C] focus-within:ring-4 focus-within:ring-[#F8F5F0] transition-all">
                    <label className="block text-[9px] text-[#9CA3AF] font-black uppercase tracking-widest mb-1">Date de Retour</label>
                    <input 
                      type="date" 
                      value={endDate}
                      min={getMinEndDate()}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-transparent text-[#111827] font-bold outline-none text-sm cursor-pointer"
                    />
                  </div>
                </div>
                
                {/* Résultat Calcul */}
                <AnimatePresence>
                  {totalDays > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 pb-2 space-y-3">
                        <div className="flex justify-between items-center text-sm font-medium text-[#4B5563]">
                          <span>{Number(car.price || 0).toLocaleString('fr-FR')} DH x {totalDays} jour{totalDays > 1 ? 's' : ''}</span>
                          <span className="text-[#111827] font-bold">{Number(totalPrice || 0).toLocaleString('fr-FR')} DH</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium text-[#4B5563]">
                          <span>Frais de service</span>
                          <span className="text-emerald-600 font-bold">Inclus gratuit</span>
                        </div>
                        <div className="h-px bg-gray-200 my-4"></div>
                        <div className="flex justify-between items-end">
                          <span className="text-xs text-[#6B7280] font-black uppercase tracking-widest">Total</span>
                          <span className="text-2xl font-black text-[#111827]">{Number(totalPrice || 0).toLocaleString('fr-FR')} <span className="text-xs text-[#6B7280] uppercase tracking-widest">DH</span></span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link 
                to={startDate && endDate 
                  ? `/booking/${car._id || car.id}?startDate=${startDate}&endDate=${endDate}`
                  : `/booking/${car._id || car.id}`
                } 
                className={`flex items-center justify-center w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                  car.isAvailableNow !== false 
                    ? 'bg-[#111827] text-white hover:bg-black hover:-translate-y-0.5 shadow-lg shadow-gray-200/50'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {car.isAvailableNow !== false ? 'Confirmer la Réservation' : 'Véhicule Indisponible'}
              </Link>

              <a 
                href={`https://wa.me/212668898245?text=${encodeURIComponent(
                  `Bonjour LocaFès, je souhaite des renseignements pour louer la ${car.name} (${car.price} DH/jour)${startDate && endDate ? ` du ${startDate} au ${endDate}` : ''}. Est-elle disponible ?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2.5 w-full py-3.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all border border-emerald-100"
              >
                <FaWhatsapp size={16} /> Échanger sur WhatsApp
              </a>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-[#6B7280]">
                 <FaCheckCircle className="text-emerald-500" /> Sans frais cachés ni caution complexe
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Barre d'action fixe sur mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md px-6 py-3.5 border-t border-gray-200 flex items-center justify-between shadow-2xl">
        <div>
          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider line-clamp-1">{car.name}</p>
          <p className="text-lg font-black text-[#111827]">
            {car.price} <span className="text-xs font-bold text-[#C4A47C]">DH/j</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/212668898245?text=${encodeURIComponent(
              `Bonjour LocaFès, je souhaite des renseignements pour la ${car.name}. Est-elle disponible ?`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100"
            aria-label="Contacter sur WhatsApp"
          >
            <FaWhatsapp size={16} />
          </a>
          <Link
            to={startDate && endDate 
              ? `/booking/${car._id || car.id}?startDate=${startDate}&endDate=${endDate}`
              : `/booking/${car._id || car.id}`
            }
            className="px-5 py-3 bg-[#111827] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-black/10 hover:bg-[#C4A47C] transition-all"
          >
            Réserver
          </Link>
        </div>
      </div>

    </div>
  );
}


function BentoCard({ icon, label, value }) {
  return (
    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col justify-between group hover:bg-white hover:shadow-lg shadow-gray-100 transition-all cursor-default h-full min-h-[120px]">
      <div className="text-[#C4A47C] bg-[#F8F5F0] w-10 h-10 flex items-center justify-center rounded-xl mb-auto group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="mt-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-1">{label}</p>
        <p className="text-base font-extrabold text-[#111827]">{value}</p>
      </div>
    </div>
  );
}