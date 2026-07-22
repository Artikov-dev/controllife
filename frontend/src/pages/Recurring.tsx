import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import {
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarMonthIcon,
  Update as UpdateIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';

export default function Recurring() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);

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

  // Fetch categories (filter expense type only)
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
      next_run: nextRun,
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

  const frequencyLabels: Record<string, string> = {
    daily: 'Har kuni',
    weekly: 'Har hafta',
    monthly: 'Har oy',
    yearly: 'Har yili',
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
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FBBF24] hover:bg-[#FCD34D] text-[#111111] text-sm font-bold shadow-lg shadow-amber-500/20 transition-all duration-150 w-full sm:w-auto"
        >
          <AddCircleIcon style={{ fontSize: 20 }} />
          Davriy to'lov qo'shish
        </button>
      </div>

      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#FCD34D] flex items-start gap-3">
        <InfoIcon style={{ fontSize: 20 }} className="flex-shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed font-medium">
          Tizim avtomatik ravishda belgilangan "Navbatdagi ijro sanasi" kelganda ushbu to'lovlarni tranzaksiya sifatida qayd etadi.
        </p>
      </div>

      {billsLoading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <div className="h-8 w-8 border-4 border-[#FBBF24] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Jadval yuklanmoqda...</p>
        </div>
      ) : bills && bills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map((bill: any) => (
            <div
              key={bill.id}
              className="p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#FBBF24] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                    style={{ backgroundColor: bill.category_color || '#FBBF24' }}
                  >
                    <UpdateIcon style={{ fontSize: 22 }} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{bill.title}</h4>
                    <span className="text-xs text-slate-400">{bill.category_name}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(bill.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                >
                  <DeleteIcon style={{ fontSize: 18 }} />
                </button>
              </div>

              <div className="space-y-2 border-t border-amber-500/10 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Summa:</span>
                  <span className="text-base font-black text-rose-400">-{formatCurrency(bill.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Muntazamlik:</span>
                  <span className="text-xs font-bold text-[#FBBF24] capitalize">{frequencyLabels[bill.frequency] || bill.frequency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Navbatdagi ijro:</span>
                  <span className="text-xs font-medium text-white flex items-center gap-1">
                    <CalendarMonthIcon style={{ fontSize: 14 }} className="text-[#FBBF24]" />
                    {new Date(bill.next_run).toLocaleDateString('uz-UZ')}
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
                <label className="text-xs font-bold text-[#FBBF24] uppercase">Nomi</label>
                <input
                  type="text"
                  placeholder="Masalan: Internet to'lovi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#111111] text-white text-sm focus:outline-none focus:border-[#FBBF24]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#FBBF24] uppercase">Summa ({currencySymbol})</label>
                  <input
                    type="number"
                    placeholder="200000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#111111] text-white text-sm focus:outline-none focus:border-[#FBBF24]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#FBBF24] uppercase">Muntazamlik</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#111111] text-white text-sm focus:outline-none focus:border-[#FBBF24]"
                  >
                    <option value="daily">Har kuni</option>
                    <option value="weekly">Har hafta</option>
                    <option value="monthly">Har oy</option>
                    <option value="yearly">Har yili</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#FBBF24] uppercase">Kategoriya</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#111111] text-white text-sm focus:outline-none focus:border-[#FBBF24]"
                  required
                >
                  <option value="">Kategoriyani tanlang</option>
                  {categories
                    ?.filter((c: any) => c.type === 'expense')
                    .map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#FBBF24] uppercase">Birinchi / Navbatdagi Ijro Sanasi</label>
                <input
                  type="date"
                  value={nextRun}
                  onChange={(e) => setNextRun(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#111111] text-white text-sm focus:outline-none focus:border-[#FBBF24]"
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
                  className="flex-1 py-2.5 bg-[#FBBF24] hover:bg-[#FCD34D] text-[#111111] text-sm font-bold rounded-xl shadow transition-colors"
                >
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
