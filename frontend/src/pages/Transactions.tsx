import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import {
  AddCircle as AddCircleIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  FilterList as FilterListIcon,
  ReceiptLong as ReceiptLongIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
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
  const [txCategoryId, setTxCategoryId] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch transactions list
  const { data: txResponse, isLoading: txLoading } = useQuery({
    queryKey: ['transactions', page, search, type, categoryId, month, year, sort],
    queryFn: async () => {
      const params: any = { page, limit, sort };
      if (search) params.search = search;
      if (type) params.type = type;
      if (categoryId) params.category_id = categoryId;
      if (month) params.month = month;
      if (year) params.year = year;

      const res = await apiClient.get('/api/transactions', { params });
      return res.data.data;
    },
  });

  // Fetch categories for filter and dropdowns
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/api/categories');
      return res.data.data;
    },
  });

  // Create Transaction Mutation
  const createTxMutation = useMutation({
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
        toast.success('Tranzaksiya qo\'shildi!');
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  // Update Transaction Mutation
  const updateTxMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      const res = await apiClient.put(`/api/transactions/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setEditOpen(false);
      resetForm();
      toast.success('Tranzaksiya yangilandi!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  // Delete Transaction Mutation
  const deleteTxMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.delete(`/api/transactions/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Tranzaksiya o\'chirildi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'O\'chirishda xatolik');
    },
  });

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDescription('');
    setTxType('expense');
    setTxCategoryId('');
    setTxDate(new Date().toISOString().split('T')[0]);
    setEditingTx(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setAddOpen(true);
  };

  const handleOpenEdit = (tx: any) => {
    setEditingTx(tx);
    setTitle(tx.title);
    setAmount(tx.amount.toString());
    setDescription(tx.description || '');
    setTxType(tx.type);
    setTxCategoryId(tx.category_id.toString());
    setTxDate(tx.transaction_date.split('T')[0]);
    setEditOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !txCategoryId || !txDate) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }
    createTxMutation.mutate({
      title,
      amount: parseFloat(amount),
      description: description || null,
      transaction_date: txDate,
      type: txType,
      category_id: parseInt(txCategoryId, 10),
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    updateTxMutation.mutate({
      id: editingTx.id,
      payload: {
        title,
        amount: parseFloat(amount),
        description: description || null,
        transaction_date: txDate,
        type: txType,
        category_id: parseInt(txCategoryId, 10),
      },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Rostdan ham ushbu tranzaksiyani o\'chirmoqchimisiz?')) {
      deleteTxMutation.mutate(id);
    }
  };

  const currencySymbol = user?.currency || 'UZS';

  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('uz-UZ', { style: 'decimal' }).format(num) + ' ' + currencySymbol;
  };

  const transactionsList = txResponse?.transactions || [];

  // CSV Report Export Handler
  const exportToCSV = () => {
    if (!transactionsList || transactionsList.length === 0) {
      toast.error('Eksport qilish uchun tranzaksiyalar mavjud emas');
      return;
    }

    const headers = ['Sana', 'Tranzaksiya Nomi', 'Kategoriya', 'Turi', `Summa (${currencySymbol})`, 'Izoh'];
    const rows = transactionsList.map((tx: any) => [
      `"${new Date(tx.transaction_date).toLocaleDateString('uz-UZ')}"`,
      `"${tx.title.replace(/"/g, '""')}"`,
      `"${tx.category_name || ''}"`,
      `"${tx.type === 'income' ? 'Kirim' : 'Chiqim'}"`,
      `"${tx.amount}"`,
      `"${(tx.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `moliya_hisoboti_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV hisoboti muvaffaqiyatli yuklab olindi! 📄');
  };

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16161E] p-6 rounded-2xl border border-amber-500/20 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight font-display text-white">Tranzaksiyalar Boshqaruvi 🟡</h1>
          <p className="text-sm text-slate-400">Barcha kirim va chiqim operatsiyalaringiz ro'yxati va filtri.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-[#FCD34D] hover:bg-white/5 text-sm font-bold transition-all w-full sm:w-auto"
            title="CSV hisobotini yuklab olish"
          >
            <FileDownloadIcon style={{ fontSize: 20 }} />
            Export CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FBBF24] hover:bg-[#FCD34D] text-[#0B0B0E] text-sm font-bold shadow-lg shadow-amber-500/20 transition-all w-full sm:w-auto"
          >
            <AddCircleIcon style={{ fontSize: 20 }} />
            Yangi tranzaksiya
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 space-y-4">
        <div className="flex items-center space-x-2 text-[#FCD34D] border-b border-amber-500/20 pb-3">
          <FilterListIcon style={{ fontSize: 20 }} />
          <h3 className="text-sm font-bold text-white">Saralash va Filtrlash</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon style={{ fontSize: 18 }} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Qidiruv..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white focus:outline-none focus:border-[#F59E0B]"
            />
          </div>

          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setCategoryId(''); setPage(1); }}
            className="px-4 py-2 text-sm rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white focus:outline-none focus:border-[#F59E0B]"
          >
            <option value="">Barcha turlar</option>
            <option value="income">Kirim (+)</option>
            <option value="expense">Chiqim (-)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
            className="px-4 py-2 text-sm rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white focus:outline-none focus:border-[#F59E0B]"
          >
            <option value="">Barcha toifalar</option>
            {categories
              ?.filter((c: any) => !type || c.type === type)
              .map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
          </select>

          {/* Month */}
          <select
            value={month}
            onChange={(e) => { setMonth(e.target.value); setPage(1); }}
            className="px-4 py-2 text-sm rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white focus:outline-none focus:border-[#F59E0B]"
          >
            <option value="">Barcha oylar</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}-oy
              </option>
            ))}
          </select>

          {/* Year */}
          <select
            value={year}
            onChange={(e) => { setYear(e.target.value); setPage(1); }}
            className="px-4 py-2 text-sm rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white focus:outline-none focus:border-[#F59E0B]"
          >
            <option value="">Barcha yillar</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="px-4 py-2 text-sm rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white focus:outline-none focus:border-[#F59E0B]"
          >
            <option value="date_desc">Eng yangi birinchi</option>
            <option value="date_asc">Eng eski birinchi</option>
            <option value="amount_desc">Summa (Yuqoridan)</option>
            <option value="amount_asc">Summa (Pastdan)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#16161E] rounded-2xl border border-amber-500/20 overflow-hidden shadow-sm">
        {txLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <div className="h-8 w-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400">Tranzaksiyalar yuklanmoqda...</p>
          </div>
        ) : transactionsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-amber-500/20 bg-[#0B0B0E]/60 text-xs font-bold text-[#FCD34D] uppercase">
                  <th className="py-4 px-6">Nomi / Izoh</th>
                  <th className="py-4 px-6">Kategoriya</th>
                  <th className="py-4 px-6">Sana</th>
                  <th className="py-4 px-6 text-right">Summa</th>
                  <th className="py-4 px-6 text-center">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {transactionsList.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6 font-bold text-white">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center">
                          <ReceiptLongIcon style={{ fontSize: 18 }} />
                        </div>
                        <div>
                          <div>{tx.title}</div>
                          {tx.description && (
                            <div className="text-xs font-normal text-slate-400">{tx.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: tx.category_color || '#F59E0B' }}
                      >
                        {tx.category_name}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-medium">
                      {new Date(tx.transaction_date).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className={`py-4 px-6 text-right font-black text-base ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#FCD34D] hover:bg-white/5 transition-colors"
                          title="Tahrirlash"
                        >
                          <EditIcon style={{ fontSize: 18 }} />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                          title="O'chirish"
                        >
                          <DeleteIcon style={{ fontSize: 18 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            Tranzaksiyalar topilmadi.
          </div>
        )}

        {/* Pagination Controls */}
        {txResponse?.pagination && (
          <div className="p-4 border-t border-amber-500/20 bg-[#0B0B0E]/60 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Jami: <b className="text-white">{txResponse.pagination.totalItems}</b> ta tranzaksiya
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-lg border border-amber-500/20 disabled:opacity-40 hover:bg-white/5 text-white"
              >
                <ChevronLeftIcon style={{ fontSize: 18 }} />
              </button>
              <span className="text-xs font-bold text-[#FCD34D] px-2">
                {page} / {txResponse.pagination.totalPages || 1}
              </span>
              <button
                disabled={page >= txResponse.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg border border-amber-500/20 disabled:opacity-40 hover:bg-white/5 text-white"
              >
                <ChevronRightIcon style={{ fontSize: 18 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Transaction */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#16161E] border border-amber-500/30 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-white">Yangi Tranzaksiya Qo'shish 🟡</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Nomi</label>
                <input
                  type="text"
                  placeholder="Masalan: Bozorlik"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#FCD34D] uppercase">Summa ({currencySymbol})</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#FCD34D] uppercase">Turi</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as 'income' | 'expense')}
                    className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  >
                    <option value="expense">Xarajat (-)</option>
                    <option value="income">Daromad (+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Kategoriya</label>
                <select
                  value={txCategoryId}
                  onChange={(e) => setTxCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                >
                  <option value="">Kategoriyani tanlang</option>
                  {categories
                    ?.filter((c: any) => c.type === txType)
                    .map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Sana</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="flex-1 py-2.5 border border-amber-500/20 text-slate-300 text-sm font-semibold rounded-xl hover:bg-white/5"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={createTxMutation.isPending}
                  className="flex-1 py-2.5 gold-gradient text-[#0B0B0E] text-sm font-extrabold rounded-xl shadow transition-colors"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Transaction */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#16161E] border border-amber-500/30 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-white">Tranzaksiyani Tahrirlash 🟡</h3>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Nomi</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#FCD34D] uppercase">Summa ({currencySymbol})</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#FCD34D] uppercase">Turi</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as 'income' | 'expense')}
                    className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  >
                    <option value="expense">Xarajat (-)</option>
                    <option value="income">Daromad (+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Kategoriya</label>
                <select
                  value={txCategoryId}
                  onChange={(e) => setTxCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                >
                  <option value="">Kategoriyani tanlang</option>
                  {categories
                    ?.filter((c: any) => c.type === txType)
                    .map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Sana</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 py-2.5 border border-amber-500/20 text-slate-300 text-sm font-semibold rounded-xl hover:bg-white/5"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={updateTxMutation.isPending}
                  className="flex-1 py-2.5 gold-gradient text-[#0B0B0E] text-sm font-extrabold rounded-xl shadow transition-colors"
                >
                  Yangilash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
