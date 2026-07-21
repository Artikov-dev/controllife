import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import { 
  Users, 
  UserMinus, 
  Search, 
  Coins, 
  Activity, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  Ban,
  Unlock
} from 'lucide-react';
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
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (isBlocked !== '') params.append('isBlocked', isBlocked);

      const res = await apiClient.get(`/api/admin/users?${params.toString()}`);
      return res.data.data;
    },
  });

  // Block/Unblock mutation
  const blockMutation = useMutation({
    mutationFn: async ({ id, isBlocked }: { id: number; isBlocked: boolean }) => {
      const res = await apiClient.patch(`/api/admin/users/${id}/block`, { isBlocked });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success(data.message || 'Muvaffaqiyatli bajarildi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  const handleToggleBlock = (userId: number, currentBlockStatus: boolean) => {
    if (userId === currentUser?.id) {
      toast.error("O'z hisobingizni bloklay olmaysiz!");
      return;
    }
    const actionText = currentBlockStatus ? "blokdan chiqarishni" : "bloklashni";
    if (window.confirm(`Haqiqatdan ham ushbu foydalanuvchini ${actionText} xohlaysizmi?`)) {
      blockMutation.mutate({ id: userId, isBlocked: !currentBlockStatus });
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + ' ' + (currentUser?.currency || 'UZS');
  };

  const usersList = usersResponse?.users || [];
  const activePage = usersResponse?.pagination?.page || 1;
  const totalPages = usersResponse?.pagination?.totalPages || 1;

  return (
    <div className="space-y-8">
      {/* Page Title Header */}
      <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <ShieldAlert className="h-6.5 w-6.5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-display">Tizim Ma'muri (Admin Panel)</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Platforma ko'rsatkichlari, foydalanuvchilar holati va xavfsizlik nazorati.</p>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white dark:bg-slate-900 animate-pulse rounded-2xl border border-slate-200/60 dark:border-slate-800/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat 1: Users */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/50 shadow-sm flex items-center space-x-4.5">
            <div className="h-11 w-11 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center flex-shrink-0">
              <Users className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jami A'zolar</span>
              <h2 className="text-2xl font-bold font-display mt-0.5 text-slate-900 dark:text-white">
                {stats?.totalUsers}
              </h2>
            </div>
          </div>

          {/* Stat 2: Total Volume */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/50 shadow-sm flex items-center space-x-4.5">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <Coins className="h-5.5 w-5.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tranzaksiyalar Hajmi</span>
              <h2 className="text-xl font-bold font-display mt-0.5 text-slate-900 dark:text-white truncate">
                {formatCurrency(stats?.totalTransactionVolume)}
              </h2>
            </div>
          </div>

          {/* Stat 3: Transaction Count */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/50 shadow-sm flex items-center space-x-4.5">
            <div className="h-11 w-11 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0">
              <Activity className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operatsiyalar Soni</span>
              <h2 className="text-2xl font-bold font-display mt-0.5 text-slate-900 dark:text-white">
                {stats?.totalTransactions}
              </h2>
            </div>
          </div>

          {/* Stat 4: Blocked Users */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/50 shadow-sm flex items-center space-x-4.5">
            <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
              <UserMinus className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bloklanganlar</span>
              <h2 className="text-2xl font-bold font-display mt-0.5 text-slate-900 dark:text-white">
                {stats?.totalBlockedUsers}
              </h2>
            </div>
          </div>
        </div>
      )}

      {/* Grid listing users */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/50 shadow-sm space-y-4">
        {/* Header and filters inside grid */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <h3 className="font-bold text-base">Tizim Foydalanuvchilari</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ism yoki email bo'yicha..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
              />
            </div>
            {/* Block status */}
            <select
              value={isBlocked}
              onChange={(e) => { setIsBlocked(e.target.value); setPage(1); }}
              className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
            >
              <option value="">Barcha holatlar</option>
              <option value="false">Faol a'zolar</option>
              <option value="true">Bloklanganlar</option>
            </select>
          </div>
        </div>

        {usersLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-xs text-slate-500">Yuklanmoqda...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                    <th className="pb-3 text-xs uppercase tracking-wider">Foydalanuvchi</th>
                    <th className="pb-3 text-xs uppercase tracking-wider">Rol</th>
                    <th className="pb-3 text-xs uppercase tracking-wider">Valyuta</th>
                    <th className="pb-3 text-xs uppercase tracking-wider">Sana (Ro'yxat)</th>
                    <th className="pb-3 text-xs uppercase tracking-wider">Holat</th>
                    <th className="pb-3 text-right text-xs uppercase tracking-wider">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {usersList.map((usr: any) => (
                    <tr key={usr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center space-x-3">
                          {usr.avatar ? (
                            <img src={usr.avatar} alt={usr.full_name} className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs flex items-center justify-center border border-slate-350">
                              {usr.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {usr.full_name}
                              {usr.id === currentUser?.id && (
                                <span className="text-[10px] bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold px-1.5 py-0.2 rounded">
                                  Men
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">{usr.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 capitalize">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          usr.role === 'admin' 
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                            : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-3.5 font-medium text-xs">
                        {usr.currency}
                      </td>
                      <td className="py-3.5 text-xs text-slate-500">
                        {new Date(usr.created_at).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          usr.is_blocked 
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {usr.is_blocked ? 'Bloklangan' : 'Faol'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {usr.id !== currentUser?.id && usr.role !== 'admin' ? (
                          <button
                            onClick={() => handleToggleBlock(usr.id, usr.is_blocked)}
                            disabled={blockMutation.isPending}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1 border ${
                              usr.is_blocked
                                ? 'border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                                : 'border-rose-200 dark:border-rose-900/40 hover:bg-rose-50/50 dark:hover:bg-rose-955/20 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {usr.is_blocked ? (
                              <>
                                <Unlock className="h-3.5 w-3.5" />
                                Ruxsat berish
                              </>
                            ) : (
                              <>
                                <Ban className="h-3.5 w-3.5" />
                                Bloklash
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Cheklangan</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <div className="text-xs text-slate-450">
                  Jami <span className="font-semibold text-slate-700 dark:text-slate-300">{usersResponse?.pagination?.total}</span> tadan 
                  <span className="font-semibold text-slate-700 dark:text-slate-300"> {(activePage - 1) * limit + 1} - {Math.min(activePage * limit, usersResponse?.pagination?.total)}</span>-oralig'i
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    disabled={activePage === 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-semibold px-2">
                    {activePage} / {totalPages}
                  </span>
                  <button
                    disabled={activePage === totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
