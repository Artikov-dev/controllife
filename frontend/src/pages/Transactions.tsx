import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Loader2,
  ArrowRightLeft
} from 'lucide-react';
import { toast } from 'sonner';

export default function Transactions() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [sort, setSort] = useState('date_desc');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Edit / Add modal states
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<any>(null);

  // Form states for transaction operations
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch transactions with current query parameters
  const { data: txResponse, isLoading: txLoading } = useQuery({
    queryKey: ['transactions', page, type, categoryId, search, month, year, sort],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (type) params.append('type', type);
      if (categoryId) params.append('category_id', categoryId);
      if (search) params.append('search', search);
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      if (sort) params.append('sort', sort);

      const res = await apiClient.get(`/api/transactions?${params.toString()}`);
      return res.data.data;
    },
  });

  // Fetch categories for filter dropdowns and forms
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/api/categories');
      return res.data.data;
    },
  });

  // Create transaction mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/api/transactions', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setAddOpen(false);
      resetForm();
      if (data.data.budgetWarning) {
        toast.warning(data.data.budgetWarning.message, { duration: 6000 });
      } else {
        toast.success('Tranzaksiya muvaffaqiyatli saqlandi!');
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Saqlashda xatolik yuz berdi');
    },
  });

  // Update transaction mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      const res = await apiClient.put(`/api/transactions/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setEditOpen(false);
      setEditingTx(null);
      resetForm();
      toast.success('Tranzaksiya muvaffaqiyatli yangilandi!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Yangilashda xatolik yuz berdi');
    },
  });

  // Delete transaction mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Tranzaksiya muvaffaqiyatli o\'chirildi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'O\'chirishda xatolik yuz berdi');
    },
  });

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDescription('');
    setTxType('expense');
    setFormCategoryId('');
    setTxDate(new Date().toISOString().split('T')[0]);
  };

  const handleOpenAdd = () => {
    resetForm();
    setAddOpen(true);
  };

  const handleOpenEdit = (tx: any) => {
    setEditingTx(tx);
    setTitle(tx.title);
    setAmount(tx.amount);
    setDescription(tx.description || '');
    setTxType(tx.type);
    setFormCategoryId(tx.category_id.toString());
    setTxDate(tx.transaction_date.substring(0, 10)); // extract YYYY-MM-DD
    setEditOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !formCategoryId || !txDate) {
      toast.error('Barcha majburiy maydonlarni to\'ldiring');
      return;
    }
    const payload = {
      title,
      amount: parseFloat(amount),
      description: description || null,
      transaction_date: txDate,
      type: txType,
      category_id: parseInt(formCategoryId, 10),
    };

    if (editOpen && editingTx) {
      updateMutation.mutate({ id: editingTx.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Haqiqatdan ham ushbu tranzaksiyani o\'chirmoqchimisiz?')) {
      deleteMutation.mutate(id);
    }
  };

  const currencySymbol = user?.currency || 'UZS';
  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('uz-UZ').format(num) + ' ' + currencySymbol;
  };

  const activePage = txResponse?.pagination?.page || 1;
  const totalPages = txResponse?.pagination?.totalPages || 1;
  const transactionsList = txResponse?.transactions || [];

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display">Tranzaksiyalar Boshqaruvi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Barcha kirim va chiqim operatsiyalaringiz ro'yxati va filtri.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-lg shadow-orange-500/15 transition-all duration-150 w-full sm:w-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Yangi tranzaksiya
        </button>
      </div>

      {/* Filter panel */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/50 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-400 border-b border-slate-100 dark:border-slate-855 pb-3">
          <Filter className="h-4.5 w-4.5" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Saralash va Filtrlash</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Qidiruv..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
            />
          </div>

          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setCategoryId(''); setPage(1); }}
            className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
          >
            <option value="">Barcha turlar</option>
            <option value="income">Kirim</option>
            <option value="expense">Chiqim</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
            className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
          >
            <option value="">Barcha toifalar</option>
            {categories
              ?.filter((c: any) => !type || c.type === type)
              .map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.type === 'income' ? 'Kirim' : 'Chiqim'})
                </option>
              ))}
          </select>

          {/* Month Filter */}
          <select
            value={month}
            onChange={(e) => { setMonth(e.target.value); setPage(1); }}
            className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
          >
            <option value="">Barcha oylar</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('uz-UZ', { month: 'long' })}
              </option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={year}
            onChange={(e) => { setYear(e.target.value); setPage(1); }}
            className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
          >
            <option value="">Barcha yillar</option>
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Sort Filter */}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
          >
            <option value="date_desc">Sana (Yangi-Eski)</option>
            <option value="date_asc">Sana (Eski-Yangi)</option>
            <option value="amount_desc">Miqdor (Katta-Kichik)</option>
            <option value="amount_asc">Miqdor (Kichik-Katta)</option>
            <option value="title_asc">Nomi (A-Z)</option>
            <option value="title_desc">Nomi (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Main Table card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/50 shadow-sm space-y-4">
        {txLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-xs text-slate-500">Yuklanmoqda...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              {transactionsList.length > 0 ? (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                      <th className="pb-3 text-xs uppercase tracking-wider">Nomi</th>
                      <th className="pb-3 text-xs uppercase tracking-wider">Turi</th>
                      <th className="pb-3 text-xs uppercase tracking-wider">Toifasi</th>
                      <th className="pb-3 text-xs uppercase tracking-wider">Sanasi</th>
                      <th className="pb-3 text-right text-xs uppercase tracking-wider">Miqdori</th>
                      <th className="pb-3 text-right text-xs uppercase tracking-wider">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {transactionsList.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 font-medium max-w-[220px] truncate">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{tx.title}</div>
                            {tx.description && <div className="text-xs text-slate-400 font-normal truncate">{tx.description}</div>}
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            tx.type === 'income' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}>
                            {tx.type === 'income' ? 'Kirim' : 'Chiqim'}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center space-x-2">
                            <span
                              className="h-3 w-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: tx.category_color || '#ccc' }}
                            />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{tx.category_name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-xs text-slate-500 dark:text-slate-400">
                          {tx.transaction_date.substring(0, 10)}
                        </td>
                        <td className={`py-3.5 text-right font-bold ${
                          tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(tx)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-orange-600 hover:bg-orange-50/50 dark:hover:bg-slate-800 transition-colors"
                              title="Tahrirlash"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(tx.id)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-slate-800 transition-colors"
                              title="O'chirish"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-2">
                  <ArrowRightLeft className="h-10 w-10 stroke-1" />
                  <span>Qidiruv yoki filtrlarga mos keluvchi tranzaksiyalar topilmadi</span>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <div className="text-xs text-slate-450">
                  Jami <span className="font-semibold text-slate-700 dark:text-slate-300">{txResponse?.pagination?.total}</span> tadan 
                  <span className="font-semibold text-slate-700 dark:text-slate-300"> {(activePage - 1) * limit + 1} - {Math.min(activePage * limit, txResponse?.pagination?.total)}</span>-oralig'i ko'rsatilmoqda
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    disabled={activePage === 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-semibold px-2">
                    {activePage} / {totalPages}
                  </span>
                  <button
                    disabled={activePage === totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ADD / EDIT TRANSACTION MODAL */}
      {(addOpen || editOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setAddOpen(false); setEditOpen(false); }} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-[zoomIn_0.15s_ease-out]">
            <h3 className="text-lg font-bold">
              {editOpen ? 'Tranzaksiyani Tahrirlash' : 'Yangi Tranzaksiya Qo\'shish'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    txType === 'expense' ? 'bg-white dark:bg-slate-850 text-rose-600 shadow' : 'text-slate-400'
                  }`}
                >
                  Chiqim (Xarajat)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    txType === 'income' ? 'bg-white dark:bg-slate-850 text-emerald-600 shadow' : 'text-slate-400'
                  }`}
                >
                  Kirim (Daromad)
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nomi</label>
                <input
                  type="text"
                  required
                  placeholder="Kvartira ijarasi..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-905 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Miqdori</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="500000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-905 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sana</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-905 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toifa (Kategoriya)</label>
                <select
                  required
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-905 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                >
                  <option value="">Tanlang...</option>
                  {categories
                    ?.filter((c: any) => c.type === txType)
                    .map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                {categories?.filter((c: any) => c.type === txType).length === 0 && (
                  <p className="text-xs text-amber-500">Ushbu turdagi kategoriyalar yo'q. Avval toifa qo'shing!</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tavsif (Ixtiyoriy)</label>
                <textarea
                  placeholder="Qo'shimcha ma'lumot..."
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-905 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setAddOpen(false); setEditOpen(false); }}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                >
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
