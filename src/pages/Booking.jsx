import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import { resolveImageUrl } from "../utils/imageUrl";
import { differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../contexts/AuthContext';
import { getCarById } from "../services/carService";
import { createBooking, createPaymentIntent } from "../services/bookingService";
import { FaCalendarAlt, FaCreditCard, FaMoneyBillWave, FaUser, FaCar, FaPhone, FaArrowLeft, FaInfoCircle, FaArrowRight, FaMapMarkerAlt, FaPlane, FaCheckCircle, FaClock, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../components/StripePaymentForm';

const DEFAULT_STRIPE_PUBLIC_KEY = 'pk_test_51TMYoLDanD70ZyTenwDYse1sg87hHlX5zLUnTNwSlXlrcIlU2t2WUleoW66aseOyhK7n1HhHJ8kgB3TNv89mwsp700vYWPUnI1';
const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY || DEFAULT_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialStartDate = queryParams.get('startDate') || '';
  const initialEndDate = queryParams.get('endDate') || '';

  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    startDate: initialStartDate,
    endDate: initialEndDate
  });

  const [pickupLocation, setPickupLocation] = useState('Aéroport Fès-Saïss (Terminal Arrivées)');
  const [pickupTime, setPickupTime] = useState('12:00');
  const [flightNumber, setFlightNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [babySeat, setBabySeat] = useState(false);
  const [additionalDriver, setAdditionalDriver] = useState(false);

  const [payment, setPayment] = useState('cash');
  const [total, setTotal] = useState(0);
  const [days, setDays] = useState(0);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || currentUser.name || '',
        phone: prev.phone || currentUser.phone || '',
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const data = await getCarById(id);
        setCar(data);
      } catch (err) {
        toast.error("Erreur chargement véhicule");
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  useEffect(() => {
    if (formData.startDate && formData.endDate && car) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end > start) {
        const diff = differenceInDays(end, start) || 1;
        setDays(diff);
        const optionsExtra = babySeat ? diff * 30 : 0;
        setTotal(diff * car.price + optionsExtra);
      } else {
        setDays(0);
        setTotal(0);
      }
    } else {
      setDays(0);
      setTotal(0);
    }
  }, [formData.startDate, formData.endDate, car, babySeat]);

  const handleStartDateChange = (val) => {
    setFormData(prev => {
      const isEndInvalid = prev.endDate && new Date(prev.endDate) <= new Date(val);
      return {
        ...prev,
        startDate: val,
        endDate: isEndInvalid ? '' : prev.endDate
      };
    });
  };

  const getMinEndDate = () => {
    if (!formData.startDate) return new Date().toISOString().split('T')[0];
    const nextDay = new Date(formData.startDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.fullName?.trim() || !formData.phone?.trim()) {
        toast.error("Veuillez renseigner votre nom et votre numéro de téléphone");
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.startDate || !formData.endDate) {
        toast.error("Veuillez sélectionner vos dates de location");
        return;
      }
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        toast.error("La date de restitution doit être strictement postérieure à la prise en charge");
        return;
      }
      if (days <= 0) {
        toast.error("Période de location invalide");
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleOpenConfirm = async () => {
    if (days <= 0 || new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error("La date de fin doit être strictement après la date de début");
      return;
    }

    if (payment === 'card') {
      try {
        setSubmitting(true);
        const optionsExtra = babySeat ? days * 30 : 0;
        const response = await createPaymentIntent({
          carId: car._id || car.id,
          startDate: formData.startDate,
          endDate: formData.endDate,
          fullName: formData.fullName,
          phone: formData.phone,
          optionsPrice: optionsExtra,
          pickupLocation,
          pickupTime,
          flightNumber,
          deliveryAddress,
          deliveryNotes,
        });
        setClientSecret(response.clientSecret);
        setShowConfirmModal(true);
      } catch (err) {
        toast.error(err.response?.data?.message || "Erreur Stripe. Vérifiez votre configuration.");
      } finally {
        setSubmitting(false);
      }
    } else {
      setShowConfirmModal(true);
    }
  };

  const finalConfirm = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    try {
      const createdBooking = await createBooking({
        car: car._id || car.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalPrice: total,
        totalDays: days,
        fullName: formData.fullName,
        paymentMethod: 'cash',
        phone: formData.phone,
        pickupLocation,
        pickupTime,
        flightNumber,
        deliveryAddress,
        deliveryNotes,
        babySeat,
      });
      toast.success("Réservation effectuée avec succès !");
      const params = new URLSearchParams({
        bookingId: createdBooking?._id || '',
        carId: car._id || car.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalPrice: total,
        fullName: formData.fullName,
        phone: formData.phone,
        pickupLocation,
        pickupTime,
        flightNumber,
        deliveryAddress,
      });
      navigate(`/booking-success?${params.toString()}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la réservation");
    } finally {
      setSubmitting(false);
    }
  };

  const onStripeSuccess = async () => {
    setShowConfirmModal(false);
    try {
      const createdBooking = await createBooking({
        car: car._id || car.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalPrice: total,
        totalDays: days,
        fullName: formData.fullName,
        paymentMethod: 'card', 
        phone: formData.phone,
        pickupLocation,
        pickupTime,
        flightNumber,
        deliveryAddress,
        deliveryNotes,
        babySeat,
      });
      toast.success("Paiement validé ! Réservation enregistrée avec succès.");
      
      const params = new URLSearchParams({
        bookingId: createdBooking?._id || '',
        carId: car._id || car.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalPrice: total,
        fullName: formData.fullName,
        phone: formData.phone,
        pickupLocation,
        pickupTime,
        flightNumber,
        deliveryAddress,
      });
      navigate(`/booking-success?${params.toString()}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement de la réservation");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-16 h-16 border-4 border-[#EEF3FB] border-t-[#E3383C] rounded-full animate-spin"></div>
    </div>
  );


  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#F9FAFB]">
      <div className="max-w-6xl mx-auto px-6">

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#6B7280] hover:text-[#E3383C] font-bold mb-10 transition-colors">
          <FaArrowLeft /> Retour
        </button>

        <div className="grid lg:grid-cols-3 gap-10">

          {/* Colonne de gauche : Formulaire par étapes */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100"
            >
              {}
              <div className="mb-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#EEF3FB] rounded-2xl flex items-center justify-center">
                    <FaCar className="text-[#E3383C]" size={28} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold text-[#111827]">Réservation Directe</h1>
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em]">{car.name}</p>
                  </div>
                </div>

                {}
                <div className="relative pt-4">
                  <div className="flex justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${currentStep >= 1 ? 'text-[#E3383C]' : 'text-gray-400'}`}>1. Conducteur</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${currentStep >= 2 ? 'text-[#E3383C]' : 'text-gray-400'}`}>2. Période</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${currentStep >= 3 ? 'text-[#E3383C]' : 'text-gray-400'}`}>3. Paiement</span>
                  </div>
                  <div className="h-2 w-full bg-[#EEF3FB] rounded-full overflow-hidden flex">
                    <motion.div
                      className="h-full bg-[#0F2F75]"
                      initial={{ width: "33%" }}
                      animate={{ width: `${(currentStep / 3) * 100}%` }}
                      transition={{ type: "spring", stiffness: 100 }}
                    ></motion.div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">

                {}
                {currentStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <h3 className="text-sm font-extrabold text-[#111827] uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#0F2F75] rounded-full"></div>
                      Informations Conducteur & Prise en Charge
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="relative">
                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                          type="text"
                          placeholder="Nom complet"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 bg-[#F9FAFB] border border-gray-100 rounded-2xl focus:bg-white focus:border-[#E3383C] outline-none transition-all font-medium text-sm"
                          required
                        />
                      </div>
                      <div className="relative">
                        <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                          type="tel"
                          placeholder="Numéro de téléphone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 bg-[#F9FAFB] border border-gray-100 rounded-2xl focus:bg-white focus:border-[#E3383C] outline-none transition-all font-medium text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest ml-1">
                        Lieu de prise en charge
                      </label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E3383C]" />
                        <select
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          className="w-full pl-12 pr-8 py-4 bg-[#F9FAFB] border border-gray-100 rounded-2xl focus:bg-white focus:border-[#E3383C] outline-none transition-all font-bold text-sm text-[#111827] appearance-none cursor-pointer"
                        >
                          <option value="Aéroport Fès-Saïss (Terminal Arrivées)">Aéroport Fès-Saïss (Terminal Arrivées)</option>
                          <option value="Livraison Hôtel ou Riad (Fès Médina & Ville)">Livraison Hôtel ou Riad (Fès Médina & Ville)</option>
                          <option value="Agence Quartier Atlas (Bd Allal Ben Abdellah)">Agence Quartier Atlas (Bd Allal Ben Abdellah)</option>
                          <option value="Gare Ferroviaire Fès-Ville">Gare Ferroviaire Fès-Ville</option>
                        </select>
                      </div>

                      {/* Champs dynamiques selon le lieu */}
                      {pickupLocation.includes('Aéroport') && (
                        <div className="grid sm:grid-cols-2 gap-3 pt-1">
                          <div className="relative">
                            <FaPlane className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                            <input
                              type="text"
                              placeholder="Numéro de vol (ex: AT 421 / FR 1234)"
                              value={flightNumber}
                              onChange={(e) => setFlightNumber(e.target.value)}
                              className="w-full pl-11 pr-4 py-3.5 bg-[#F9FAFB] border border-gray-100 rounded-xl focus:bg-white focus:border-[#E3383C] outline-none transition-all text-xs font-semibold text-[#111827]"
                            />
                          </div>
                          <div className="relative">
                            <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                            <input
                              type="time"
                              value={pickupTime}
                              onChange={(e) => setPickupTime(e.target.value)}
                              className="w-full pl-11 pr-4 py-3.5 bg-[#F9FAFB] border border-gray-100 rounded-xl focus:bg-white focus:border-[#E3383C] outline-none transition-all text-xs font-semibold text-[#111827]"
                              title="Heure d'atterrissage / de rendez-vous"
                            />
                          </div>
                        </div>
                      )}

                      {(pickupLocation.includes('Hôtel') || pickupLocation.includes('Riad')) && (
                        <div className="grid sm:grid-cols-3 gap-3 pt-1">
                          <div className="sm:col-span-2 relative">
                            <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                            <input
                              type="text"
                              placeholder="Nom de l'hôtel, Riad ou adresse précise"
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              className="w-full pl-11 pr-4 py-3.5 bg-[#F9FAFB] border border-gray-100 rounded-xl focus:bg-white focus:border-[#E3383C] outline-none transition-all text-xs font-semibold text-[#111827]"
                            />
                          </div>
                          <div className="relative">
                            <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                            <input
                              type="time"
                              value={pickupTime}
                              onChange={(e) => setPickupTime(e.target.value)}
                              className="w-full pl-11 pr-4 py-3.5 bg-[#F9FAFB] border border-gray-100 rounded-xl focus:bg-white focus:border-[#E3383C] outline-none transition-all text-xs font-semibold text-[#111827]"
                              title="Heure de livraison"
                            />
                          </div>
                        </div>
                      )}

                      {(!pickupLocation.includes('Aéroport') && !pickupLocation.includes('Hôtel') && !pickupLocation.includes('Riad')) && (
                        <div className="relative pt-1 max-w-xs">
                          <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                          <input
                            type="time"
                            value={pickupTime}
                            onChange={(e) => setPickupTime(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-[#F9FAFB] border border-gray-100 rounded-xl focus:bg-white focus:border-[#E3383C] outline-none transition-all text-xs font-semibold text-[#111827]"
                            title="Heure de passage"
                          />
                        </div>
                      )}

                      {/* Instructions pour le livreur */}
                      <div className="pt-1">
                        <input
                          type="text"
                          placeholder="Instructions pour le chauffeur (ex: pancarte avec nom, vol avec retard, etc.)"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-100 rounded-xl focus:bg-white focus:border-[#E3383C] outline-none transition-all text-xs text-gray-700 font-medium placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {}
                {currentStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <h3 className="text-sm font-extrabold text-[#111827] uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#0F2F75] rounded-full"></div>
                      Période & Options de Location
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-2 ml-4">Prise en charge</label>
                        <div className="relative">
                          <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                          <input
                            type="date"
                            value={formData.startDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-[#F9FAFB] border border-gray-100 rounded-2xl focus:bg-white focus:border-[#E3383C] outline-none transition-all font-medium text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-2 ml-4">Restitution</label>
                        <div className="relative">
                          <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                          <input
                            type="date"
                            value={formData.endDate}
                            min={getMinEndDate()}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-[#F9FAFB] border border-gray-100 rounded-2xl focus:bg-white focus:border-[#E3383C] outline-none transition-all font-medium text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#111827]">
                        Options & Services Inclus
                      </h4>
                      <div className="space-y-2.5">
                        <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                          babySeat ? 'bg-[#EEF3FB] border-[#E3383C]' : 'bg-[#F9FAFB] border-gray-100 hover:border-gray-200'
                        }`}>
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              checked={babySeat} 
                              onChange={(e) => setBabySeat(e.target.checked)} 
                              className="w-4 h-4 rounded text-[#111827] accent-[#111827]"
                            />
                            <div>
                              <p className="text-xs font-bold text-[#111827]">Siège bébé / enfant homologué</p>
                              <p className="text-[10px] text-[#6B7280]">Confort et sécurité de 0 à 4 ans</p>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-[#111827]">+30 DH / jour</span>
                        </label>

                        <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                          additionalDriver ? 'bg-[#EEF3FB] border-[#E3383C]' : 'bg-[#F9FAFB] border-gray-100 hover:border-gray-200'
                        }`}>
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              checked={additionalDriver} 
                              onChange={(e) => setAdditionalDriver(e.target.checked)} 
                              className="w-4 h-4 rounded text-[#111827] accent-[#111827]"
                            />
                            <div>
                              <p className="text-xs font-bold text-[#111827]">Conducteur additionnel</p>
                              <p className="text-[10px] text-[#6B7280]">Permet d'alterner au volant sur la route</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Offert</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-bold text-[#6B7280] pt-2">
                        <FaCheckCircle className="text-emerald-500 shrink-0" size={13} />
                        <span>Kilométrage illimité et assistance technique 24h/24 inclus sur tout le Maroc</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {}
                {currentStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <h3 className="text-sm font-extrabold text-[#111827] uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#0F2F75] rounded-full"></div>
                      Méthode de Paiement
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {}
                      <button
                        type="button"
                        onClick={() => setPayment('cash')}
                        className={`relative flex flex-col items-start gap-3 p-6 border-2 rounded-[20px] cursor-pointer transition-all text-left ${
                          payment === 'cash'
                            ? 'border-emerald-500 bg-emerald-50/80 shadow-lg shadow-emerald-500/10'
                            : 'border-gray-100 bg-[#F9FAFB] hover:border-gray-200'
                        }`}
                      >
                        {payment === 'cash' && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentWidth" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                        <div className={`p-3 rounded-2xl ${payment === 'cash' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                          <FaMoneyBillWave className={`text-xl ${payment === 'cash' ? 'text-emerald-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className={`font-black text-sm mb-1 ${payment === 'cash' ? 'text-emerald-700' : 'text-[#111827]'}`}>Paiement sur place</p>
                          <p className={`text-[11px] font-medium ${payment === 'cash' ? 'text-emerald-600' : 'text-[#6B7280]'}`}>Espèces à la remise des clés</p>
                        </div>
                      </button>

                      {/* Carte Bancaire */}
                      <button
                        type="button"
                        onClick={() => setPayment('card')}
                        className={`relative flex flex-col items-start gap-3 p-5 border-2 rounded-xl cursor-pointer transition-all text-left ${
                          payment === 'card'
                            ? 'border-[#E3383C] bg-[#EEF3FB] shadow-sm'
                            : 'border-gray-200 bg-[#F9FAFB] hover:border-gray-300'
                        }`}
                      >
                        {payment === 'card' && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-[#0F2F75] rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                        <div className={`p-3 rounded-xl ${payment === 'card' ? 'bg-[#E3EBF8]' : 'bg-gray-100'}`}>
                          <FaCreditCard className={`text-lg ${payment === 'card' ? 'text-[#C42A2E]' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="font-bold text-sm mb-0.5 text-[#111827]">Carte Bancaire</p>
                          <p className="text-xs text-[#6B7280]">Paiement sécurisé via Stripe</p>
                        </div>
                      </button>
                    </div>

                    {/* Information explicative */}
                    <motion.div
                      key={payment}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl flex items-start gap-3 ${payment === 'card' ? 'bg-[#EEF3FB] border border-[#D3E0F4]' : 'bg-emerald-50 border border-emerald-100'}`}
                    >
                      <FaInfoCircle className={`mt-0.5 shrink-0 ${payment === 'card' ? 'text-[#E3383C]' : 'text-emerald-600'}`} />
                      <p className={`text-xs font-medium leading-relaxed ${payment === 'card' ? 'text-[#4B5563]' : 'text-emerald-800'}`}>
                        {payment === 'card'
                          ? 'Votre paiement est sécurisé par Stripe. Vous serez invité à entrer vos coordonnées de carte bancaire après confirmation.'
                          : 'Vous réglez en espèces directement auprès de notre équipe lors de la remise des clés. Aucun prépaiement requis.'}
                      </p>
                    </motion.div>
                  </motion.div>
                )}

                {/* Boutons de navigation */}
                <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-100">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-6 py-3.5 bg-gray-100 text-[#111827] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-200 transition-colors"
                    >
                      Retour
                    </button>
                  )}

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 py-3.5 bg-[#0F2F75] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#0A2463] transition-colors shadow-sm"
                    >
                      Continuer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenConfirm}
                      disabled={submitting}
                      className="flex-1 py-4 bg-[#0F2F75] text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-[#0A2463] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                    >
                      {submitting ? "Traitement..." : "Finaliser la Réservation"}
                      {!submitting && <FaArrowRight size={12} />}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Colonne de droite : Récapitulatif */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm p-6 sticky top-28 border border-gray-100"
            >
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-5 border-b border-gray-100 pb-3">Récapitulatif</h3>

              <div className="relative h-36 rounded-xl overflow-hidden mb-5 bg-[#F9FAFB] border border-gray-100">
                <img src={resolveImageUrl(car.image)} alt={car.name} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0F2F75]/80 to-transparent h-16"></div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#E3383C]">{car.brand || 'Premium'}</p>
                  <p className="font-bold text-sm line-clamp-1">{car.name}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B7280]">Tarif journalier</span>
                  <span className="text-[#111827] font-bold">{Number(car.price || 0).toLocaleString('fr-FR')} DH</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B7280]">Durée</span>
                  <span className="text-[#111827] font-bold">{days || 0} jour{days > 1 ? 's' : ''}</span>
                </div>
                {babySeat && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6B7280]">Option siège bébé</span>
                    <span className="text-[#111827] font-bold">+{Number(days * 30).toLocaleString('fr-FR')} DH</span>
                  </div>
                )}
                <div className="text-xs text-[#6B7280] bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-0.5">
                  <p className="font-bold text-[#111827]">Prise en charge :</p>
                  <p className="text-[#4B5563] text-[11px] leading-snug">{pickupLocation}</p>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center mt-4">
                  <span className="text-[#111827] font-bold text-sm">Total à payer</span>
                  <span className="text-xl font-bold text-[#111827]">{Number(total || 0).toLocaleString('fr-FR')} <span className="text-xs font-semibold text-[#E3383C]">DH</span></span>
                </div>
              </div>

              <div className="bg-[#EEF3FB] rounded-xl p-3.5 border border-[#D3E0F4] flex gap-2.5">
                <FaInfoCircle className="text-[#C42A2E] mt-0.5 shrink-0" size={14} />
                <p className="text-[11px] text-[#4B5563] leading-relaxed">
                  Assurance tous risques et assistance 24/7 incluses. Sans frais de dossier cachés.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-[#0F2F75]/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative bg-white w-full max-w-xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col text-left"
            >
              {/* En-tête épuré */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-white shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Vérification <span className="text-[#E3383C]">Finale</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Récapitulatif de votre réservation avant confirmation</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Fermer"
                >
                  <FaTimes size={13} />
                </button>
              </div>
              
              <div className="p-6 sm:p-8 space-y-5 overflow-y-auto">
                {/* Résumé Véhicule */}
                <div className="flex justify-between items-center bg-slate-50/70 border border-slate-200/70 p-4 rounded-2xl">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E3383C] block mb-0.5">
                      {car.brand || 'Premium'}
                    </span>
                    <h4 className="font-bold text-base text-slate-900 leading-snug">{car.name}</h4>
                  </div>
                  <img
                    src={resolveImageUrl(car.image)}
                    alt={car.name}
                    className="w-20 h-14 object-cover rounded-xl border border-slate-200/80 shadow-2xs"
                  />
                </div>
                
                {/* Période */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Prise en charge
                    </span>
                    <p className="font-bold text-slate-900 text-sm">
                      {new Date(formData.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Restitution
                    </span>
                    <p className="font-bold text-slate-900 text-sm">
                      {new Date(formData.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Récapitulatif Prix */}
                <div className="p-5 bg-[#0F2F75] rounded-2xl text-white flex justify-between items-center shadow-xs">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      {days} {days > 1 ? 'jours' : 'jour'} de location
                    </span>
                    <p className="text-xs font-medium text-slate-300">Total TTC</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white tracking-tight">{total?.toLocaleString('fr-FR')}</span>
                    <span className="text-xs font-bold text-[#E3383C]">DH</span>
                  </div>
                </div>

                {/* Section Règlement */}
                {payment === 'card' ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <FaCreditCard className="text-[#E3383C] shrink-0" size={14} />
                      <p className="text-xs text-slate-700 font-semibold">Paiement sécurisé par carte bancaire</p>
                    </div>
                    {stripePromise && clientSecret ? (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <StripePaymentForm totalPrice={total} onPaymentSuccess={onStripeSuccess} />
                      </Elements>
                    ) : (
                      <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200/60">
                        <p className="text-xs text-rose-600 font-bold mb-1">Configuration Stripe en attente</p>
                        <p className="text-[11px] text-slate-400">Veuillez vérifier vos clés d'environnement Stripe.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50/60 rounded-xl border border-emerald-200/70">
                      <FaMoneyBillWave className="text-emerald-600 shrink-0" size={15} />
                      <p className="text-xs text-emerald-800 font-semibold">Règlement en espèces à la remise des clés — aucun prépaiement</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowConfirmModal(false)}
                        className="py-3.5 px-6 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Retour
                      </button>
                      <button
                        type="button"
                        onClick={finalConfirm}
                        className="py-3.5 px-6 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 shadow-xs transition-all cursor-pointer"
                      >
                        Confirmer & Réserver
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
