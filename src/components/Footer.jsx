import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCar, FaTimes, 
  FaWhatsapp, FaPlane, FaHotel, FaChevronRight
} from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [activeModal, setActiveModal] = useState(null);

  const quickLinks = [
    { path: "/", label: "Accueil" },
    { path: "/cars", label: "Notre Flotte & Tarifs" },
    { path: "/why-choose-us", label: "Pourquoi LocaGawa" },
    { path: "/contact", label: "Contact & Devis" },
    { path: "/login", label: "Espace Client Privilège" }
  ];

  const legalContent = {
    privacy: {
      title: "Politique de Confidentialité",
      content: "LocaGawa s'engage à protéger la vie privée de ses clients. Les informations personnelles collectées (nom, téléphone, email, permis de conduire) sont strictement nécessaires à l'établissement du contrat de location et à la gestion de vos réservations. Vos données ne sont jamais cédées ou vendues à des tiers. Vous bénéficiez d'un droit d'accès, de rectification et de suppression de vos données personnelles sur simple demande à contact@locafes.ma."
    },
    terms: {
      title: "Conditions Générales de Location",
      content: "La location est ouverte aux conducteurs âgés d'au moins 21 ans et titulaires d'un permis de conduire valide depuis plus de 2 ans. Le carburant est à la charge du locataire (restitution avec le même niveau qu'au départ). Une caution bancaire ou empreinte est requise lors de la prise en charge du véhicule. L'assistance routière 24h/24 et l'assurance tous risques sont incluses selon les termes stipulés au contrat."
    },
    mentions: {
      title: "Mentions Légales",
      content: "LocaGawa SARL — Agence de location de véhicules de prestige à N’Djamena. Siège social : Avenue Charles de Gaulle, Centre-Ville, N’Djamena, Tchad. Tél : +235 22 00 00 00 — Email : contact@locafes.ma. RCCM TD-NDJ-XXXX — Patente N° 12457890 — IF N° 33458912 — ICE N° 002345891000042."
    }
  };

  return (
    <footer className="bg-[#0A2463] text-gray-400 border-t border-[#E3383C]/20 relative overflow-hidden font-sans">
      {/* Lueur d'ambiance feutrée or & nuit */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-32 bg-[#E3383C]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Liseré supérieur or prestige LocaGawa */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#E3383C]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 pt-20 pb-12 sm:pt-24 sm:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-12 xl:gap-16 pb-16 sm:pb-20">

          {/* Colonne 1 : Marque & Identité (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 text-2xl font-black text-white group">
              <div className="w-10 h-10 bg-[#E3383C]/15 border border-[#E3383C]/35 rounded-xl flex items-center justify-center group-hover:bg-[#E3383C] group-hover:text-white transition-all">
                <FaCar className="text-[#E3383C] group-hover:text-[#0A2463] transition-colors" size={16} />
              </div>
              <span className="tracking-tight">
                LOCA<span className="text-[#E3383C]">GAWA</span>
              </span>
            </Link>

            <p className="text-sm leading-7 text-gray-400/90 max-w-sm font-normal">
              L'art de voyager avec distinction à N’Djamena. Une flotte récente révisée en concession, un accueil personnalisé à l'Aéroport de N’Djamena et un service de conciergerie sur-mesure.
            </p>

            <div className="pt-2 text-xs text-gray-400 flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E3383C]" />
              <span>LocaGawa SARL • RCCM TD-NDJ-XXXX</span>
            </div>
          </div>

          {/* Colonne 2 : Navigation (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-[0.25em] mb-7 flex items-center gap-2">
              <span className="w-3 h-[1px] bg-[#E3383C]" />
              <span>Navigation</span>
            </h4>
            <ul className="space-y-4">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-white hover:translate-x-1.5 transition-all inline-flex items-center gap-2.5 group font-medium"
                  >
                    <FaChevronRight className="text-[#E3383C]/50 group-hover:text-[#E3383C] transition-colors text-[9px]" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 : Nos Points d'Accueil à N’Djamena (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-[0.25em] mb-7 flex items-center gap-2">
              <span className="w-3 h-[1px] bg-[#E3383C]" />
              <span>Points d'Accueil</span>
            </h4>
            <div className="space-y-6 text-sm">
              
              <div className="group">
                <div className="flex items-center gap-2.5 text-white font-semibold group-hover:text-[#E3383C] transition-colors">
                  <FaPlane className="text-[#E3383C] shrink-0" size={13} />
                  <span>Aéroport International de N’Djamena (NDJ)</span>
                </div>
                <p className="text-gray-400 text-xs pl-6 mt-1.5 leading-relaxed">
                  Terminal Arrivées • Accueil sur vol 24h/24
                </p>
              </div>

              <div className="group">
                <div className="flex items-center gap-2.5 text-white font-semibold group-hover:text-[#E3383C] transition-colors">
                  <FaMapMarkerAlt className="text-[#E3383C] shrink-0" size={13} />
                  <span>Agence Centre-Ville</span>
                </div>
                <p className="text-gray-400 text-xs pl-6 mt-1.5 leading-relaxed">
                  Avenue Charles de Gaulle • 08h00 – 21h00
                </p>
              </div>

              <div className="group">
                <div className="flex items-center gap-2.5 text-white font-semibold group-hover:text-[#E3383C] transition-colors">
                  <FaHotel className="text-[#E3383C] shrink-0" size={13} />
                  <span>Livraison Hôtels & Domiciles</span>
                </div>
                <p className="text-gray-400 text-xs pl-6 mt-1.5 leading-relaxed">
                  Tous quartiers de N’Djamena • Prise en charge gratuite
                </p>
              </div>

            </div>
          </div>

          {/* Colonne 4 : Contact Direct & Conciergerie (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-[0.25em] mb-7 flex items-center gap-2">
              <span className="w-3 h-[1px] bg-[#E3383C]" />
              <span>Contact Direct</span>
            </h4>
            <div className="space-y-5 text-sm">

              <a
                href="tel:+23522000000"
                className="flex items-center gap-3.5 text-gray-300 hover:text-[#E3383C] transition-colors group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#E3383C] group-hover:border-[#E3383C]/50 transition-colors shrink-0">
                  <FaPhoneAlt size={12} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Téléphone agence</p>
                  <p className="text-white font-bold group-hover:text-[#E3383C] transition-colors text-sm mt-0.5">+235 22 00 00 00</p>
                </div>
              </a>

              <a
                href="https://wa.me/23566000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 text-gray-300 hover:text-emerald-400 transition-colors group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/50 transition-colors shrink-0">
                  <FaWhatsapp size={15} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">WhatsApp 24/7</p>
                  <p className="text-white font-bold group-hover:text-emerald-400 transition-colors text-sm mt-0.5">+235 66 00 00 00</p>
                </div>
              </a>

              <a
                href="mailto:contact@locafes.ma"
                className="flex items-center gap-3.5 text-gray-300 hover:text-[#E3383C] transition-colors group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#E3383C] group-hover:border-[#E3383C]/50 transition-colors shrink-0">
                  <FaEnvelope size={12} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Email</p>
                  <p className="text-white font-bold truncate group-hover:text-[#E3383C] transition-colors text-sm mt-0.5">contact@locafes.ma</p>
                </div>
              </a>

            </div>
          </div>

        </div>

        <div className="border-t border-white/[0.08] pt-8 sm:pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-400">
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p className="font-medium text-gray-400">© {currentYear} LocaGawa SARL. Tous droits réservés.</p>
            <span className="hidden sm:inline text-gray-600">•</span>
            <p className="text-gray-400 text-xs">Location de voitures & conciergerie à N’Djamena</p>
          </div>

          {/* Liens légaux avec dégagement à droite pour ne pas être masqués par le WhatsApp flottant */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:pr-36">
            <button
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="hover:text-[#E3383C] transition-colors cursor-pointer font-medium"
            >
              Confidentialité
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('terms')}
              className="hover:text-[#E3383C] transition-colors cursor-pointer font-medium"
            >
              Conditions
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('mentions')}
              className="hover:text-[#E3383C] transition-colors cursor-pointer font-medium"
            >
              Mentions légales
            </button>
          </div>
        </div>

      </div>

      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0F2F75]/60 backdrop-blur-sm">
          <div className="bg-white text-slate-800 w-full max-w-lg rounded-3xl p-7 sm:p-8 shadow-2xl border border-slate-100 relative text-left">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Fermer"
              title="Fermer"
            >
              <FaTimes size={13} />
            </button>
            <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
              {legalContent[activeModal].title}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 font-normal">
              {legalContent[activeModal].content}
            </p>
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-6 py-3 bg-[#0F2F75] hover:bg-[#0A2463] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
