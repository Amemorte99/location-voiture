import { useState } from 'react';
import { FaSearch, FaCheck, FaTimes, FaTrash, FaFilePdf, FaDownload, FaPlane, FaHotel, FaMapMarkerAlt, FaClock, FaWhatsapp, FaUserTie, FaChevronDown } from 'react-icons/fa';
import generateInvoicePDF, { generateInvoicePDF as namedGenerateInvoicePDF } from '../../utils/generatePDF';
import { resolveImageUrl } from '../../utils/imageUrl';

import { STATUS_LABELS, STATUS_STYLES } from '../../utils/constants';

const handleOpenInvoice = (booking) => {
  const fn = typeof generateInvoicePDF === 'function' 
    ? generateInvoicePDF 
    : (typeof namedGenerateInvoicePDF === 'function' ? namedGenerateInvoicePDF : null);
  if (typeof fn === 'function') {
    fn(booking);
  }
};

function exportCSV(bookings) {
  const headers = ['Conducteur', 'Téléphone', 'Véhicule', 'Chauffeur Assigné', 'Lieu Prise en Charge', 'Heure', 'Vol / Adresse', 'Instructions Livreur', 'Début', 'Fin', 'Montant (DH)', 'Statut', 'Paiement'];
  const rows = bookings.map(b => [
    b.fullName || '',
    b.phone || '',
    b.car?.name || '',
    b.assignedDriver?.name || 'Non assigné',
    b.pickupLocation || '',
    b.pickupTime || '',
    b.flightNumber || b.deliveryAddress || '',
    b.deliveryNotes || '',
    b.startDate ? new Date(b.startDate).toLocaleDateString('fr-FR') : '',
    b.endDate ? new Date(b.endDate).toLocaleDateString('fr-FR') : '',
    b.totalPrice || '',
    STATUS_LABELS[b.status] || b.status || '',
    b.paymentMethod === 'card' ? 'Carte' : 'Espèces',
  ]);
  const csvContent = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reservations_locafes_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BookingsTab({
  bookings,
  drivers = [],
  onAssignDriver,
  searchTerm,
  setSearchTerm,
  setSelectedBooking,
  setShowDetailModal,
  handleUpdateBooking,
  handleDeleteBooking,
  page,
  totalPages,
  handlePageChange
}) {
  const getStatusBadge = (status) => (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );

  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = bookings.filter(b => {
    const matchesSearch = b.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.car?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-[#111827]">
            Gestion <span className="text-[#E3383C]">Réservations</span>
          </h2>
          <p className="text-[#6B7280] text-xs font-medium mt-0.5">
            Suivi des contrats et demandes de location
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Export CSV */}
          <button
            onClick={() => exportCSV(bookings)}
            className="px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all flex items-center gap-2 border border-emerald-100 shadow-sm"
          >
            <FaDownload size={11} /> Export CSV
          </button>

          {/* Recherche */}
          <div className="relative group min-w-[240px]">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Rechercher client ou voiture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:border-[#E3383C] transition-all outline-none font-medium shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#F9FAFB] p-1.5 rounded-xl border border-gray-100 self-start">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'pending', label: 'En attente' },
          { key: 'confirmed', label: 'Confirmés' },
          { key: 'completed', label: 'Terminés' },
          { key: 'cancelled', label: 'Annulés' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === tab.key
                ? 'bg-[#0F2F75] text-white shadow-sm'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-gray-100">
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Conducteur</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Véhicule</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400 min-w-[210px]">Lieu & Livraison</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Période & Montant</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Statut</th>
                <th className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#6B7280] font-medium text-sm">
                    Aucune réservation trouvée.
                  </td>
                </tr>
              ) : (
                filtered.map(booking => (
                  <tr
                    key={booking._id}
                    className="hover:bg-[#F9FAFB] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4" onClick={() => { setSelectedBooking(booking); setShowDetailModal(true); }}>
                      <p className="font-bold text-sm text-[#111827]">{booking.fullName}</p>
                      <p className="text-xs text-[#6B7280]">{booking.phone}</p>
                    </td>
                    <td className="px-6 py-4" onClick={() => { setSelectedBooking(booking); setShowDetailModal(true); }}>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg bg-gray-50 overflow-hidden border border-gray-100 shrink-0">
                          <img src={resolveImageUrl(booking.car?.image)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-bold text-[#111827]">{booking.car?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 min-w-[210px]" onClick={() => { setSelectedBooking(booking); setShowDetailModal(true); }}>
                      {booking.pickupLocation?.includes('Aéroport') ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                            <FaPlane size={9} /> Aéroport Fès
                          </span>
                          {booking.flightNumber && (
                            <p className="text-xs font-bold text-gray-800">Vol : <span className="text-[#E3383C]">{booking.flightNumber}</span></p>
                          )}
                          {booking.pickupTime && (
                            <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                              <FaClock size={8} /> {booking.pickupTime}
                            </p>
                          )}
                        </div>
                      ) : (booking.pickupLocation?.includes('Hôtel') || booking.pickupLocation?.includes('Riad')) ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">
                            <FaHotel size={9} /> Hôtel / Riad
                          </span>
                          {booking.deliveryAddress && (
                            <p className="text-xs font-bold text-gray-800 truncate max-w-[150px]" title={booking.deliveryAddress}>
                              {booking.deliveryAddress}
                            </p>
                          )}
                          {booking.pickupTime && (
                            <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                              <FaClock size={8} /> {booking.pickupTime}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-bold border border-gray-200">
                            <FaMapMarkerAlt size={9} /> {booking.pickupLocation || 'Agence Atlas'}
                          </span>
                          {booking.pickupTime && (
                            <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                              <FaClock size={8} /> {booking.pickupTime}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Chauffeur assigné */}
                      <div className="mt-2.5 pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                        <div className="relative w-full max-w-[210px]">
                          <select
                            value={booking.assignedDriver?._id || booking.assignedDriver || ''}
                            onChange={(e) => onAssignDriver && onAssignDriver(booking._id, e.target.value || null)}
                            className={`w-full text-[11px] py-1.5 pl-6 pr-6 rounded-lg font-bold border transition-all cursor-pointer truncate appearance-none outline-none ${
                              booking.assignedDriver
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70 focus:border-emerald-400'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800 focus:border-[#E3383C]'
                            }`}
                            title={booking.assignedDriver ? `Chauffeur assigné : ${booking.assignedDriver.name}` : "Assigner un chauffeur"}
                          >
                            <option value="">{booking.assignedDriver ? '— Désassigner chauffeur —' : '+ Assigner chauffeur...'}</option>
                            {drivers.map(d => (
                              <option key={d._id} value={d._id}>
                                {d.name} ({d.status === 'disponible' ? 'Dispo' : d.status === 'en_mission' ? 'Mission' : 'Repos'})
                              </option>
                            ))}
                            {booking.assignedDriver && !drivers.some(d => d._id === (booking.assignedDriver?._id || booking.assignedDriver)) && (
                              <option value={booking.assignedDriver?._id || booking.assignedDriver}>
                                {booking.assignedDriver.name || 'Chauffeur assigné'}
                              </option>
                            )}
                          </select>

                          {/* Pastille de statut */}
                          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              booking.assignedDriver ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                            }`} />
                          </div>

                          {/* Flèche chevron */}
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <FaChevronDown size={8} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4" onClick={() => { setSelectedBooking(booking); setShowDetailModal(true); }}>
                      <p className="text-xs font-medium text-gray-600 mb-0.5">
                        {new Date(booking.startDate).toLocaleDateString('fr-FR')} — {new Date(booking.endDate).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm font-bold text-[#E3383C]">
                        {Number(booking.totalPrice || 0).toLocaleString('fr-FR')} DH
                      </p>
                    </td>
                    <td className="px-6 py-4" onClick={() => { setSelectedBooking(booking); setShowDetailModal(true); }}>
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {booking.status !== 'cancelled' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenInvoice(booking); }}
                            className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-[#0F2F75] hover:text-white transition-all border border-gray-100 cursor-pointer"
                            title="Ouvrir la Facture & Contrat PDF"
                          >
                            <FaFilePdf size={13} />
                          </button>
                        )}
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateBooking(booking._id || booking.id, 'confirmed'); }}
                              className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                              title="Confirmer la réservation"
                            >
                              <FaCheck size={13} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateBooking(booking._id || booking.id, 'cancelled'); }}
                              className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                              title="Refuser / Annuler"
                            >
                              <FaTimes size={13} />
                            </button>
                          </>
                        )}

                        {/* WhatsApp Mission Chauffeur */}
                        {booking.assignedDriver ? (
                          <a
                            href={`https://wa.me/${
                              booking.assignedDriver.whatsapp || booking.assignedDriver.phone?.replace(/[^0-9]/g, '')
                            }?text=${encodeURIComponent(
                              `MISSION LOCAFÈS — ${booking.assignedDriver.name}\n` +
                              `Véhicule : ${booking.car?.name || 'Véhicule'}\n` +
                              `Client : ${booking.fullName}\n` +
                              `Téléphone : ${booking.phone}\n` +
                              `Lieu de rendez-vous : ${booking.pickupLocation || 'Agence Quartier Atlas'}` +
                              (booking.flightNumber ? ` (Vol : ${booking.flightNumber})` : '') +
                              (booking.deliveryAddress ? ` - Adresse : ${booking.deliveryAddress}` : '') + `\n` +
                              `Date & Heure : ${new Date(booking.startDate).toLocaleDateString('fr-FR')} à ${booking.pickupTime || 'Heure convenue'}\n` +
                              `Montant : ${booking.totalPrice} DH (${booking.paymentMethod === 'card' ? 'Payé par carte' : 'Espèces à encaisser'})` +
                              (booking.deliveryNotes ? `\nConsignes : ${booking.deliveryNotes}` : '')
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-sm"
                            title={`Envoyer l'ordre de mission WhatsApp à ${booking.assignedDriver.name}`}
                          >
                            <FaWhatsapp size={13} />
                          </a>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(booking);
                              setShowDetailModal(true);
                            }}
                            className="p-2 bg-gray-50 text-gray-400 hover:text-[#E3383C] hover:bg-amber-50 rounded-lg transition-all border border-gray-100"
                            title="Assigner un chauffeur pour cette livraison"
                          >
                            <FaUserTie size={12} />
                          </button>
                        )}

                        <a
                          href={`https://wa.me/${booking.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Bonjour ${booking.fullName}, votre réservation LocaFès pour la ${booking.car?.name || 'voiture'} est bien enregistrée.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-all border border-gray-100"
                          title="Message WhatsApp client"
                        >
                          <FaWhatsapp size={13} />
                        </a>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteBooking(booking._id || booking.id); }}
                          className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:text-rose-500 transition-all border border-gray-100"
                          title="Supprimer"
                        >
                          <FaTrash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">
              Page <span className="text-[#E3383C]">{page}</span> sur <span className="text-[#111827]">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[#E3383C] hover:text-[#E3383C] disabled:opacity-50 disabled:hover:border-gray-100 disabled:hover:text-[#6B7280] transition-all"
              >
                Précédent
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-[#0F2F75] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
