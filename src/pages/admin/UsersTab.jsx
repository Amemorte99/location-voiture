import { useState } from 'react';
import { FaSearch, FaTrash, FaEdit, FaDownload } from 'react-icons/fa';

const STATUS_ROLE_LABELS = { admin: 'Administrateur', user: 'Utilisateur' };

function exportCSV(users) {
  const headers = ['Nom', 'Email', 'Téléphone', 'Rôle', "Date d'inscription"];
  const rows = users.map(u => [
    u.name || '',
    u.email || '',
    u.phone || '',
    STATUS_ROLE_LABELS[u.role] || u.role || '',
    u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '',
  ]);
  const csvContent = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clients_locafes_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function UsersTab({
  users,
  searchTerm,
  setSearchTerm,
  handleToggleRole,
  handleDeleteUser,
  setEditingUser,
  setShowUserEditModal,
  page,
  totalPages,
  handlePageChange
}) {
  const [filterRole, setFilterRole] = useState('all');

  const filtered = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 text-left">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-[#111827]">
            Gestion <span className="text-[#C4A47C]">Clients</span>
          </h2>
          <p className="text-[#6B7280] text-xs font-medium mt-0.5">
            Comptes utilisateurs et droits d'accès
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Export CSV */}
          <button
            onClick={() => exportCSV(users)}
            className="px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all flex items-center gap-2 border border-emerald-100 shadow-sm"
          >
            <FaDownload size={11} /> Export CSV
          </button>

          {/* Recherche */}
          <div className="relative group min-w-[240px]">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Rechercher nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:border-[#C4A47C] transition-all outline-none font-medium shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#F9FAFB] p-1.5 rounded-xl border border-gray-100 self-start">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'user', label: 'Clients' },
          { key: 'admin', label: 'Administrateurs' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterRole(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterRole === tab.key
                ? 'bg-[#111827] text-white shadow-sm'
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
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Membre</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Email</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Téléphone</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Rôle</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Inscrit le</th>
                <th className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#6B7280] font-medium text-sm">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user._id} className="hover:bg-[#F9FAFB] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-[#111827] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                          {(user.name?.charAt(0) || user.email?.charAt(0) || '?').toUpperCase()}
                        </div>
                        <span className="font-bold text-sm text-[#111827] whitespace-nowrap">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-[#6B7280]">{user.email}</td>
                    <td className="px-6 py-4 text-xs font-medium text-[#6B7280]">{user.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleRole(user)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all ${
                          user.role === 'admin'
                            ? 'bg-[#111827] text-white shadow-sm'
                            : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
                        }`}
                      >
                        {STATUS_ROLE_LABELS[user.role] || user.role}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-semibold text-[#6B7280]">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => { setEditingUser(user); setShowUserEditModal(true); }}
                          className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-[#111827] hover:text-white transition-all border border-gray-100"
                          title="Modifier"
                        >
                          <FaEdit size={12} />
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user._id || user.id)}
                            className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
                            title="Supprimer"
                          >
                            <FaTrash size={12} />
                          </button>
                        )}
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
            <p className="text-xs font-medium text-[#6B7280]">
              Page <span className="font-bold text-[#111827]">{page}</span> sur <span className="font-bold text-[#111827]">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:border-[#C4A47C] hover:text-[#C4A47C] disabled:opacity-50 transition-all">
                Précédent
              </button>
              <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1.5 bg-[#111827] text-white rounded-lg text-xs font-bold hover:bg-black disabled:opacity-50 transition-all">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
