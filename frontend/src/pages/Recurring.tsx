import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import {
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CalendarMonth as CalendarMonthIcon,
  Update as UpdateIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';

export default function Recurring() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<any>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [categoryId, setCategoryId] = useState('');
  const [nextRun, setNextRun] = useState(new Date().toISOString().split('T')[0]);

  // Fetch recurring bills
  const { data: bills, isLoading: billsLoading } = useQuery({
    queryKey: ['recurring'],
    queryFn: async () => {
      const res = await apiClient.get('/api/recurring');
      return res.data.data;
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/api/categories');
      return res.data.data;
    },
  });

  // Create Recurring Mutation
  const createRecurringMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/api/recurring', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      setModalOpen(false);
      resetForm();
      toast.success('Davriy to\'lov jadvali yaratildi!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  // Update Recurring Mutation
  const updateRecurringMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      const res = await apiClient.put(`/api/recurring/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      setEditModalOpen(false);
      resetForm();
      toast.success('Davriy to\'lov tahrirlandi!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  // Delete Recurring Mutation
  const deleteRecurringMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.delete(`/api/recurring/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      toast.success('Davriy to\'lov o\'chirildi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'O\'chirishda xatolik');
    },
  });

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setFrequency('monthly');
    setCategoryId('');
    setNextRun(new Date().toISOString().split('T')[0]);
    setEditingBill(null);
  };

  const handleOpenEdit = (bill: any) => {
    setEditingBill(bill);
    setTitle(bill.title);
    setAmount(bill.amount.toString());
    setFrequency(bill.frequency);
    setCategoryId(bill.category_id.toString());
    setNextRun(bill.next_run_date.split('T')[0]);
    setEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !categoryId || !nextRun) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }
    createRecurringMutation.mutate({
      title,
      amount: parseFloat(amount),
      frequency,
      category_id: parseInt(categoryId, 10),
      next_run_date: nextRun,
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBill || !title || !amount || !categoryId || !nextRun) return;
    updateRecurringMutation.mutate({
      id: editingBill.id,
      payload: {
        title,
        amount: parseFloat(amount),
        frequency,
        category_id: parseInt(categoryId, 10),
        next_run_date: nextRun,
      },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Ushbu davriy to\'lovni o\'chirmoqchimisiz?')) {
      deleteRecurringMutation.mutate(id);
    }
  };

  const currencySymbol = user?.currency || 'UZS';

  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('uz-UZ', { style: 'decimal' }).format(num) + ' ' + currencySymbol;
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily': return 'Har kuni';
      case 'weekly': return 'Har hafta';
      case 'monthly': return 'Har oy';
      case 'yearly': return 'Har yili';
      default: return freq;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16161E] p-6 rounded-2xl border border-amber-500/20 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight font-display text-white">Davriy To'lovlar (Recurring Bills) 🟡</h1>
          <p className="text-sm text-slate-400">Kommunal, obunalar va muntazam xarajatlar jadvali.</p>
        </div>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl gold-gradient text-[#0B0B0E] text-sm font-bold shadow-lg shadow-amber-500/20 transition-all w-full sm:w-auto"
        >
          <AddCircleIcon style={{ fontSize: 20 }} />
          Yangi davriy to'lov
        </button>
      </div>

      {/* Info Alert */}
      <div className="p-4 rounded-xl bg-[#F59E0B]/10 border border-amber-500/30 text-xs text-[#FCD34D] flex items-start space-x-3">
        <InfoIcon style={{ fontSize: 18 }} className="flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Tizim serveri belgilangan <b>keyingi to'lov sanasi</b> kelganda avtomatik ravishda tranzaksiya yaratadi va balansingizdan chegiradi.
        </p>
      </div>

      {/* List Grid */}
      {billsLoading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <div className="h-8 w-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Davriy to'lovlar yuklanmoqda...</p>
        </div>
      ) : bills && bills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map((bill: any) => (
            <div
              key={bill.id}
              className="p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#FCD34D] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-[#F59E0B]/15 text-[#FCD34D] flex items-center justify-center">
                    <CalendarMonthIcon style={{ fontSize: 22 }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{bill.title}</h3>
                    <span className="text-xs text-slate-400">{bill.category_name}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(bill)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#FCD34D] hover:bg-white/5 transition-colors"
                    title="Tahrirlash"
                  >
                    <EditIcon style={{ fontSize: 18 }} />
                  </button>
                  <button
                    onClick={() => handleDelete(bill.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                    title="O'chirish"
                  >
                    <DeleteIcon style={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-500/10 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Summa:</span>
                  <span className="font-black text-white text-sm">{formatCurrency(bill.amount)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Chastota:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#F59E0B]/10 text-[#FCD34D] border border-amber-500/20">
                    {getFrequencyLabel(bill.frequency)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Keyingi to'lov:</span>
                  <span className="font-bold text-white">
                    {new Date(bill.next_run_date).toLocaleDateString('uz-UZ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-[#16161E] border border-amber-500/20 rounded-2xl text-slate-400 space-y-3">
          <UpdateIcon style={{ fontSize: 40 }} className="text-amber-500/40" />
          <p className="text-sm">Hozircha hech qanday davriy to'lov rejalashtirilmagan.</p>
        </div>
      )}

      {/* Modal: Create Recurring */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#16161E] border border-amber-500/30 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-white">Yangi Davriy To'lov 🟡</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Nomi</label>
                <input
                  type="text"
                  placeholder="Masalan: Uy ijara haqi yoki Wifi obunasi"
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
                    placeholder="150000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#FCD34D] uppercase">Chastota</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  >
                    <option value="daily">Har kuni</option>
                    <option value="weekly">Har hafta</option>
                    <option value="monthly">Har oy</option>
                    <option value="yearly">Har yili</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Kategoriya</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                >
                  <option value="">Kategoriyani tanlang</option>
                  {categories?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type === 'income' ? '+' : '-'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Keyingi To'lov Sanasi</label>
                <input
                  type="date"
                  value={nextRun}
                  onChange={(e) => setNextRun(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-amber-500/20 text-slate-300 text-sm font-semibold rounded-xl hover:bg-white/5"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={createRecurringMutation.isPending}
                  className="flex-1 py-2.5 gold-gradient text-[#0B0B0E] text-sm font-extrabold rounded-xl shadow transition-colors"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Recurring */}
      {editModalOpen && editingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#16161E] border border-amber-500/30 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-white">Davriy To'lovni Tahrirlash 🟡</h3>

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
                  <label className="text-xs font-bold text-[#FCD34D] uppercase">Chastota</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  >
                    <option value="daily">Har kuni</option>
                    <option value="weekly">Har hafta</option>
                    <option value="monthly">Har oy</option>
                    <option value="yearly">Har yili</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Kategoriya</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                >
                  <option value="">Kategoriyani tanlang</option>
                  {categories?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type === 'income' ? '+' : '-'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Keyingi To'lov Sanasi</label>
                <input
                  type="date"
                  value={nextRun}
                  onChange={(e) => setNextRun(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-2.5 border border-amber-500/20 text-slate-300 text-sm font-semibold rounded-xl hover:bg-white/5"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={updateRecurringMutation.isPending}
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
