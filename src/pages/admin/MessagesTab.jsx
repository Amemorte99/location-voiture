import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, FaWhatsapp, FaPhoneAlt, FaEnvelope, FaEnvelopeOpen, 
  FaTrash, FaCheck, FaTimes, FaCalendarAlt, FaUser, FaTag, FaCommentDots 
} from 'react-icons/fa';

export default function MessagesTab({
  messages = [],
  loading = false,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onToggleStatus,
  onDeleteMessage,
  unreadCount = 0,
  page = 1,
  totalPages = 1,
  onPageChange
}) {
  const [selectedMessage, setSelectedMessage] = useState(null);

  const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '212' + cleaned.substring(1);
    }
    return cleaned;
  };

  const getWhatsAppLink = (msg) => {
    const phone = cleanPhoneNumber(msg.phone);
    const greeting = `Bonjour ${msg.name || ''},\nNous faisons suite à votre demande sur LocaFès concernant "${msg.subject || 'votre projet de location'}".\nComment pouvons-nous vous aider ?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(greeting)}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 5) return 'À l\'instant';
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

  return (
    <div className="space-y-6">
      {/* En-tête de section avec statistiques */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Messages & <span className="text-[#C4A47C]">Demandes</span>
            </h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Consultez les demandes du formulaire de contact et répondez aux clients en un clic.
          </p>
        </div>

        {/* Filtres par statut (Pills) */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
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
            Non lus
            {unreadCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                statusFilter === 'unread' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('read')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'read'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Traités / Lus
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par nom, téléphone, email, objet ou mot-clé..."
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-[#C4A47C] focus:ring-2 focus:ring-[#C4A47C]/15 transition-all shadow-2xs"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Liste des messages */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-3 border-[#C4A47C] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold">Chargement des messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#F8F5F0] text-[#C4A47C] flex items-center justify-center text-2xl mx-auto mb-4 border border-[#E8DDD0]">
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
            const initials = msg.name
              ? msg.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              : 'CL';

            return (
              <motion.div
                key={msg._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`group bg-white rounded-2xl p-5 sm:p-6 border transition-all duration-200 shadow-2xs hover:shadow-md ${
                  isUnread
                    ? 'border-emerald-200/90 bg-emerald-50/10 hover:border-emerald-300'
                    : 'border-slate-200/80 hover:border-[#C4A47C]/60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Gauche : Avatar + Infos client + Extrait message */}
                  <div className="flex items-start gap-4 min-w-0 flex-1 cursor-pointer" onClick={() => setSelectedMessage(msg)}>
                    {/* Avatar avec initiales */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border transition-transform group-hover:scale-105 ${
                      isUnread
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#C4A47C] transition-colors">
                          {msg.name}
                        </h4>
                        
                        {isUnread ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Nouveau
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                            Traité
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400 font-medium">
                          • {formatDate(msg.createdAt)}
                        </span>
                      </div>

                      {/* Objet de la demande */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#F8F5F0] text-[#9E7B4E] border border-[#E8DDD0]/70 text-[11px] font-bold">
                          {msg.subject || 'Demande d\'information'}
                        </span>
                        {msg.email && (
                          <span className="text-xs text-slate-400 truncate hidden sm:inline">
                            {msg.email}
                          </span>
                        )}
                      </div>

                      {/* Aperçu du texte */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                        {msg.message}
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
                      title="Contacter sur WhatsApp"
                    >
                      <FaWhatsapp size={14} />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>

                    {/* Bouton Appel direct */}
                    <a
                      href={`tel:${msg.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-900 text-slate-700 hover:text-white border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
                      title={`Appeler le ${msg.phone}`}
                    >
                      <FaPhoneAlt size={12} />
                      <span className="hidden sm:inline">Appel</span>
                    </a>

                    {/* Bascule Lu / Non lu */}
                    <button
                      type="button"
                      onClick={() => onToggleStatus(msg._id, isUnread ? 'read' : 'unread')}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs transition-colors border cursor-pointer ${
                        isUnread
                          ? 'bg-slate-50 hover:bg-slate-200 text-slate-600 border-slate-200'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                      }`}
                      title={isUnread ? "Marquer comme lu" : "Marquer comme non lu"}
                    >
                      {isUnread ? <FaCheck size={12} /> : <FaEnvelope size={12} />}
                    </button>

                    {/* Supprimer */}
                    <button
                      type="button"
                      onClick={() => onDeleteMessage(msg._id)}
                      className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200/80 flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title="Supprimer ce message"
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
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Modal Détail Message */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMessage(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-left flex flex-col max-h-[90vh]"
            >
              {/* En-tête Modal */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-[#C4A47C] flex items-center justify-center text-base">
                    <FaCommentDots />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Détail de la <span className="text-[#C4A47C]">Demande</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">Reçu le {formatDate(selectedMessage.createdAt)}</p>
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

              {/* Corps Modal */}
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
                {/* Carte Expéditeur */}
                <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Coordonnées Client
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F8F5F0] text-[#9E7B4E] border border-[#E8DDD0] text-[10px] font-extrabold">
                      {selectedMessage.subject}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold">Nom complet</p>
                      <p className="text-sm font-bold text-slate-900">{selectedMessage.name}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold">Téléphone / WhatsApp</p>
                      <p className="text-sm font-bold text-slate-900">{selectedMessage.phone}</p>
                    </div>
                    {selectedMessage.email && (
                      <div className="sm:col-span-2">
                        <p className="text-[11px] text-slate-400 font-semibold">Adresse email</p>
                        <p className="text-xs font-semibold text-slate-700">{selectedMessage.email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenu du message */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Message transmis
                  </label>
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Boutons d'actions directes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <a
                    href={getWhatsAppLink(selectedMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <FaWhatsapp size={16} />
                    <span>Répondre sur WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="py-3 px-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <FaPhoneAlt size={12} />
                    <span>Appeler le client</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
