import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import {
  People as PeopleIcon,
  GroupRemove as GroupRemoveIcon,
  Search as SearchIcon,
  MonetizationOn as MonetizationOnIcon,
  QueryStats as QueryStatsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Block as BlockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Filters
  const [search, setSearch] = useState('');
  const [isBlocked, setIsBlocked] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await apiClient.get('/api/admin/stats');
      return res.data.data;
    },
  });

  // Fetch users grid
  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers', page, search, isBlocked],
    queryFn: async () => {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (isBlocked !== '') params.is_blocked = isBlocked;

      const res = await apiClient.get('/api/admin/users', { params });
      return res.data.data;
    },
  });

  // Block/Unblock user mutation
  const blockMutation = useMutation({
    mutationFn: async ({ id, is_blocked }: { id: number; is_blocked: boolean }) => {
      const res = await apiClient.patch(`/api/admin/users/${id}/block`, { is_blocked });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success(variables.is_blocked ? 'Foydalanuvchi bloklandi' : 'Foydalanuvchi blokdan chiqarildi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Amalni bajarishda xatolik');
    },
  });

  const handleToggleBlock = (user: any) => {
    if (user.id === currentUser?.id) {
      toast.error('O\'zingizning hisobingizni bloklay olmaysiz');
      return;
    }
    const nextState = !user.is_blocked;
    const actionText = nextState ? 'bloklamoqchimisiz' : 'blokdan chiqarmoqchimisiz';
    if (confirm(`Rostdan ham ${user.full_name} foydalanuvchisini ${actionText}?`)) {
      blockMutation.mutate({ id: user.id, is_blocked: nextState });
    }
  };

  const usersList = usersResponse?.users || [];
  const pagination = usersResponse?.pagination;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16161E] p-6 rounded-2xl border border-amber-500/20 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight font-display text-white">Admin Boshqaruv Paneli 🟡</h1>
          <p className="text-sm text-slate-400">Tizim foydalanuvchilari va umumiy platforma ko'rsatkichlari nazorati.</p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#FBBF24]/10 border border-amber-500/30 text-[#FBBF24] text-xs font-bold">
          <AdminPanelSettingsIcon style={{ fontSize: 18 }} />
          <span>Admin Huquqi Faol</span>
        </div>
      </div>

      {/* Global Platform Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1: Total Users */}
        <div className="p-6 rounded-2xl bg-[#18181B] border border-amber-500/20 shadow-sm flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-[#FBBF24]/15 text-[#FBBF24] flex items-center justify-center flex-shrink-0">
            <PeopleIcon style={{ fontSize: 24 }} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jami Foydalanuvchilar</span>
            <h3 className="text-2xl font-black font-display text-white mt-0.5">
              {statsLoading ? '...' : stats?.totalUsers || 0}
            </h3>
          </div>
        </div>

        {/* Stat 2: Active Users */}
        <div className="p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 shadow-sm flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <QueryStatsIcon style={{ fontSize: 24 }} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faol Hisoblar</span>
            <h3 className="text-2xl font-black font-display text-white mt-0.5">
              {statsLoading ? '...' : stats?.activeUsers || 0}
            </h3>
          </div>
        </div>

        {/* Stat 3: Blocked Users */}
        <div className="p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 shadow-sm flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
            <GroupRemoveIcon style={{ fontSize: 24 }} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bloklanganlar</span>
            <h3 className="text-2xl font-black font-display text-white mt-0.5">
              {statsLoading ? '...' : stats?.blockedUsers || 0}
            </h3>
          </div>
        </div>

        {/* Stat 4: Total System Transactions */}
        <div className="p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 shadow-sm flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
            <MonetizationOnIcon style={{ fontSize: 24 }} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tizim Tranzaksiyalari</span>
            <h3 className="text-2xl font-black font-display text-white mt-0.5">
              {statsLoading ? '...' : stats?.totalTransactions || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Users Control Table */}
      <div className="p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-[#FBBF24]">Foydalanuvchilar Ro'yxati</h3>
            <p className="text-xs text-slate-400">Hisoblarni bloklash yoki cheklovlarni boshqarish</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <SearchIcon style={{ fontSize: 18 }} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Ism yoki email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-amber-500/30 bg-[#111111] text-white focus:outline-none focus:border-[#FBBF24]"
              />
            </div>

            {/* Blocked Filter */}
            <select
              value={isBlocked}
              onChange={(e) => { setIsBlocked(e.target.value); setPage(1); }}
              className="px-4 py-2 text-sm rounded-xl border border-amber-500/30 bg-[#111111] text-white focus:outline-none focus:border-[#FBBF24] w-full sm:w-auto"
            >
              <option value="">Barcha maqomlar</option>
              <option value="false">Faol</option>
              <option value="true">Bloklangan</option>
            </select>
          </div>
        </div>

        {usersLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <div className="h-8 w-8 border-4 border-[#FBBF24] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400">Foydalanuvchilar yuklanmoqda...</p>
          </div>
        ) : usersList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-amber-500/20 bg-black/40 text-xs font-bold text-[#FBBF24] uppercase">
                  <th className="py-4 px-6">Foydalanuvchi</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Roli</th>
                  <th className="py-4 px-6">Holati</th>
                  <th className="py-4 px-6 text-center">Boshqaruv</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {usersList.map((u: any) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      <div className="flex items-center space-x-3">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.full_name} className="h-9 w-9 rounded-full border border-amber-500/30 object-cover" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-[#FBBF24] text-[#111111] font-bold flex items-center justify-center text-xs">
                            {u.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div>{u.full_name}</div>
                          {u.id === currentUser?.id && (
                            <span className="text-[10px] bg-[#FBBF24]/20 text-[#FBBF24] font-bold px-1.5 py-0.2 rounded">
                              (Siz)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-medium">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                        u.role === 'admin' 
                          ? 'bg-amber-500/10 text-[#FBBF24] border border-amber-500/30' 
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {u.is_blocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <BlockIcon style={{ fontSize: 14 }} /> Bloklangan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <LockOpenIcon style={{ fontSize: 14 }} /> Faol
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        disabled={u.id === currentUser?.id || blockMutation.isPending}
                        onClick={() => handleToggleBlock(u)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 ${
                          u.is_blocked
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {u.is_blocked ? 'Blokdan chiqarish' : 'Bloklash'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            Foydalanuvchilar topilmadi.
          </div>
        )}

        {/* Pagination */}
        {pagination && (
          <div className="p-4 border-t border-amber-500/20 bg-black/40 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Jami: <b className="text-white">{pagination.totalItems}</b> foydalanuvchi
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-lg border border-amber-500/20 disabled:opacity-40 hover:bg-white/5 text-white"
              >
                <ChevronLeftIcon style={{ fontSize: 18 }} />
              </button>
              <span className="text-xs font-bold text-[#FBBF24] px-2">
                {page} / {pagination.totalPages || 1}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg border border-amber-500/20 disabled:opacity-40 hover:bg-white/5 text-white"
              >
                <ChevronRightIcon style={{ fontSize: 18 }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
