import { useState } from 'react';
import { FaSave, FaBuilding, FaPhone, FaMapMarkerAlt, FaEnvelope, FaGlobe, FaDownload, FaClock, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

import { STATUS_LABELS } from '../../utils/constants';

const STATUS_ROLE_LABELS = { admin: 'Administrateur', user: 'Utilisateur' };

function downloadCSV(headers, rows, filename) {
  const csvContent = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SettingsTab({ bookings = [], users = [], cars = [] }) {
  const defaultAgency = {
    name: 'LocaFès',
    phone: '+212 535 62 10 20',
    email: 'contact@locafes.ma',
    address: 'Boulevard Allal Ben Abdellah, Quartier Atlas, 30000 Fès, Maroc',
    currency: 'DH',
    website: 'www.locafes.ma',
    hours: '08:00 - 21:00 (7j/7)',
    deposit: '5 000 DH (empreinte CB)',
  };

  const [agency, setAgency] = useState(() => {
    try {
      const saved = localStorage.getItem('locafes_agency_settings');
      return saved ? { ...defaultAgency, ...JSON.parse(saved) } : defaultAgency;
    } catch {
      return defaultAgency;
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('locafes_agency_settings', JSON.stringify(agency));
      toast.success('Paramètres enregistrés avec succès !');
    } catch {
      toast.error('Erreur lors de la sauvegarde des paramètres');
    }
  };

  const handleExport = (key) => {
    if (key === 'bookings') {
      if (!bookings || bookings.length === 0) {
        toast.error('Aucune réservation à exporter');
        return;
      }
      const headers = ['Conducteur', 'Téléphone', 'Véhicule', 'Début', 'Fin', 'Montant (DH)', 'Statut', 'Paiement'];
      const rows = bookings.map(b => [
        b.fullName || '',
        b.phone || '',
        b.car?.name || '',
        b.startDate ? new Date(b.startDate).toLocaleDateString('fr-FR') : '',
        b.endDate ? new Date(b.endDate).toLocaleDateString('fr-FR') : '',
        b.totalPrice || '',
        STATUS_LABELS[b.status] || b.status || '',
        b.paymentMethod === 'card' ? 'Carte' : 'Espèces',
      ]);
      downloadCSV(headers, rows, `reservations_locafes_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.csv`);
      toast.success('Réservations exportées avec succès !');
    } else if (key === 'users') {
      if (!users || users.length === 0) {
        toast.error('Aucun client à exporter');
        return;
      }
      const headers = ['Nom', 'Email', 'Téléphone', 'Rôle', "Date d'inscription"];
      const rows = users.map(u => [
        u.name || '',
        u.email || '',
        u.phone || '',
        STATUS_ROLE_LABELS[u.role] || u.role || '',
        u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '',
      ]);
      downloadCSV(headers, rows, `clients_locafes_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.csv`);
      toast.success('Clients exportés avec succès !');
    } else if (key === 'cars') {
      if (!cars || cars.length === 0) {
        toast.error('Aucune voiture à exporter');
        return;
      }
      const headers = ['Nom', 'Marque', 'Année', 'Carburant', 'Boîte', 'Prix (DH/J)', 'Disponible'];
      const rows = cars.map(c => [
        c.name || '',
        c.brand || '',
        c.year || '',
        c.fuel || '',
        c.gearbox || '',
        c.price || '',
        c.available ? 'Oui' : 'Non',
      ]);
      downloadCSV(headers, rows, `parc_auto_locafes_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.csv`);
      toast.success('Parc automobile exporté avec succès !');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-bold text-[#111827]">
          Paramètres <span className="text-[#C4A47C]">Agence</span>
        </h2>
        <p className="text-[#6B7280] text-xs font-medium mt-1">
          Coordonnées figurant sur les reçus PDF et exportations
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Formulaire coordonnées de l'agence */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200/80 space-y-5">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-[#F8F5F0] text-[#C4A47C] flex items-center justify-center text-sm">
              <FaBuilding />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Informations de l'Agence</h3>
              <p className="text-xs text-[#6B7280]">Utilisées pour les factures et reçus</p>
            </div>
          </div>

          {[
            { label: "Nom de l'agence", key: 'name', icon: <FaBuilding />, type: 'text' },
            { label: 'Téléphone contact', key: 'phone', icon: <FaPhone />, type: 'tel' },
            { label: 'Email officiel', key: 'email', icon: <FaEnvelope />, type: 'email' },
            { label: 'Adresse physique', key: 'address', icon: <FaMapMarkerAlt />, type: 'text' },
            { label: 'Site web', key: 'website', icon: <FaGlobe />, type: 'text' },
          ].map(({ label, key, icon, type }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-bold text-[#6B7280]">{label}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C4A47C] text-sm">{icon}</span>
                <input
                  type={type}
                  value={agency[key] || ''}
                  onChange={e => setAgency({ ...agency, [key]: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl focus:bg-white focus:border-[#C4A47C] outline-none transition-colors font-medium text-sm text-[#111827]"
                />
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#6B7280]">Devise principale</label>
              <select
                value={agency.currency || 'DH'}
                onChange={e => setAgency({ ...agency, currency: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl focus:bg-white focus:border-[#C4A47C] outline-none font-medium text-xs text-[#111827]"
              >
                <option value="DH">DH — Dirham Marocain</option>
                <option value="EUR">EUR — Euro</option>
                <option value="USD">USD — Dollar</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#6B7280]">Horaires d'agence</label>
              <input
                type="text"
                value={agency.hours || ''}
                onChange={e => setAgency({ ...agency, hours: e.target.value })}
                placeholder="08:00 - 21:00 (7j/7)"
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl focus:bg-white focus:border-[#C4A47C] outline-none font-medium text-xs text-[#111827]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#111827] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
          >
            <FaSave /> Enregistrer les paramètres
          </button>
        </form>

        {/* Colonne droite : Conditions & Exportations */}
        <div className="space-y-6">
          {/* Export Données */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
                <FaDownload />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Export Données (CSV)</h3>
                <p className="text-xs text-[#6B7280]">Téléchargez les données au format tableur</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Exporter les Réservations', desc: `${bookings.length} réservation(s)`, key: 'bookings' },
                { label: 'Exporter les Clients', desc: `${users.length} client(s)`, key: 'users' },
                { label: 'Exporter le Parc Automobile', desc: `${cars.length} véhicule(s)`, key: 'cars' },
              ].map(({ label, desc, key }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleExport(key)}
                  className="w-full p-4 rounded-xl border border-gray-200 hover:border-[#C4A47C] bg-[#F9FAFB] hover:bg-white transition-all flex items-center justify-between text-left group"
                >
                  <div>
                    <p className="text-xs font-bold text-[#111827] group-hover:text-[#C4A47C] transition-colors">{label}</p>
                    <p className="text-[11px] text-[#6B7280]">{desc}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white group-hover:bg-[#F8F5F0] flex items-center justify-center text-gray-400 group-hover:text-[#C4A47C] border border-gray-200 transition-colors">
                    <FaDownload size={12} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conditions de service */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm">
                <FaShieldAlt />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Conditions de Location</h3>
                <p className="text-xs text-[#6B7280]">Règles appliquées aux réservations</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#4B5563]">
              <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl">
                <FaClock className="text-[#C4A47C] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-[#111827]">Prise en charge flexible</p>
                  <p className="text-[#6B7280]">Aéroport Fès-Saïss, Agence Centre-Ville ou livraison directe à l'hôtel / riad.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl">
                <FaShieldAlt className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-[#111827]">Assurance tous risques</p>
                  <p className="text-[#6B7280]">Incluse avec chaque contrat de location. Assistance 24/7 partout au Maroc.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
