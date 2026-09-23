import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import CarCard from "../components/CarCard";
import SkeletonCard from "../components/SkeletonCard";
import { getCars } from "../services/carService";
import {
  FaClock, FaShieldAlt, FaStar, FaCar, FaMoneyBillWave,
  FaHeadset, FaArrowRight, FaCheckCircle, FaPhoneAlt,
  FaWhatsapp, FaMapMarkerAlt, FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

const HERO_CARS = [
  { src: "/images/hero-golf8.png",            name: "Volkswagen Golf 8",  year: 2023, price: 450, tag: "Berline Compacte" },
  { src: "/images/hero-evoque.png",           name: "Range Rover Evoque", year: 2023, price: 900, tag: "Prestige SUV" },
  { src: "/images/hero-mercedes.png",         name: "Mercedes Classe C",  year: 2023, price: 850, tag: "Berline Luxe" },
  { src: "/images/hero-qashqai.png",          name: "Nissan Qashqai",     year: 2023, price: 500, tag: "SUV Familial" },
  { src: "/images/hero-peugeot-208.png",      name: "Peugeot 208 GT",     year: 2021, price: 300, tag: "Citadine GT" },
];

const CAROUSEL_INTERVAL = 5000;

export default function Home() {
  const { currentUser, isAdmin } = useAuth();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await getCars({ limit: 6 });
        setCars(Array.isArray(data) ? data : (data.cars || []));
        setError(null);
      } catch (err) {
        console.error("Erreur chargement voitures", err);
        setError("Impossible de charger les véhicules. Veuillez réessayer plus tard.");
        toast.error("Erreur lors de la récupération du catalogue.");
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const featuredCars = cars.slice(0, 6);

  const topReviews = useMemo(() => {
    let allReviews = [];
    cars.forEach(car => {
      if (car.reviews && car.reviews.length > 0) {
        car.reviews.forEach(review => {
          allReviews.push({ ...review, carName: car.name });
        });
      }
    });
    if (allReviews.length > 0) {
      return allReviews
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
    }
    return [];
  }, [cars]);

  const features = [
    {
      icon: <FaShieldAlt size={24} />,
      title: "Assurance tous risques",
      desc: "Toutes nos voitures sont assurées tous risques et vérifiées avant chaque départ."
    },
    {
      icon: <FaClock size={24} />,
      title: "Disponible 7j/7",
      desc: "Remise des clés à l'aéroport ou en agence, y compris les jours fériés et week-ends."
    },
    {
      icon: <FaHeadset size={24} />,
      title: "Assistance directe",
      desc: "Une équipe joignable par téléphone ou WhatsApp pour toute situation en cours de trajet."
    },
    {
      icon: <FaMoneyBillWave size={24} />,
      title: "Tarifs clairs, sans surprise",
      desc: "Prix affiché = prix final. Kilométrage illimité inclus, aucun frais caché."
    },
  ];

  return (
    <div className="bg-white">
      <Helmet>
        <title>LocaFès | Location de Voitures à Fès — Simple et Sans Surprise</title>
        <meta name="description" content="Louez un véhicule récent à Fès avec LocaFès. Assurance incluse, kilométrage illimité, livraison à l'aéroport Fès-Saïss. Tarifs clairs, service 7j/7." />
        <meta property="og:title" content="LocaFès — Location de Voitures à Fès" />
        <meta property="og:description" content="Véhicules récents, assurance incluse, remise à l'aéroport. Réservez en ligne." />
      </Helmet>

      <section className="relative min-h-[100vh] bg-[#0F2F75] pt-20 overflow-hidden flex items-center">
        {/* Subtle warm radial glows — no lasers, no grids */}
        <div className="absolute top-[-10%] left-[-8%] w-[55%] h-[55%] bg-[#E3383C]/8 blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#8F1C20]/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 py-20 lg:py-12">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left — Copy */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="w-full lg:w-1/2 text-center lg:text-left"
            >
              <p className="text-[#E3383C] text-xs font-bold uppercase tracking-[0.25em] mb-5">
                Agence de location à Fès
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black mb-6 leading-[1.1] tracking-tight text-white">
                Location de Voitures<br />
                <span className="text-[#E3383C]">à Fès</span>, Simple et<br />
                Sans Surprise.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
                Véhicules récents et entretenus, assurance tous risques incluse,
                remise des clés rapide à l'aéroport Fès-Saïss ou en agence.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8">
                <Link
                  to="/cars"
                  className="px-8 py-4 bg-[#E3383C] text-white rounded-xl font-black text-sm hover:bg-[#F0585B] transition-all shadow-lg shadow-[#E3383C]/20 flex items-center gap-2.5 active:scale-95"
                >
                  Voir les véhicules
                  <FaArrowRight size={13} />
                </Link>
                <a
                  href="https://wa.me/212668898245"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-7 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2.5 backdrop-blur-sm"
                >
                  <FaWhatsapp className="text-emerald-400" size={17} />
                  WhatsApp
                </a>
              </div>

              {/* Authentic trust points */}
              <div className="flex flex-wrap items-center gap-5 justify-center lg:justify-start">
                {[
                  { icon: <FaCheckCircle className="text-emerald-400" size={13} />, label: "Kilométrage illimité" },
                  { icon: <FaMapMarkerAlt className="text-[#E3383C]" size={13} />, label: "Aéroport Fès-Saïss" },
                  { icon: <FaShieldAlt className="text-[#E3383C]" size={13} />, label: "Assurance incluse" },
                  { icon: <FaPhoneAlt className="text-slate-400" size={12} />, label: "Support 7j/7" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-400 text-sm">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — Car Carousel */}
            <HeroCarousel />
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100 py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {[
              { 
                icon: <FaCar size={18} />, 
                value: "25+", 
                label: "Véhicules récents", 
                desc: "Flotte de moins de 4 ans, révisée" 
              },
              { 
                icon: <FaCheckCircle size={18} />, 
                value: "100%", 
                label: "Kilométrage inclus", 
                desc: "Tarifs clairs, aucun frais caché" 
              },
              { 
                icon: <FaClock size={18} />, 
                value: "7j/7", 
                label: "Assistance Fès & Région", 
                desc: "Support téléphonique & WhatsApp continu" 
              },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4 py-4 sm:py-2 px-3 sm:px-8 sm:justify-center">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF3FB] text-[#E3383C] border border-[#D3E0F4]/60 flex items-center justify-center shrink-0 shadow-sm">
                  {stat.icon}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">{stat.value}</span>
                    <span className="text-xs font-bold text-[#111827]">{stat.label}</span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] font-medium mt-0.5">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-[#EEF3FB] text-[#E3383C] rounded-full font-bold text-[10px] uppercase tracking-widest mb-4 border border-[#D3E0F4]">
              Notre Sélection
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] mb-4 tracking-tight">
              Nos véhicules disponibles
            </h2>
            <p className="text-[#6B7280] font-medium max-w-lg mx-auto text-sm leading-relaxed">
              Des voitures de moins de 4 ans, révisées avant chaque location et livrées propres.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : error ? (
              <div className="col-span-full py-12 text-center">
                <p className="text-rose-500 font-bold mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2.5 bg-[#0F2F75] text-white rounded-xl font-bold hover:bg-[#E3383C] hover:text-white transition-colors"
                >
                  Réessayer
                </button>
              </div>
            ) : (
              featuredCars.map((car, idx) => (
                <motion.div
                  key={car._id || car.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <CarCard car={car} />
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/cars"
              className="inline-flex items-center gap-3 px-9 py-3.5 bg-[#EEF3FB] text-[#111827] border border-[#D3E0F4] rounded-xl font-bold text-sm hover:bg-[#0F2F75] hover:text-white hover:border-[#0F2F75] transition-all"
            >
              Voir tout le catalogue
              <FaArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F9FAFB] border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-[#EEF3FB] text-[#E3383C] rounded-full font-bold text-[10px] uppercase tracking-widest mb-4 border border-[#D3E0F4]">
              Nos engagements
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] mb-4 tracking-tight">
              Pourquoi choisir <span className="text-[#E3383C]">LocaFès</span> ?
            </h2>
            <p className="text-[#6B7280] font-medium max-w-xl mx-auto text-sm leading-relaxed">
              Une location transparente, sécurisée et adaptée à tous vos projets au Maroc.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="group bg-white p-7 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-400 border border-gray-100"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#EEF3FB] text-[#E3383C] rounded-xl mb-5 group-hover:bg-[#0F2F75] transition-colors duration-300 border border-[#D3E0F4] group-hover:border-transparent">
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-[#111827] mb-2 leading-snug">
                  {feature.title}
                </h3>
                <p className="text-[#6B7280] text-sm leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {topReviews.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-[#EEF3FB] text-[#E3383C] rounded-full font-bold text-[10px] uppercase tracking-widest mb-4 border border-[#D3E0F4]">
                Avis clients
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] mb-4 tracking-tight">
                Ce que disent nos <span className="text-[#E3383C]">clients</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topReviews.map((review, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-7 bg-[#F9FAFB] rounded-2xl border border-gray-100 text-left flex flex-col"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} size={13} className={i < review.rating ? "text-[#E3383C]" : "text-gray-200"} />
                    ))}
                  </div>
                  <p className="text-[#4B5563] font-medium leading-relaxed text-sm mb-6 italic flex-1">
                    "{review.comment}"
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-[#E3383C] to-[#C42A2E] rounded-full flex items-center justify-center font-bold text-white text-sm uppercase">
                      {review.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111827] text-sm">{review.name}</h4>
                      <p className="text-[10px] text-[#E3383C] font-bold uppercase tracking-widest">
                        Sur {review.carName}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-14 bg-gray-50/70 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:border-[#E3383C]/60 hover:shadow-md transition-all group">
              <div className="w-11 h-11 rounded-xl bg-[#EEF3FB] text-[#E3383C] border border-[#D3E0F4]/60 flex items-center justify-center shrink-0 group-hover:bg-[#0F2F75] group-hover:text-white transition-colors">
                <FaMapMarkerAlt size={16} />
              </div>
              <div>
                <h4 className="font-bold text-[#111827] text-sm mb-1">Agence & Aéroport Fès-Saïss</h4>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Boulevard Allal Ben Abdellah, Quartier Atlas & Terminal Saïss.
                </p>
                <Link to="/contact" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E3383C] hover:text-[#111827] transition-colors mt-2">
                  Plan d'accès <FaArrowRight size={8} />
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:border-[#E3383C]/60 hover:shadow-md transition-all group">
              <div className="w-11 h-11 rounded-xl bg-[#EEF3FB] text-[#E3383C] border border-[#D3E0F4]/60 flex items-center justify-center shrink-0 group-hover:bg-[#0F2F75] group-hover:text-white transition-colors">
                <FaClock size={16} />
              </div>
              <div>
                <h4 className="font-bold text-[#111827] text-sm mb-1">Permanence 7j/7</h4>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  08h00 – 21h00 en agence · Accueil 24h/24 à l'aéroport avec suivi des vols.
                </p>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Service disponible en continu
                </span>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:border-[#E3383C]/60 hover:shadow-md transition-all group">
              <div className="w-11 h-11 rounded-xl bg-[#EEF3FB] text-[#E3383C] border border-[#D3E0F4]/60 flex items-center justify-center shrink-0 group-hover:bg-[#0F2F75] group-hover:text-white transition-colors">
                <FaPhoneAlt size={14} />
              </div>
              <div>
                <h4 className="font-bold text-[#111827] text-sm mb-1">Contact & Réservations</h4>
                <div className="flex flex-col gap-0.5">
                  <a href="tel:+212535621020" className="text-xs text-[#111827] font-bold hover:text-[#E3383C] transition-colors">
                    Tél : 05 35 62 10 20
                  </a>
                  <a href="https://wa.me/212668898245" target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-700 font-bold hover:underline">
                    WhatsApp : +212 668 89 82 45
                  </a>
                </div>
                <Link to="/contact" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E3383C] hover:text-[#111827] transition-colors mt-2">
                  Écrire un message <FaArrowRight size={8} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-[#0F2F75] rounded-[32px] sm:rounded-[36px] px-8 py-14 sm:py-20 text-center relative overflow-hidden shadow-2xl border border-white/5">
            {/* Lueur subtile en arrière-plan */}
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#E3383C]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-white/5 rounded-full blur-[80px] pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10 max-w-2xl mx-auto"
            >
              <span className="inline-block px-4 py-1.5 bg-[#1A48A8] text-[#F0585B] rounded-full font-bold text-[10px] uppercase tracking-[0.2em] mb-6 border border-white/10">
                Prêt pour l'aventure ?
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-5 tracking-tight leading-tight">
                Votre voyage <span className="text-[#E3383C]">Premium</span> <br /> commence ici.
              </h2>
              <p className="text-gray-400 text-sm sm:text-base font-normal mb-10 max-w-xl mx-auto leading-relaxed">
                Rejoignez le cercle des clients privilégiés de LocaFès et profitez d'une expérience de conduite sans compromis.
              </p>

              <div className="flex flex-wrap gap-4 justify-center items-center">
                <Link
                  to="/cars"
                  className="px-8 py-3.5 bg-[#E3383C] text-white rounded-xl font-bold text-sm hover:bg-[#F0585B] transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <FaCar size={14} />
                  Réserver Immédiatement
                </Link>
                {currentUser ? (
                  <Link
                    to={isAdmin ? "/dashboard" : "/profile"}
                    className="px-8 py-3.5 bg-[#1A48A8] hover:bg-[#2358BD] text-white border border-white/10 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center gap-2"
                  >
                    {isAdmin ? "Tableau de bord" : "Mon profil"}
                    <FaArrowRight size={11} className="text-gray-400" />
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="px-8 py-3.5 bg-[#1A48A8] hover:bg-[#2358BD] text-white border border-white/10 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center gap-2"
                  >
                    Créer un compte
                    <FaArrowRight size={11} className="text-gray-400" />
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}


function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % HERO_CARS.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + HERO_CARS.length) % HERO_CARS.length);
  }, []);

  const goTo = (idx) => {
    if (idx === current) return;
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, CAROUSEL_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, next, current]);

  const car = HERO_CARS[current];

  // Silky smooth automotive slide variants (Spring physics + smooth crossfade)
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? "55%" : "-55%",
      opacity: 0,
      scale: 0.94,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 240, damping: 26 },
        opacity: { duration: 0.45, ease: "easeOut" },
        scale: { duration: 0.5, ease: "easeOut" },
      },
    },
    exit: (dir) => ({
      x: dir > 0 ? "-55%" : "55%",
      opacity: 0,
      scale: 0.94,
      transition: {
        x: { type: "spring", stiffness: 240, damping: 26 },
        opacity: { duration: 0.35, ease: "easeIn" },
        scale: { duration: 0.4, ease: "easeIn" },
      },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, x: 30 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
      className="w-full lg:w-1/2 relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Floating Info Badge with smooth text crossfade */}
      <div className="absolute -top-4 right-0 sm:right-3 z-30 pointer-events-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={car.name}
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="bg-[#0F2F75]/85 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/15 shadow-2xl flex flex-col items-end"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#E3383C]/20 text-[#F0585B] border border-[#E3383C]/30">
                {car.tag}
              </span>
              <span className="text-[10px] text-gray-400 font-semibold">{car.year}</span>
            </div>
            <p className="text-white font-black text-sm sm:text-base leading-tight tracking-tight">
              {car.name}
            </p>
            <p className="text-[#E3383C] text-xs sm:text-sm font-extrabold mt-0.5">
              {car.price} DH <span className="text-[10px] text-gray-400 font-normal">/ jour</span>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stage: fixed height, smooth overlapping slide (zero layout shift) */}
      <div className="relative w-full h-[280px] sm:h-[340px] md:h-[380px] flex items-center justify-center pt-4">
        
        {/* Navigation Arrow - Left */}
        <button
          type="button"
          onClick={prev}
          aria-label="Véhicule précédent"
          className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-[#E3383C] text-white hover:text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition-all duration-200 opacity-70 hover:opacity-100 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
        >
          <FaChevronLeft size={12} />
        </button>

        {/* Navigation Arrow - Right */}
        <button
          type="button"
          onClick={next}
          aria-label="Véhicule suivant"
          className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-[#E3383C] text-white hover:text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition-all duration-200 opacity-70 hover:opacity-100 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
        >
          <FaChevronRight size={12} />
        </button>

        {/* Carrousel véhicules */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center pointer-events-none px-4"
          >
            <motion.img
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              src={car.src}
              alt={car.name}
              className="max-h-[82%] max-w-[90%] sm:max-w-[85%] object-contain select-none drop-shadow-[0_28px_50px_rgba(0,0,0,0.75)] pointer-events-auto"
            />
          </motion.div>
        </AnimatePresence>

        {/* Realistic ground shadow with soft glow */}
        <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[72%] h-8 bg-black/50 blur-[28px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-[45%] h-6 bg-[#E3383C]/15 blur-[35px] rounded-full pointer-events-none" />
      </div>

      {/* Progress line + Dots */}
      <div className="relative mt-2 flex flex-col items-center gap-3 z-20">
        {/* Smooth CSS/GPU-driven progress line (zero interval re-renders) */}
        <div className="w-48 sm:w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            key={`${current}-${isPaused}`}
            initial={{ width: "0%" }}
            animate={{ width: isPaused ? "0%" : "100%" }}
            transition={{
              duration: isPaused ? 0 : CAROUSEL_INTERVAL / 1000,
              ease: "linear",
            }}
            className="h-full bg-gradient-to-r from-[#E3383C]/70 via-[#E3383C] to-[#F58A8C] rounded-full shadow-[0_0_8px_rgba(227, 56, 60,0.6)]"
          />
        </div>

        {/* Interactive dots */}
        <div className="flex items-center gap-2">
          {HERO_CARS.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Afficher ${c.name}`}
              className="py-2 px-0.5 group focus:outline-none transition-all cursor-pointer"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-7 h-1.5 bg-[#E3383C] shadow-[0_0_10px_rgba(227, 56, 60,0.8)]"
                    : "w-2 h-1.5 bg-white/20 group-hover:bg-white/50"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
