import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUserTie, FaPhoneAlt, FaWhatsapp, FaMapMarkerAlt, FaPlus, 
  FaEdit, FaTrash, FaSearch, FaCar, FaTimes, FaThLarge, 
  FaList, FaBed, FaSyncAlt
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { createDriver, updateDriver, updateDriverStatus, deleteDriver } from '../../services/driverService';

const cleanZoneText = (str) => {
  if (!str) return '';
  return str.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
};

const STATUS_CONFIG = {
  disponible: {
    label: 'Disponible',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dotClass: 'bg-emerald-500',
    glowClass: 'bg-emerald-400',
    description: 'Prêt pour départ immédiat',
  },
  en_mission: {
    label: 'En mission',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dotClass: 'bg-amber-500',
    glowClass: 'bg-amber-400',
    description: 'Transfert en acheminement',
  },
  repos: {
    label: 'En repos',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    dotClass: 'bg-slate-400',
    glowClass: 'bg-slate-300',
    description: 'Hors service programmé',
  },
};

const POPULAR_ZONES = [
  'Spécialiste Aéroport Fès-Saïss',
  'Agence Quartier Atlas & Centre',
  'Hôtels & Riads (Médina)',
  'Gare Ferroviaire Fès-Ville',
  'Toutes zones (Fès & Région)',
];

export default function DriversTab({ drivers = [], stats = null, onRefresh }) {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmDriver, setDeleteConfirmDriver] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    zone: POPULAR_ZONES[0],
    licenseNumber: '',
    status: 'disponible',
  });

  const openCreateModal = () => {
    setEditingDriver(null);
    setFormData({
      name: '',
      phone: '',
      whatsapp: '',
      zone: POPULAR_ZONES[0],
      licenseNumber: '',
      status: 'disponible',
    });
    setModalOpen(true);
  };

  const openEditModal = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name || '',
      phone: driver.phone || '',
      whatsapp: driver.whatsapp || '',
      zone: cleanZoneText(driver.zone) || POPULAR_ZONES[0],
      licenseNumber: driver.licenseNumber || '',
      status: driver.status || 'disponible',
    });
    setModalOpen(true);
  };

  const handleStatusChange = async (driverId, newStatus) => {
    try {
      await updateDriverStatus(driverId, newStatus);
      toast.success('Statut du chauffeur actualisé');
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du changement de statut');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDriver) {
        await updateDriver(editingDriver._id, formData);
        toast.success(`Fiche de ${formData.name} mise à jour`);
      } else {
        await createDriver(formData);
        toast.success(`Chauffeur ${formData.name} ajouté à la flotte`);
      }
      setModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmDriver) return;
    try {
      await deleteDriver(deleteConfirmDriver._id);
      toast.success('Chauffeur retiré avec succès');
      setDeleteConfirmDriver(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const cleanedZone = cleanZoneText(d.zone);
      const matchSearch =
        !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.phone.includes(search) ||
        cleanedZone.toLowerCase().includes(search.toLowerCase());

      const matchStatus = selectedStatus === 'all' || d.status === selectedStatus;
      const matchZone = selectedZone === 'all' || cleanedZone === selectedZone;

      return matchSearch && matchStatus && matchZone;
    });
  }, [drivers, search, selectedStatus, selectedZone]);

  const counts = useMemo(() => {
    const total = drivers.length;
    const disponible = drivers.filter((d) => d.status === 'disponible').length;
    const en_mission = drivers.filter((d) => d.status === 'en_mission').length;
    const repos = drivers.filter((d) => d.status === 'repos').length;
    return { total, disponible, en_mission, repos };
  }, [drivers]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. EN-TÊTE ÉPURÉ & MODERNE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-[#111827] tracking-tight">
            Équipe Chauffeurs & Livreurs
          </h2>
          <p className="text-xs text-[#6B7280] font-medium mt-0.5">
            Supervision en temps réel et affectation des missions de transfert
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[#111827] hover:border-gray-300 transition-all shadow-sm cursor-pointer"
              title="Actualiser la liste"
            >
              <FaSyncAlt size={12} />
            </button>
          )}

          {/* Switch Vue Grille / Tableau */}
          <div className="flex items-center p-1 bg-gray-100/80 rounded-xl border border-gray-200/60">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-gray-500 hover:text-[#111827]'
              }`}
            >
              <FaThLarge size={11} />
              <span>Grille</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-gray-500 hover:text-[#111827]'
              }`}
            >
              <FaList size={11} />
              <span>Tableau</span>
            </button>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F2F75] text-white rounded-xl font-bold text-xs hover:bg-[#E3383C] hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <FaPlus size={11} />
            <span>Nouveau Chauffeur</span>
          </button>
        </div>
      </div>

      {/* Indicateurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Équipe */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">Total Équipe</span>
            <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center text-sm border border-gray-200/60">
              <FaUserTie size={14} />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
            {counts.total}
          </h3>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Chauffeurs actifs enregistrés
          </p>
        </div>

        {/* Disponibles */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-700">Disponibles</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm border border-emerald-100 relative">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 relative" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-emerald-600 tracking-tight">
            {counts.disponible}
          </h3>
          <p className="text-xs text-emerald-600/80 font-medium mt-1">
            Prêts pour départ immédiat
          </p>
        </div>

        {/* En mission */}
        <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-amber-700">En Mission</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm border border-amber-100">
              <FaCar size={14} />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-amber-600 tracking-tight">
            {counts.en_mission}
          </h3>
          <p className="text-xs text-amber-600/80 font-medium mt-1">
            Courses et transferts en cours
          </p>
        </div>

        {/* En repos */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">En Repos</span>
            <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center text-sm border border-gray-200/60">
              <FaBed size={14} />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-600 tracking-tight">
            {counts.repos}
          </h3>
          <p className="text-xs text-gray-400 font-medium mt-1">
            En pause ou relève planifiée
          </p>
        </div>

      </div>

      {/* 3. BARRE DE COMMANDE & FILTRES INTÉGRÉS */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm space-y-3">
        
        {/* Ligne 1 : Recherche + Sélecteur de Zone */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, permis, zone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-medium text-[#111827] placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#E3383C] transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer p-0.5"
                title="Effacer la recherche"
              >
                <FaTimes size={10} />
              </button>
            )}
          </div>

          <div className="w-full sm:w-64 shrink-0">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 outline-none focus:bg-white focus:border-[#E3383C] transition-all cursor-pointer"
            >
              <option value="all">Toutes les zones d'intervention</option>
              {POPULAR_ZONES.map((z, idx) => (
                <option key={idx} value={z}>{z}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ligne 2 : Onglets de Statut & Réinitialisation */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            {[
              { id: 'all', label: 'Tous', count: counts.total },
              { id: 'disponible', label: 'Disponibles', count: counts.disponible, dot: 'bg-emerald-500' },
              { id: 'en_mission', label: 'En mission', count: counts.en_mission, dot: 'bg-amber-500' },
              { id: 'repos', label: 'En repos', count: counts.repos, dot: 'bg-gray-400' },
            ].map((tab) => {
              const isActive = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#0F2F75] text-white shadow-xs'
                      : 'text-gray-600 hover:text-[#111827] hover:bg-gray-100'
                  }`}
                >
                  {tab.dot && <span className={`w-2 h-2 rounded-full ${tab.dot}`} />}
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200/80 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {(search || selectedStatus !== 'all' || selectedZone !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedStatus('all');
                setSelectedZone('all');
              }}
              className="text-xs text-[#E3383C] hover:text-[#b08f65] font-semibold cursor-pointer py-1"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>

      </div>

      {/* 4. CONTENU PRINCIPAL : CARTES OU TABLEAU */}
      {filteredDrivers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center text-2xl mx-auto mb-4">
            <FaUserTie />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Aucun chauffeur trouvé</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            {search || selectedStatus !== 'all'
              ? 'Aucun membre ne correspond à vos filtres actuels. Essayez de réinitialiser la recherche.'
              : 'Votre équipe de chauffeurs est vide. Ajoutez vos premiers chauffeurs professionnels.'}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#123A8A] text-white rounded-xl text-xs font-bold hover:bg-[#E3383C] hover:text-[#123A8A] transition-all shadow-sm cursor-pointer"
          >
            <FaPlus size={10} />
            Ajouter un chauffeur
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* --- VUE GRILLE DE CARTES EXÉCUTIVES AÉRÉES --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => {
            const statusConf = STATUS_CONFIG[driver.status] || STATUS_CONFIG.disponible;
            const waPhone = driver.whatsapp || driver.phone;
            const initials = driver.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            const displayZone = cleanZoneText(driver.zone) || 'Toutes zones';

            return (
              <motion.div
                key={driver._id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Profil principal & Statut */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#0F2F75] text-[#E3383C] font-black text-sm flex items-center justify-center shadow-xs border border-gray-800 shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-base text-[#111827] leading-tight truncate" title={driver.name}>
                          {driver.name}
                        </h4>
                        <p className="text-xs text-gray-400 font-medium mt-0.5 truncate">
                          {driver.licenseNumber ? `Permis ${driver.licenseNumber}` : 'Chauffeur Agréé'}
                        </p>
                      </div>
                    </div>

                    {/* Sélecteur de statut rapide avec puce animée */}
                    <div className="relative shrink-0">
                      <select
                        value={driver.status}
                        onChange={(e) => handleStatusChange(driver._id, e.target.value)}
                        className={`text-[11px] font-bold pl-2.5 pr-6 py-1 rounded-full border outline-none cursor-pointer transition-all appearance-none ${statusConf.badgeClass}`}
                      >
                        <option value="disponible">Disponible</option>
                        <option value="en_mission">En mission</option>
                        <option value="repos">En repos</option>
                      </select>
                      <span className={`w-2 h-2 rounded-full absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${statusConf.dotClass}`} />
                    </div>
                  </div>

                  {/* Fiche d'informations unifiée et ordonnée */}
                  <div className="bg-gray-50/80 rounded-xl p-3.5 space-y-2.5 border border-gray-100 text-xs mb-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-gray-400 font-medium shrink-0">
                        <FaMapMarkerAlt size={11} className="text-[#E3383C]" /> Zone
                      </span>
                      <span className="font-semibold text-gray-800 truncate text-right">
                        {displayZone}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200/60">
                      <span className="text-gray-400 font-medium shrink-0">
                        Missions effectuées
                      </span>
                      <span className="font-bold text-[#111827]">
                        {driver.completedMissions || 0} missions
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200/60">
                      <span className="flex items-center gap-1.5 text-gray-400 font-medium shrink-0">
                        <FaPhoneAlt size={10} className="text-gray-400" /> Appel direct
                      </span>
                      <a
                        href={`tel:${driver.phone}`}
                        className="font-bold text-[#111827] hover:text-[#E3383C] transition-colors"
                      >
                        {driver.phone}
                      </a>
                    </div>
                  </div>

                  {/* Bouton Ordre de Mission WhatsApp (propre sur une seule ligne) */}
                  <a
                    href={`https://wa.me/${waPhone}?text=Bonjour%20${encodeURIComponent(driver.name)},%20ordre%20de%20mission%20LocaGawa.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200/80 text-xs font-bold transition-all shadow-xs active:scale-95 mb-1"
                  >
                    <FaWhatsapp size={15} />
                    <span>Ordre de Mission WhatsApp</span>
                  </a>
                </div>

                {/* Bas de carte avec statut & actions */}
                <div className="pt-3.5 mt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-400 font-medium truncate max-w-[200px]">
                    {statusConf.description}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(driver)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#111827] hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Modifier les informations"
                    >
                      <FaEdit size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmDriver(driver)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Retirer de l'équipe"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      ) : (
        /* Vue tableau */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Chauffeur</th>
                  <th className="py-4 px-6">Statut en direct</th>
                  <th className="py-4 px-6">Zone de référence</th>
                  <th className="py-4 px-6">Téléphone direct</th>
                  <th className="py-4 px-6 text-center">Missions</th>
                  <th className="py-4 px-6 text-center">Dispatch WhatsApp</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDrivers.map((driver) => {
                  const statusConf = STATUS_CONFIG[driver.status] || STATUS_CONFIG.disponible;
                  const waPhone = driver.whatsapp || driver.phone;
                  const initials = driver.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  const displayZone = cleanZoneText(driver.zone) || 'Toutes zones';

                  return (
                    <tr key={driver._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#123A8A] text-[#E3383C] font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{driver.name}</p>
                            <p className="text-[11px] text-slate-400">
                              {driver.licenseNumber ? `Permis ${driver.licenseNumber}` : 'Chauffeur Agréé'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <select
                          value={driver.status}
                          onChange={(e) => handleStatusChange(driver._id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer transition-all ${statusConf.badgeClass}`}
                        >
                          <option value="disponible">Disponible</option>
                          <option value="en_mission">En mission</option>
                          <option value="repos">En repos</option>
                        </select>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200/60 font-semibold text-slate-700 text-xs">
                          <FaMapMarkerAlt size={11} className="text-[#E3383C]" />
                          {displayZone}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <a
                          href={`tel:${driver.phone}`}
                          className="font-bold text-slate-800 hover:text-[#E3383C] transition-colors"
                        >
                          {driver.phone}
                        </a>
                      </td>

                      <td className="py-4 px-6 text-center font-bold text-slate-800">
                        {driver.completedMissions || 0}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <a
                          href={`https://wa.me/${waPhone}?text=Bonjour%20${encodeURIComponent(driver.name)},%20ordre%20de%20mission%20LocaGawa.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 font-bold text-xs transition-all"
                        >
                          <FaWhatsapp size={13} />
                          <span>WhatsApp</span>
                        </a>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(driver)}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <FaEdit size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmDriver(driver)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Retirer"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MODALE AJOUT / MODIFICATION SPACIEUSE */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F2F75]/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-7 sm:p-9 max-w-lg w-full shadow-2xl border border-slate-100 relative"
            >
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Fermer"
              >
                <FaTimes size={13} />
              </button>

              <div className="flex items-center gap-3.5 mb-7">
                <div className="w-12 h-12 rounded-2xl bg-[#0F2F75] text-[#E3383C] flex items-center justify-center font-bold shadow-xs">
                  <FaUserTie size={18} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    {editingDriver ? 'Modifier la Fiche Chauffeur' : 'Ajouter un Nouveau Chauffeur'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Informations opérationnelles pour les missions de livraison et transferts.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Karim Alami"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#E3383C] focus:ring-2 focus:ring-[#E3383C]/15 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                      Téléphone d'appel *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 06 61 48 92 15"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#E3383C] focus:ring-2 focus:ring-[#E3383C]/15 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                      Numéro WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="Identique au tél si vide"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#E3383C] focus:ring-2 focus:ring-[#E3383C]/15 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                    Zone de Prédilection
                  </label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#E3383C] transition-colors cursor-pointer"
                  >
                    {POPULAR_ZONES.map((zone, idx) => (
                      <option key={idx} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                      Statut Initial
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#E3383C] transition-colors cursor-pointer"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="en_mission">En mission</option>
                      <option value="repos">En repos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                      N° Permis de conduire
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 23/184920"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#E3383C] focus:ring-2 focus:ring-[#E3383C]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3.5 bg-[#0F2F75] hover:bg-[#0A2463] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Enregistrement...' : editingDriver ? 'Mettre à jour' : 'Ajouter le Chauffeur'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. MODALE DE SUPPRESSION SÉCURISÉE */}
      <AnimatePresence>
        {deleteConfirmDriver && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F2F75]/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white rounded-3xl p-7 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100/80 flex items-center justify-center text-lg mx-auto mb-4">
                <FaTrash size={16} />
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-1">Retirer le chauffeur ?</h4>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Êtes-vous certain de vouloir retirer <strong>{deleteConfirmDriver.name}</strong> de l'équipe de livraison ?
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmDriver(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-all shadow-xs cursor-pointer"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
