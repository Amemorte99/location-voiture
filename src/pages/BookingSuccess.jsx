import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaCheckCircle, FaHome, FaList, FaDownload, FaMapMarkerAlt, FaIdCard, FaClock, FaWhatsapp, FaCar, FaCalendarAlt } from 'react-icons/fa';
import { generateInvoicePDF } from '../utils/generatePDF';
import { getCarById } from '../services/carService';

export default function BookingSuccess() {
  const location = useLocation();
  const [car, setCar] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const bookingId = searchParams.get('bookingId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const totalPrice = searchParams.get('totalPrice');
  const fullName = searchParams.get('fullName');
  const phone = searchParams.get('phone');
  const pickupLocation = searchParams.get('pickupLocation') || 'Aéroport de N’Djamena (Terminal Arrivées)';

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const carId = params.get('carId');
    if (carId) {
      getCarById(carId)
        .then(setCar)
        .catch((err) => console.error("Erreur chargement voiture", err));
    }
  }, [location.search]);

  const handleDownload = () => {
    const bookingForPdf = {
      _id: bookingId || 'CONFIRMED',
      startDate: startDate || new Date(),
      endDate: endDate || new Date(),
      totalPrice: totalPrice || 0,
      fullName: fullName,
      phone: phone,
      pickupLocation: pickupLocation,
      car: car ? { name: car.name, price: car.price } : { name: 'Véhicule', price: 0 }
    };
    generateInvoicePDF(bookingForPdf, false);
  };

  const refCode = bookingId ? `LF-${bookingId.slice(-6).toUpperCase()}` : 'LF-WEB';
  const waMsg = `Bonjour LocaGawa, je viens de finaliser ma réservation pour ${car?.name || 'mon véhicule'} du ${startDate || ''} au ${endDate || ''}. Prise en charge : ${pickupLocation}. Réf : ${refCode}. Pouvez-vous me confirmer la bonne prise en compte ?`;
  const waUrl = `https://wa.me/23566000000?text=${encodeURIComponent(waMsg)}`;

  return (
    <>
    <Helmet><title>Réservation Confirmée | LocaGawa</title></Helmet>
    <div className="min-h-screen flex items-center justify-center px-6 py-24 bg-[#F9FAFB]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl z-10">
        <div className="bg-white rounded-[40px] p-8 md:p-14 text-center border border-gray-100 shadow-xl shadow-gray-200/50">
          
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 text-emerald-600">
            <FaCheckCircle size={38} />
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#111827] mb-3">
            Réservation <span className="text-emerald-600">Enregistrée</span>
          </h1>

          <p className="text-sm text-[#6B7280] max-w-md mx-auto mb-8 font-medium leading-relaxed">
            Votre dossier est validé sous la référence <span className="font-extrabold text-[#111827]">{refCode}</span>. Notre équipe prépare votre véhicule à N’Djamena.
          </p>

          {/* Récapitulatif Prise en charge */}
          <div className="bg-[#EEF3FB] rounded-2xl p-5 border border-[#D3E0F4] text-left mb-8 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#111827]">
              <span className="flex items-center gap-2">
                <FaCar className="text-[#E3383C]" />
                {car?.name || 'Véhicule sélectionné'}
              </span>
              <span className="text-sm font-black text-[#E3383C]">{Number(totalPrice || 0).toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280] pt-1">
              <FaMapMarkerAlt className="text-[#E3383C] shrink-0" size={13} />
              <span>{pickupLocation}</span>
            </div>
            {startDate && endDate && (
              <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280]">
                <FaCalendarAlt className="text-[#E3383C] shrink-0" size={12} />
                <span>Du {startDate} au {endDate}</span>
              </div>
            )}
          </div>

          {/* Checklist Conducteur */}
          <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-gray-100 text-left mb-8 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#111827]">
              Documents à présenter lors de la remise des clés :
            </h4>
            <div className="grid sm:grid-cols-2 gap-3 text-xs font-semibold text-[#4B5563]">
              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-gray-100">
                <FaIdCard className="text-[#E3383C]" size={14} />
                <span>Permis de conduire valide (2 ans min.)</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-gray-100">
                <FaIdCard className="text-[#E3383C]" size={14} />
                <span>Pièce d'identité ou passeport</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-gray-100">
                <FaMapMarkerAlt className="text-[#E3383C]" size={14} />
                <span>Remise sur le lieu convenu</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-gray-100">
                <FaClock className="text-[#E3383C]" size={14} />
                <span>Assistance technique 7j/7</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 mb-8">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
            >
              <FaWhatsapp size={16} /> Transmettre ma réservation sur WhatsApp
            </a>

            <div className="grid sm:grid-cols-2 gap-3">
              <button 
                onClick={handleDownload}
                className="px-6 py-3.5 bg-[#0F2F75] text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#E3383C] transition-all"
              >
                <FaDownload size={13} /> Facture PDF
              </button>
              <Link 
                to="/profile" 
                className="px-6 py-3.5 bg-gray-50 text-[#111827] border border-gray-200 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-all"
              >
                <FaList size={13} /> Mes réservations
              </Link>
            </div>
          </div>

          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#6B7280] hover:text-[#111827] transition-colors">
            <FaHome size={14} /> Retour à l'accueil
          </Link>

        </div>
      </motion.div>
    </div>
    </>
  );
}
