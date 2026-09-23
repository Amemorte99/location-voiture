import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, FaWhatsapp, FaPhoneAlt, FaEnvelope, FaEnvelopeOpen, 
  FaTrash, FaCheck, FaTimes, FaCommentDots,
  FaUserCheck, FaSave, FaRegClock
} from 'react-icons/fa';

export default function MessagesTab({
  messages = [],
  loading = false,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onToggleStatus,
  onUpdateNotes,
  onDeleteMessage,
  unreadCount = 0,
  page = 1,
  totalPages = 1,
  onPageChange
}) {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const handleOpenMessage = (msg) => {
    setSelectedMessage(msg);
    setInternalNotes(msg.adminNotes || '');
  };

  const handleSaveNotes = async () => {
    if (!selectedMessage || !onUpdateNotes) return;
    setSavingNotes(true);
    try {
      const updated = await onUpdateNotes(selectedMessage._id, internalNotes);
      if (updated) {
        setSelectedMessage(updated);
      } else {
        setSelectedMessage(prev => ({ ...prev, adminNotes: internalNotes }));
      }
    } finally {
      setSavingNotes(false);
    }
  };

  const handleToggleStatusInModal = async (id, targetStatus) => {
    if (!onToggleStatus) return;
    const updated = await onToggleStatus(id, targetStatus);
    if (updated) {
      setSelectedMessage(updated);
    } else {
      setSelectedMessage(prev => ({ 
        ...prev, 
        status: targetStatus,
        treatedAt: targetStatus === 'read' ? new Date().toISOString() : null
      }));
    }
  };

  const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('00235')) {
      cleaned = cleaned.substring(2);
    } else if (cleaned.length === 8) {
      cleaned = '235' + cleaned;
    }
    return cleaned;
  };

  const getWhatsAppLink = (msg) => {
    if (!msg) return '#';
    const phone = cleanPhoneNumber(msg.phone);
    const greeting = `Bonjour ${msg.name || ''},\nNous faisons suite à votre demande sur LocaGawa concernant "${msg.subject || 'votre projet de location'}".\nComment pouvons-nous vous aider ?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(greeting)}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFullDateTime = (dateStr) => {
    if (!dateStr) return 'Non renseigné';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Non renseigné';
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête de section avec statistiques */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Messages & <span className="text-[#E3383C]">Demandes</span>
            </h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Consultez les demandes du formulaire de contact avec traçabilité complète des traitements et réponses.
          </p>
        </div>

        {/* Filtres par statut (Pills) */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#0F2F75] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('unread')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'unread'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Non lus
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('read')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'read'
                ? 'bg-[#0F2F75] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Traités
          </button>
        </div>
      </div>

      {/* Barre de recherche rapide */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          type="text"
          placeholder="Rechercher par nom, email, téléphone, objet ou mot-clé..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-[#E3383C] focus:ring-2 focus:ring-[#E3383C]/15 transition-all shadow-2xs"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Liste des messages */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-xs">
          <div className="w-10 h-10 border-3 border-[#E3383C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-semibold">Chargement des messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EEF3FB] text-[#E3383C] flex items-center justify-center text-2xl mx-auto mb-4 border border-[#D3E0F4]">
            <FaEnvelopeOpen />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Aucun message trouvé</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {searchTerm || statusFilter !== 'all'
              ? "Aucune demande ne correspond à vos critères de recherche ou de filtre."
              : "Vous n'avez pas encore reçu de message via le formulaire de contact du site."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const isUnread = msg.status === 'unread';
            const clientName = msg.name || 'Client sans nom';
            const initials = clientName
              .split(' ')
              .map(n => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || 'CL';

            return (
              <motion.div
                key={msg._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`group bg-white rounded-2xl p-5 sm:p-6 border transition-all duration-200 shadow-2xs hover:shadow-md ${
                  isUnread
                    ? 'border-emerald-200 bg-emerald-50/15 hover:border-emerald-300'
                    : 'border-slate-200/80 hover:border-[#E3383C]/60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Carte message */}
                  <div 
                    className="flex items-start gap-4 min-w-0 flex-1 cursor-pointer" 
                    onClick={() => handleOpenMessage(msg)}
                  >
                    {/* Avatar avec initiales */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border transition-transform group-hover:scale-105 ${
                      isUnread
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* En-tête : Nom + Badges de statut & Traçabilité */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#E3383C] transition-colors">
                          {clientName}
                        </h4>
                        
                        {isUnread ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Nouveau
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-black uppercase tracking-wider">
                            <FaCheck size={9} className="text-emerald-600" />
                            Traité
                          </span>
                        )}

                        {/* Date de réception */}
                        <span className="text-[11px] text-slate-400 font-medium">
                          • Reçu {formatDate(msg.createdAt)}
                        </span>

                        {/* Traçabilité : Date et Responsable de traitement */}
                        {!isUnread && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            <FaUserCheck size={11} className="text-emerald-600" />
                            Traité {msg.treatedAt ? formatDate(msg.treatedAt) : ''} {msg.treatedBy?.name ? `par ${msg.treatedBy.name}` : ''}
                          </span>
                        )}

                        {/* Indicateur note interne */}
                        {msg.adminNotes && (
                          <span 
                            className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-semibold"
                            title={`Note interne : ${msg.adminNotes}`}
                          >
                            <FaCommentDots size={10} className="text-amber-600" />
                            Note ajoutée
                          </span>
                        )}
                      </div>

                      {/* Objet de la demande et coordonnées */}
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#EEF3FB] text-[#B0252A] border border-[#D3E0F4]/70 text-[11px] font-bold">
                          {msg.subject || 'Demande d\'information'}
                        </span>
                        {msg.phone && (
                          <span className="text-xs text-slate-500 font-semibold inline-flex items-center gap-1.5">
                            <FaPhoneAlt size={10} className="text-slate-400" />
                            {msg.phone}
                          </span>
                        )}
                        {msg.email && (
                          <span className="text-xs text-slate-400 truncate hidden sm:inline-flex items-center gap-1.5">
                            <FaEnvelope size={10} className="text-slate-400" />
                            {msg.email}
                          </span>
                        )}
                      </div>

                      {/* Aperçu du texte */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                        {msg.message || '(Aucun texte de message)'}
                      </p>
                    </div>
                  </div>

                  {/* Droite : Boutons d'action rapides */}
                  <div className="flex items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                    {/* Bouton WhatsApp direct */}
                    <a
                      href={getWhatsAppLink(msg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200/80 rounded-xl text-xs font-bold transition-all shadow-2xs"
                      title="Contacter directement sur WhatsApp avec message pré-rempli"
                    >
                      <FaWhatsapp size={14} />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>

                    {/* Bouton Appel direct */}
                    {msg.phone && (
                      <a
                        href={`tel:${msg.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-[#0F2F75] text-slate-700 hover:text-white border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
                        title={`Appeler le ${msg.phone}`}
                      >
                        <FaPhoneAlt size={12} />
                        <span className="hidden sm:inline">Appel</span>
                      </a>
                    )}

                    {/* Bascule Lu / Non lu avec sauvegarde en base */}
                    <button
                      type="button"
                      onClick={() => onToggleStatus(msg._id, isUnread ? 'read' : 'unread')}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors border cursor-pointer ${
                        isUnread
                          ? 'bg-[#0F2F75] hover:bg-[#0A2463] text-white border-slate-900 shadow-xs'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                      }`}
                      title={isUnread ? "Marquer comme traité et horodater" : "Remettre en non traité"}
                    >
                      {isUnread ? (
                        <>
                          <FaCheck size={11} className="text-emerald-400" />
                          <span className="hidden xl:inline">Traiter</span>
                        </>
                      ) : (
                        <>
                          <FaEnvelope size={11} />
                          <span className="hidden xl:inline">Non lu</span>
                        </>
                      )}
                    </button>

                    {/* Supprimer */}
                    <button
                      type="button"
                      onClick={() => onDeleteMessage(msg._id)}
                      className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200/80 flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title="Supprimer définitivement ce message"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-slate-400 font-medium">
            Page <span className="font-bold text-slate-700">{page}</span> sur <span className="font-bold text-slate-700">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Précédent
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Modal consultation message */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMessage(null)}
              className="absolute inset-0 bg-[#0F2F75]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-left flex flex-col max-h-[92vh]"
            >
              {/* En-tête Modal */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0F2F75] text-[#E3383C] flex items-center justify-center text-base">
                    <FaCommentDots />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Fiche Demande & <span className="text-[#E3383C]">Traçabilité</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Reçu le {formatFullDateTime(selectedMessage.createdAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                  title="Fermer"
                >
                  <FaTimes size={13} />
                </button>
              </div>

              {/* Contenu modal */}
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
                {/* Coordonnées client */}
                <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Coordonnées Client
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EEF3FB] text-[#B0252A] border border-[#D3E0F4] text-[10px] font-extrabold">
                      {selectedMessage.subject || 'Demande d\'information'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold">Nom complet</p>
                      <p className="text-sm font-bold text-slate-900">{selectedMessage.name || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold">Téléphone / WhatsApp</p>
                      <p className="text-sm font-bold text-slate-900">{selectedMessage.phone || 'Non renseigné'}</p>
                    </div>
                    {selectedMessage.email && (
                      <div className="sm:col-span-2">
                        <p className="text-[11px] text-slate-400 font-semibold">Adresse email</p>
                        <p className="text-xs font-semibold text-slate-700">{selectedMessage.email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Message transmis par le client
                  </label>
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium shadow-2xs">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Traçabilité & Suivi */}
                <div className="p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <FaUserCheck size={12} className="text-emerald-600" />
                      Journal de Traçabilité
                    </span>

                    {/* Bouton de bascule de statut dans le modal */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatusInModal(
                        selectedMessage._id, 
                        selectedMessage.status === 'read' ? 'unread' : 'read'
                      )}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedMessage.status === 'read'
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      {selectedMessage.status === 'read' ? (
                        <>
                          <FaEnvelope size={11} />
                          Remettre en Non Traité
                        </>
                      ) : (
                        <>
                          <FaCheck size={11} />
                          Valider comme Traité
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Date de réception</p>
                      <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                        <FaRegClock size={11} className="text-slate-400" />
                        {formatFullDateTime(selectedMessage.createdAt)}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">État de traitement</p>
                      {selectedMessage.status === 'read' ? (
                        <p className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1.5">
                          <FaCheck size={11} className="text-emerald-600" />
                          Traité le {formatDate(selectedMessage.treatedAt || selectedMessage.updatedAt)}
                          {selectedMessage.treatedBy?.name && (
                            <span className="text-slate-500 font-normal">({selectedMessage.treatedBy.name})</span>
                          )}
                        </p>
                      ) : (
                        <p className="font-bold text-amber-600 mt-0.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          En attente de réponse / traitement
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Bloc Note Interne Admin */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Note Interne & Suivi (Visible uniquement par l'équipe)
                    </label>
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0F2F75] hover:bg-[#0A2463] text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      <FaSave size={11} />
                      {savingNotes ? 'Sauvegarde...' : 'Enregistrer la note'}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Ajoutez une note de suivi interne (ex: Client contacté par téléphone le 18/09, devis Mercedes envoyé sur WhatsApp, négociation en cours...)"
                    className="w-full p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#E3383C] focus:ring-2 focus:ring-[#E3383C]/15 transition-all"
                  />
                </div>

                {/* 5. Actions directes de contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <a
                    href={getWhatsAppLink(selectedMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <FaWhatsapp size={16} />
                    <span>Répondre sur WhatsApp</span>
                  </a>

                  {selectedMessage.phone ? (
                    <a
                      href={`tel:${selectedMessage.phone}`}
                      className="py-3.5 px-4 bg-[#0F2F75] hover:bg-[#0A2463] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                    >
                      <FaPhoneAlt size={12} />
                      <span>Appeler le client ({selectedMessage.phone})</span>
                    </a>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
