import { useState } from 'react';
import { FaSearch, FaTrash, FaPlus, FaEdit, FaTable, FaTh, FaDownload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveImageUrl } from '../../utils/imageUrl';

function exportCSV(cars) {
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
  const csvContent = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `parc_auto_locafes_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CarsTab({
  cars,
  searchTerm,
  setSearchTerm,
  setShowAddModal,
  handleToggleAvailability,
  handleDeleteCar,
  setEditingCar,
  setShowEditModal,
  page,
  totalPages,
  handlePageChange
}) {
  const [viewMode, setViewMode] = useState('table'); 
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = cars.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === 'available') {
      matchesStatus = c.available && c.isAvailableNow;
    } else if (filterStatus === 'booked') {
      matchesStatus = c.available && !c.isAvailableNow;
    } else if (filterStatus === 'offline') {
      matchesStatus = !c.available;
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-[#111827]">
            Gestion <span className="text-[#E3383C]">Voitures</span>
          </h2>
          <p className="text-[#6B7280] text-xs font-medium mt-0.5">
            Administration du parc automobile et disponibilités
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Ajouter véhicule */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#0F2F75] text-white rounded-xl font-bold text-xs shadow-sm hover:bg-[#0A2463] transition-colors flex items-center gap-2"
          >
            <FaPlus size={11} /> Nouveau Véhicule
          </button>

          {/* Export CSV */}
          <button
            onClick={() => exportCSV(cars)}
            className="px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all flex items-center gap-2 border border-emerald-100 shadow-sm"
          >
            <FaDownload size={11} /> CSV
          </button>

          {/* Bascule Vue */}
          <div className="flex items-center gap-1 bg-[#F9FAFB] p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-[#0F2F75] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'}`}
              title="Vue tableau"
            >
              <FaTable size={13} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#0F2F75] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'}`}
              title="Vue grille"
            >
              <FaTh size={13} />
            </button>
          </div>

          {/* Recherche */}
          <div className="relative group min-w-[220px]">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Rechercher modèle ou marque..."
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
          { key: 'available', label: 'Disponibles' },
          { key: 'booked', label: 'Réservés' },
          { key: 'offline', label: 'Hors Service' },
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

      <AnimatePresence mode="wait">
        {}
        {viewMode === 'table' && (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100"
          >
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-gray-50">
                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Véhicule</th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Config</th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Tarif / jour</th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Statut</th>
                    <th className="px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-10 py-16 text-center text-[#6B7280] font-bold text-sm">
                        Aucun véhicule trouvé.
                      </td>
                    </tr>
                  ) : (
                    filtered.map(car => (
                      <tr key={car._id || car.id} className="hover:bg-[#F9FAFB] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-14 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 shrink-0">
                              <img src={resolveImageUrl(car.image)} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-[#111827] text-sm">{car.name}</p>
                              <p className="text-[11px] font-semibold text-[#E3383C]">{car.brand || 'Premium'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-semibold text-[#111827]">{car.year} · {car.gearbox}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-base font-bold text-[#111827]">{car.price}</span>
                          <span className="text-[11px] text-[#6B7280] ml-1">DH/j</span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleAvailability(car)}
                            className={`px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.11em] border transition-all inline-flex items-center gap-1.5 ${
                              !car.available 
                                ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' 
                                : !car.isAvailableNow 
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              !car.available ? 'bg-rose-500' : !car.isAvailableNow ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                            {!car.available 
                              ? 'Hors Service' 
                              : !car.isAvailableNow 
                                ? 'Réservé' 
                                : 'Disponible'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => { setEditingCar(car); setShowEditModal(true); }}
                              className="p-3 bg-[#EEF3FB] text-[#E3383C] rounded-xl hover:bg-[#E3383C] hover:text-white transition-all shadow-sm"
                              title="Modifier"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteCar(car._id || car.id)}
                              className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                              title="Supprimer"
                            >
                              <FaTrash size={14} />
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
              <div className="px-10 py-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">
                  Page <span className="text-[#E3383C]">{page}</span> sur <span className="text-[#111827]">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[#E3383C] hover:text-[#E3383C] disabled:opacity-50 transition-all">
                    Précédent
                  </button>
                  <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="px-4 py-2 bg-[#0F2F75] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 hover:scale-105 disabled:opacity-50 transition-all">
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {}
        {viewMode === 'grid' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-[#6B7280] font-medium text-sm border border-gray-200/80 shadow-sm">
                Aucun véhicule trouvé.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(car => (
                  <motion.div
                    key={car._id || car.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200/80 hover:shadow-md transition-all group flex flex-col"
                  >
                    <div className="relative h-44 overflow-hidden bg-gray-50">
                      <img
                        src={resolveImageUrl(car.image)}
                        alt={car.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => handleToggleAvailability(car)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider backdrop-blur-md border transition-all inline-flex items-center gap-1.5 ${
                            car.available
                              ? 'bg-emerald-500/90 text-white border-emerald-400'
                              : 'bg-rose-500/90 text-white border-rose-400'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${car.available ? 'bg-white' : 'bg-rose-200'}`} />
                          {car.available ? 'Disponible' : 'Indisponible'}
                        </button>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-[#E3383C] uppercase tracking-wider mb-0.5">{car.brand}</p>
                        <h4 className="text-base font-bold text-[#111827] mb-3">{car.name}</h4>

                        <div className="flex items-center gap-3 text-xs text-[#6B7280] mb-4">
                          <span className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 font-medium">
                            {car.year}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 font-medium">
                            {car.fuel}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 font-medium">
                            {car.gearbox}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-[#111827]">{car.price}</span>
                          <span className="text-xs text-[#6B7280] font-normal ml-1">DH / jour</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => { setEditingCar(car); setShowEditModal(true); }}
                            className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-[#0F2F75] hover:text-white transition-all border border-gray-100"
                            title="Modifier"
                          >
                            <FaEdit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteCar(car._id)}
                            className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
                            title="Supprimer"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-200/80">
                <p className="text-xs font-medium text-[#6B7280]">
                  Page <span className="font-bold text-[#111827]">{page}</span> sur <span className="font-bold text-[#111827]">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:border-[#E3383C] hover:text-[#E3383C] disabled:opacity-50 transition-all">
                    Précédent
                  </button>
                  <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1.5 bg-[#0F2F75] text-white rounded-lg text-xs font-bold hover:bg-[#0A2463] disabled:opacity-50 transition-all">
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
