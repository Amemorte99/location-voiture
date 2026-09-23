import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  FaPhoneAlt, FaWhatsapp, FaMapMarkerAlt, 
  FaCar, FaPlane, FaCheckCircle, FaPaperPlane
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { sendMessage } from '../services/messageService';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: "Demande d'information",
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Veuillez renseigner au moins votre nom et votre numéro de téléphone.');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Veuillez saisir votre message.');
      return;
    }

    setSending(true);
    try {
      await sendMessage(formData);
      setSubmitted(true);
      toast.success('Votre message a bien été envoyé ! Notre équipe vous répond sous 30 minutes.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: "Demande d'information",
        message: ''
      });
    } catch (err) {
      console.error('Erreur envoi message:', err);
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi du message. Veuillez réessayer ou nous contacter sur WhatsApp.");
    } finally {
      setSending(false);
    }
  };

  const generateWhatsAppLink = () => {
    const text = `Bonjour LocaGawa,\nJe m'appelle ${formData.name || 'un client'}.\nObjet : ${formData.subject}\n${formData.message ? `Message : ${formData.message}\n` : ''}${formData.phone ? `Téléphone : ${formData.phone}` : ''}`;
    return `https://wa.me/212668898245?text=${encodeURIComponent(text)}`;
  };



  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#F9FAFB]">
      <Helmet>
        <title>Contact & Réservations | LocaGawa — Location Voitures Fès</title>
        <meta name="description" content="Contactez l'agence LocaGawa par téléphone au 05 35 62 10 20 ou par WhatsApp direct 24/7 au +212 668 89 82 45. Adresse : Boulevard Allal Ben Abdellah, Quartier Atlas, 30000 Fès." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 bg-[#EEF3FB] text-[#E3383C] rounded-full font-bold text-[10px] uppercase tracking-[0.25em] mb-4 border border-[#D3E0F4]">
            Service Client & Agence • Fès, Maroc
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight mb-4">
            Contactez Notre Équipe Locale
          </h1>
          <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
            Une question sur un modèle, un devis personnalisé ou une livraison directe à l'aéroport Fès-Saïss ? 
            Nous vous répondons 7j/7 avec réactivité.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {/* 1. Téléphone Agence */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:border-[#E3383C]/60 hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#EEF3FB] text-[#E3383C] border border-[#D3E0F4]/60 flex items-center justify-center text-base mb-4 group-hover:bg-[#0F2F75] group-hover:text-white transition-colors">
                <FaPhoneAlt />
              </div>
              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Téléphone Agence</p>
              <h3 className="text-xl font-black text-[#111827] mb-1">05 35 62 10 20</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Ligne directe non surtaxée • Joignable 7j/7 de 08h00 à 21h00.
              </p>
            </div>
            <a
              href="tel:+212535621020"
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-[#0F2F75] hover:text-white text-[#111827] text-xs font-bold text-center transition-colors border border-gray-100"
            >
              Appeler maintenant
            </a>
          </div>

          {/* 2. WhatsApp 24/7 */}
          <div className="bg-white p-6 rounded-2xl border border-emerald-500/30 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <FaWhatsapp />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Réponse &lt; 15 min
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">WhatsApp Direct 24/7</p>
              <h3 className="text-xl font-black text-[#111827] mb-1">+212 668 89 82 45</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Conseiller dédié en direct pour réservation rapide ou urgence.
              </p>
            </div>
            <a
              href="https://wa.me/212668898245?text=Bonjour%20LocaGawa,%20je%20souhaite%20des%20informations%20sur%20la%20location%20d'un%20v%C3%A9hicule."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold text-center transition-colors shadow-sm"
            >
              Ouvrir la discussion WhatsApp
            </a>
          </div>

          {/* 3. Aéroport Fès-Saïss & Agence */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:border-[#E3383C]/60 hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#EEF3FB] text-[#E3383C] border border-[#D3E0F4]/60 flex items-center justify-center text-base mb-4 group-hover:bg-[#0F2F75] group-hover:text-white transition-colors">
                <FaPlane />
              </div>
              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Permanence Aéroport</p>
              <h3 className="text-xl font-black text-[#111827] mb-1">Terminal Arrivées FEZ</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Accueil 24h/24 avec suivi des vols en direct • Agence : Boulevard Allal Ben Abdellah, Quartier Atlas.
              </p>
            </div>
            <a
              href="mailto:contact@locafes.ma"
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-[#0F2F75] hover:text-white text-[#111827] text-xs font-bold text-center transition-colors border border-gray-100 truncate"
            >
              contact@locafes.ma
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Formulaire de Message Express (7 colonnes) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
            <h2 className="text-xl font-bold text-[#111827] mb-1.5">Envoyez-nous Votre Demande</h2>
            <p className="text-xs text-[#6B7280] mb-6">
              Remplissez ce formulaire et notre responsable commercial vous recontactera dans les plus brefs délais.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4"
              >
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xl mx-auto">
                  <FaCheckCircle />
                </div>
                <h3 className="text-lg font-bold text-emerald-950">Message transmis avec succès !</h3>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                  Merci <span className="font-bold">{formData.name}</span>, notre équipe a bien reçu votre demande et vous répondra très rapidement au <span className="font-bold">{formData.phone}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', subject: "Demande d'information", message: '' });
                  }}
                  className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-xs hover:bg-emerald-800 transition-colors"
                >
                  Envoyer un nouveau message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4B5563]">Nom complet *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mohammed Alami"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl focus:bg-white focus:border-[#E3383C] outline-none text-sm font-medium text-[#111827] transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4B5563]">Téléphone ou WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="06 XX XX XX XX"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl focus:bg-white focus:border-[#E3383C] outline-none text-sm font-medium text-[#111827] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4B5563]">Adresse email (optionnel)</label>
                    <input
                      type="email"
                      placeholder="nom@exemple.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl focus:bg-white focus:border-[#E3383C] outline-none text-sm font-medium text-[#111827] transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4B5563]">Objet de votre demande</label>
                    <select
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl focus:bg-white focus:border-[#E3383C] outline-none text-xs font-bold text-[#111827] transition-colors"
                    >
                      <option value="Demande d'information">Renseignement général</option>
                      <option value="Disponibilité d'un véhicule">Disponibilité d'un véhicule précis</option>
                      <option value="Livraison Aéroport Fès-Saïss">Livraison à l'Aéroport Fès-Saïss</option>
                      <option value="Location longue durée ou pro">Location longue durée / Entreprise</option>
                      <option value="Autre demande">Autre requête</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">Votre message</label>
                  <textarea
                    rows={4}
                    placeholder="Indiquez vos dates de séjour, le type de véhicule souhaité ou vos préférences..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-4 bg-[#F9FAFB] border border-gray-200 rounded-xl focus:bg-white focus:border-[#E3383C] outline-none text-sm font-medium text-[#111827] resize-none transition-colors"
                  ></textarea>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 py-3.5 bg-[#0F2F75] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#0A2463] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {sending ? 'Envoi en cours...' : <><FaPaperPlane size={11} /> Envoyer le formulaire</>}
                  </button>
                  <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <FaWhatsapp size={14} /> Envoyer par WhatsApp
                  </a>
                </div>
              </form>
            )}
          </div>

          {/* Points de Livraison & Carte Agrandie (5 colonnes) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#111827]">Points de Prise en Charge</h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF3FB] text-[#E3383C] flex items-center justify-center shrink-0 mt-0.5">
                    <FaPlane size={13} />
                  </div>
                  <div>
                    <p className="font-bold text-[#111827]">Aéroport Fès-Saïss (FEZ)</p>
                    <p className="text-[#6B7280] text-[11px] leading-relaxed">
                      Terminal Arrivées : accueil personnalisé avec panneau à votre nom, remise des clés directe au parking.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF3FB] text-[#E3383C] flex items-center justify-center shrink-0 mt-0.5">
                    <FaMapMarkerAlt size={13} />
                  </div>
                  <div>
                    <p className="font-bold text-[#111827]">Agence Quartier Atlas</p>
                    <p className="text-[#6B7280] text-[11px] leading-relaxed">
                      Boulevard Allal Ben Abdellah, Quartier Atlas, 30000 Fès. À proximité immédiate de la Place de l'Atlas.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF3FB] text-[#E3383C] flex items-center justify-center shrink-0 mt-0.5">
                    <FaCar size={13} />
                  </div>
                  <div>
                    <p className="font-bold text-[#111827]">Livraison Hôtel ou Riad</p>
                    <p className="text-[#6B7280] text-[11px] leading-relaxed">
                      Mise à disposition gratuite sur l'ensemble des hôtels et riads de Fès Ville Nouvelle et Médina.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <FaCheckCircle className="text-emerald-500 shrink-0" />
                <span>Assurance tous risques et assistance 24/7 incluses</span>
              </div>
            </div>

            {/* Carte Google Maps Agrandie et Soignée */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm h-64 relative">
              <iframe
                title="Carte Agence LocaGawa"
                src="https://maps.google.com/maps?q=Place+Atlas+Fes+Morocco&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
