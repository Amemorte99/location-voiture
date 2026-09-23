import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaClock, FaShieldAlt, FaMoneyBillWave, FaHeadset, FaCar, FaStar, FaArrowRight, FaSearch, FaCalendarCheck, FaKey, FaChevronDown, FaQuestionCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from "react-helmet-async";

export default function WhyChooseUs() {
  const { currentUser } = useAuth();
  const [openFaq, setOpenFaq] = useState(0);
  const features = [
    { 
      icon: <FaShieldAlt size={32} />, 
      title: "Sécurité maximale", 
      desc: "Toutes nos voitures sont assurées tous risques et vérifiées régulièrement par nos experts avant chaque départ.",
      highlight: "Assurance tous risques"
    },
    { 
      icon: <FaClock size={32} />, 
      title: "Disponibilité 24/7", 
      desc: "Service continu jour et nuit. Réservez en ligne et récupérez votre véhicule à l'aéroport Fès-Saïss ou en agence dès votre arrivée.",
      highlight: "Service non-stop"
    },
    { 
      icon: <FaHeadset size={32} />, 
      title: "Support premium", 
      desc: "Une équipe professionnelle à votre écoute 24h/24. Assistance rapide et solutions personnalisées en cas d'urgence.",
      highlight: "Réponse < 30min"
    },
    { 
      icon: <FaMoneyBillWave size={32} />, 
      title: "Prix compétitifs", 
      desc: "Tarifs transparents et justes sans aucun frais caché. Paiement flexible et sécurisé adapté à votre budget.",
      highlight: "Zéro frais caché"
    },
    { 
      icon: <FaCar size={32} />, 
      title: "Voitures modernes", 
      desc: "Large choix de véhicules récents (moins de 3 ans) et bien entretenus. Citadines, Berlines et SUV haut de gamme.",
      highlight: "Flotte < 3 ans"
    },
    { 
      icon: <FaStar size={32} />, 
      title: "Expérience premium", 
      desc: "Qualité de service irréprochable, propreté garantie et confort absolu pour que chaque trajet soit un plaisir.",
      highlight: "Satisfaction garantie"
    }
  ];

  const stats = [
    { number: "20+", label: "Véhicules Récents", icon: <FaCar size={22} /> },
    { number: "100%", label: "Kilométrage Illimité", icon: <FaCheckCircle size={22} /> },
    { number: "24/7", label: "Assistance Régionale", icon: <FaHeadset size={22} /> }
  ];

  const steps = [
    {
      step: "01",
      icon: <FaSearch size={28} />,
      title: "Explorez & Choisissez",
      desc: "Parcourez notre flotte et trouvez le véhicule idéal pour vos trajets (citadine, berline ou SUV)."
    },
    {
      step: "02",
      icon: <FaCalendarCheck size={28} />,
      title: "Réservez en ligne",
      desc: "Sélectionnez vos dates, remplissez le formulaire et confirmez en quelques clics. Paiement flexible."
    },
    {
      step: "03",
      icon: <FaKey size={28} />,
      title: "Prenez la route",
      desc: "Récupérez votre véhicule prêt à partir. Profitez de la route en toute sérénité avec LocaFès."
    }
  ];

  const faqs = [
    {
      q: "Comment fonctionne la caution / dépôt de garantie ?",
      a: "Chez LocaFès, la caution s'effectue par simple pré-autorisation sur carte bancaire (le montant n'est pas débité de votre compte) ou par chèque / espèces selon votre convenance. Elle vous est immédiatement débloquée lors de la restitution du véhicule après état des lieux."
    },
    {
      q: "Quels sont les modes de règlement acceptés ?",
      a: "Vous pouvez régler directement lors de la prise en charge en espèces (Dirhams ou Euros) ou par carte bancaire. Aucune avance ni carte bancaire n'est exigée lors de votre pré-réservation en ligne."
    },
    {
      q: "Comment se déroule la prise en charge à l'aéroport Fès-Saïss ?",
      a: "Un agent LocaFès vous attend personnellement dans le hall des arrivées avec une pancarte à votre nom dès l'atterrissage. Le contrat est finalisé sur place en 5 minutes et la voiture vous est remise sur le parking de l'aéroport, sans file d'attente à un guichet."
    },
    {
      q: "Quels sont les documents obligatoires lors de la remise des clés ?",
      a: "Vous devez simplement présenter l'original de votre permis de conduire (valable depuis plus de 2 ans) ainsi qu'un passeport en cours de validité (pour les touristes et MRE) ou une pièce d'identité / CIN (pour les résidents marocains)."
    },
    {
      q: "Le kilométrage est-il réellement illimité ?",
      a: "Oui, à 100%. Tous nos contrats incluent le kilométrage illimité sur l'ensemble du territoire marocain. Vous pouvez explorer Fès, Meknès, Chefchaouen ou le sud sans aucun supplément kilométrique."
    },
    {
      q: "Que se passe-t-il en cas d'imprévu mécanique ou de crevaison ?",
      a: "Notre service d'assistance routière intervient 24h/24 et 7j/7 partout au Maroc. En cas d'immobilisation, nous dépêchons un technicien ou mettons à disposition un véhicule de remplacement dans les meilleurs délais."
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 bg-white">
      <Helmet>
        <title>Pourquoi LocaFès | Location Premium à Fès</title>
        <meta name="description" content="Découvrez pourquoi LocaFès est le choix #1 pour la location de voitures à Fès. Sécurité, transparence, flotte moderne et support 24/7." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6">

        {}
        <div className="text-center mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-5 py-2 bg-[#EEF3FB] text-[#E3383C] rounded-full font-extrabold text-[10px] uppercase tracking-[0.3em] mb-4 border border-[#D3E0F4] shadow-sm"
          >
            L'Excellence LocaFès
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-[#111827] mb-8 tracking-tight"
          >
            Pourquoi nous <span className="text-[#E3383C]">faire confiance</span> ?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[#6B7280] max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Nous redéfinissons les standards de la location automobile au Maroc 
            avec un engagement total sur la sécurité, le confort et la transparence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-28">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative bg-[#F9FAFB] rounded-[32px] p-8 text-center border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden group"
            >
              {/* Subtle decorative circle */}
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#E3383C]/5 group-hover:scale-150 transition-transform duration-500" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#0F2F75] text-[#E3383C] rounded-2xl mb-5 shadow-lg shadow-black/10 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <h3 className="text-4xl font-black text-[#111827] mb-2 tracking-tight">{stat.number}</h3>
                <p className="text-[10px] text-[#6B7280] font-extrabold uppercase tracking-widest">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mb-32">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#EEF3FB] text-[#E3383C] rounded-full font-bold text-[10px] uppercase tracking-[0.2em] mb-4 border border-[#D3E0F4]">
              Nos Engagements
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#111827] tracking-tight">
              Ce qui nous rend <span className="text-[#E3383C]">différents</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="group relative bg-white p-10 rounded-[36px] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-2 overflow-hidden"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#E3383C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#EEF3FB] text-[#E3383C] rounded-2xl mb-8 group-hover:bg-[#0F2F75] group-hover:text-[#E3383C] group-hover:scale-110 transition-all duration-500 border border-[#D3E0F4] group-hover:border-transparent shadow-sm">
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-extrabold text-[#111827] mb-3 group-hover:text-[#E3383C] transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#6B7280] leading-relaxed font-medium text-sm mb-6">
                    {feature.desc}
                  </p>

                  {/* Highlight badge */}
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-500 shrink-0" size={14} />
                    <span className="text-[10px] font-black text-[#111827] uppercase tracking-widest">
                      {feature.highlight}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mb-32">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#EEF3FB] text-[#E3383C] rounded-full font-bold text-[10px] uppercase tracking-[0.2em] mb-4 border border-[#D3E0F4]">
              Simple & Rapide
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#111827] tracking-tight">
              Comment ça <span className="text-[#E3383C]">marche</span> ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-[72px] left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-[#D3E0F4] via-[#E3383C] to-[#D3E0F4]" />

            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative text-center group"
              >
                {/* Step number circle */}
                <div className="relative inline-flex items-center justify-center w-[88px] h-[88px] bg-white rounded-full border-2 border-[#D3E0F4] group-hover:border-[#E3383C] shadow-lg shadow-gray-100/50 mb-8 transition-all duration-500 group-hover:shadow-xl z-10">
                  <div className="w-16 h-16 bg-[#0F2F75] rounded-full flex items-center justify-center text-[#E3383C] group-hover:bg-[#E3383C] group-hover:text-white transition-all duration-500">
                    {step.icon}
                  </div>
                  {/* Step badge */}
                  <span className="absolute -top-1 -right-1 w-7 h-7 bg-[#E3383C] text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-md">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-[#111827] mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-[#6B7280] font-medium leading-relaxed max-w-xs mx-auto">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mb-32 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-5 py-2 bg-[#EEF3FB] text-[#E3383C] rounded-full font-extrabold text-[10px] uppercase tracking-[0.3em] mb-4 border border-[#D3E0F4]">
              Questions Fréquentes
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-[#111827] tracking-tight">
              Tout ce que vous devez <span className="text-[#E3383C]">savoir</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className={`rounded-[24px] border transition-all duration-300 overflow-hidden ${
                    isOpen ? 'bg-[#EEF3FB]/60 border-[#E3383C]/40 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base text-[#111827] cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <FaQuestionCircle className={isOpen ? 'text-[#E3383C]' : 'text-gray-300'} size={18} />
                      {faq.q}
                    </span>
                    <FaChevronDown 
                      className={`text-[#6B7280] transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-[#E3383C]' : ''}`} 
                      size={14} 
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-1 text-sm text-[#4B5563] leading-relaxed font-medium pl-14">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-12 md:p-20 bg-[#0F2F75] rounded-[48px] text-center relative overflow-hidden"
        >
          {/* Decorative warm glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E3383C]/8 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#8F1C20]/6 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px] pointer-events-none" />
          

          
          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-[#E3383C]/10 text-[#F0585B] rounded-full font-bold text-[10px] uppercase tracking-[0.2em] mb-8 border border-[#E3383C]/20">
              Prêt à rouler ?
            </span>
            <h3 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight">
              L'excellence à portée <br className="hidden md:block" /> de main.
            </h3>
            <p className="text-white/50 text-lg md:text-xl font-medium mb-12 max-w-xl mx-auto">
              Ne nous croyez pas sur parole. Vivez l'expérience LocaFès Premium 
              dès aujourd'hui à des tarifs imbattables.
            </p>
            <div className="flex flex-wrap gap-5 justify-center">
              <Link 
                to="/cars" 
                className="px-10 py-5 bg-[#E3383C] text-white rounded-2xl font-black text-lg hover:bg-[#F0585B] hover:shadow-2xl hover:shadow-[#E3383C]/20 hover:scale-105 transition-all flex items-center gap-3"
              >
                <FaCar />
                Voir nos voitures
              </Link>
              {currentUser ? (
                <Link 
                  to="/cars" 
                  className="px-10 py-5 bg-white/5 backdrop-blur-md text-white border border-white/10 rounded-2xl font-bold text-lg hover:bg-white hover:text-[#111827] transition-all flex items-center gap-3"
                >
                  Voir les Voitures
                  <FaArrowRight size={14} />
                </Link>
              ) : (
                <Link 
                  to="/login" 
                  className="px-10 py-5 bg-white/5 backdrop-blur-md text-white border border-white/10 rounded-2xl font-bold text-lg hover:bg-white hover:text-[#111827] transition-all flex items-center gap-3"
                >
                  Connexion
                  <FaArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
