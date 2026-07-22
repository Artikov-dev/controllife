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
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch admin stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/api/admin/stats');
      return res.data.data;
    },
  });

  // Fetch users list
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      const params: any = { page, limit };
      if (search) params.search = search;
      const res = await apiClient.get('/api/admin/users', { params });
      return res.data.data;
    },
  });

  // Toggle Block Mutation
  const toggleBlockMutation = useMutation({
    mutationFn: async ({ id, is_blocked }: { id: number; is_blocked: boolean }) => {
      const res = await apiClient.patch(`/api/admin/users/${id}/block`, { is_blocked });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Foydalanuvchi holati o\'zgartirildi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  const handleToggleBlock = (userId: number, currentBlocked: boolean) => {
    if (confirm(`Rostdan ham ushbu foydalanuvchini ${currentBlocked ? 'blokdan chiqarmoqchimisiz' : 'bloklamoqchimisiz'}?`)) {
      toggleBlockMutation.mutate({ id: userId, is_blocked: !currentBlocked });
    }
  };

  const usersList = usersData?.users || [];

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 text-center bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-500/20">
        Ruxsat yo'q! Ushbu sahifaga faqat Adminlar kira oladi.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#16161E] p-6 rounded-2xl border border-amber-500/20 shadow-sm dark:shadow-xl">
        <div>
          <h1 className="text-2xl font-black tracking-tight font-display text-slate-900 dark:text-white">Admin Boshqaruv Paneli 🟡</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tizim foydalanuvchilari va umumiy platforma ko'rsatkichlari nazorati.</p>
        </div>
        <div className="flex items-center space-x-2 bg-[#F59E0B]/10 text-[#D97706] dark:text-[#FCD34D] px-4 py-2 rounded-xl border border-amber-500/20 font-bold text-xs">
          <AdminPanelSettingsIcon style={{ fontSize: 20 }} />
          <span>Tizim Nazoratchisi</span>
        </div>
      </div>

      {/* System Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1: Total Users */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#16161E] border border-amber-500/20 shadow-sm flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-[#F59E0B]/15 text-[#D97706] dark:text-[#FCD34D] flex items-center justify-center flex-shrink-0">
            <PeopleIcon style={{ fontSize: 24 }} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Jami Foydalanuvchilar</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {statsLoading ? '...' : statsData?.totalUsers || 0}
            </h2>
          </div>
        </div>

        {/* Stat 2: Active Users */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#16161E] border border-amber-500/20 shadow-sm flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <QueryStatsIcon style={{ fontSize: 24 }} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Faol Foydalanuvchilar</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {statsLoading ? '...' : statsData?.activeUsers || 0}
            </h2>
          </div>
        </div>

        {/* Stat 3: Blocked Users */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#16161E] border border-amber-500/20 shadow-sm flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
            <GroupRemoveIcon style={{ fontSize: 24 }} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Bloklanganlar</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {statsLoading ? '...' : statsData?.blockedUsers || 0}
            </h2>
          </div>
        </div>

        {/* Stat 4: Total System Transactions */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#16161E] border border-amber-500/20 shadow-sm flex items-center space-x-4">
          <div className="h-11 w-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
            <MonetizationOnIcon style={{ fontSize: 24 }} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Jami Tranzaksiyalar</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {statsLoading ? '...' : statsData?.totalTransactions || 0}
            </h2>
          </div>
        </div>
      </div>

      {/* Users Control Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#16161E] border border-amber-500/20 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-[#D97706] dark:text-[#FCD34D]">Foydalanuvchilar Ro'yxati</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Hisoblarni bloklash va boshqarish</p>
          </div>

          <div className="relative w-full sm:w-64">
            <SearchIcon style={{ fontSize: 18 }} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Foydalanuvchi qidirish..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-amber-500/30 bg-slate-50 dark:bg-[#0B0B0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#F59E0B]"
            />
          </div>
        </div>

        {usersLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <div className="h-8 w-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Foydalanuvchilar yuklanmoqda...</p>
          </div>
        ) : usersList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-amber-500/20 bg-slate-100/80 dark:bg-[#0B0B0E]/60 text-xs font-bold text-[#D97706] dark:text-[#FCD34D] uppercase">
                  <th className="py-4 px-6">Foydalanuvchi</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Roli</th>
                  <th className="py-4 px-6">Ro'yxatdan o'tgan</th>
                  <th className="py-4 px-6 text-center">Holati / Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {usersList.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center space-x-3">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.full_name} className="h-8 w-8 rounded-full border border-[#F59E0B] object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded-full gold-gradient text-white dark:text-[#0B0B0E] flex items-center justify-center text-xs font-black">
                            {u.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{u.full_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        u.role === 'admin'
                          ? 'bg-amber-500/20 text-[#D97706] dark:text-[#FCD34D] border border-amber-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                      {new Date(u.created_at).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {u.role !== 'admin' ? (
                        <button
                          onClick={() => handleToggleBlock(u.id, u.is_blocked)}
                          disabled={toggleBlockMutation.isPending}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 mx-auto ${
                            u.is_blocked
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 border border-rose-500/30'
                          }`}
                        >
                          {u.is_blocked ? (
                            <>
                              <LockOpenIcon style={{ fontSize: 16 }} />
                              Blokdan chiqarish
                            </>
                          ) : (
                            <>
                              <BlockIcon style={{ fontSize: 16 }} />
                              Bloklash
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Himoyalangan</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">Foydalanuvchilar topilmadi.</div>
        )}

        {/* Pagination Controls */}
        {usersData?.pagination && (
          <div className="p-4 border-t border-amber-500/20 bg-slate-50 dark:bg-[#0B0B0E]/60 flex items-center justify-between rounded-xl">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Jami: <b className="text-slate-900 dark:text-white">{usersData.pagination.totalItems}</b> ta foydalanuvchi
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-lg border border-amber-500/20 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-900 dark:text-white"
              >
                <ChevronLeftIcon style={{ fontSize: 18 }} />
              </button>
              <span className="text-xs font-bold text-[#D97706] dark:text-[#FCD34D] px-2">
                {page} / {usersData.pagination.totalPages || 1}
              </span>
              <button
                disabled={page >= usersData.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg border border-amber-500/20 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-900 dark:text-white"
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
