import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Loader2,
  AlertCircle
} from 'lucide-react';
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

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/api/recurring', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      setModalOpen(false);
      resetForm();
      toast.success('Davriy to\'lov muvaffaqiyatli rejalashtirildi!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/recurring/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      toast.success('Davriy to\'lov jadvali o\'chirildi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'O\'chirishda xatolik yuz berdi');
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
    createMutation.mutate({
      title,
      amount: parseFloat(amount),
      frequency,
      category_id: parseInt(categoryId, 10),
      next_run: nextRun,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Haqiqatdan ham ushbu davriy to\'lovni o\'chirmoqchimisiz? Kelajakda avtomatik to\'lovlar to\'xtatiladi.')) {
      deleteMutation.mutate(id);
    }
  };

  const currencySymbol = user?.currency || 'UZS';
  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('uz-UZ').format(num) + ' ' + currencySymbol;
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily': return 'Kunlik';
      case 'weekly': return 'Haftalik';
      case 'monthly': return 'Har oy';
      case 'yearly': return 'Har yil';
      default: return freq;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display">Davriy To'lovlar (Obunalar)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Kommunal, ijara, sug'urta va obuna to'lovlarini avtomatik rejalashtirish.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-lg shadow-orange-500/15 transition-all duration-150 w-full sm:w-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Avto-to'lov rejalashtirish
        </button>
      </div>

      {/* Info Alert */}
      <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 text-orange-850 dark:text-orange-400 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="text-xs space-y-1">
          <p className="font-bold">Avtomatik tranzaksiyalar qanday ishlaydi?</p>
          <p className="leading-relaxed">
            Siz davriy to'lov rejalashtirganingizda, belgilangan kunda tizim avtomatik ravishda xarajatlar ro'yxatiga ushbu summadagi tranzaksiyani kiritib, navbatdagi to'lov sanasini oldinga siljitadi. Buning uchun hech qanday qo'shimcha amallar bajarishingiz shart emas.
          </p>
        </div>
      </div>

      {/* Grid List */}
      {billsLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-xs text-slate-500">Yuklanmoqda...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills && bills.length > 0 ? (
            bills.map((bill: any) => (
              <div
                key={bill.id}
                className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/50 shadow-sm relative overflow-hidden flex flex-col justify-between group transition-all hover:-translate-y-1"
              >
                <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: bill.category_color || '#ccc' }} />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getFrequencyLabel(bill.frequency)}
                    </span>
                    
                    <button
                      onClick={() => handleDelete(bill.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-150"
                      title="Jadvalni o'chirish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950 dark:text-white text-base">{bill.title}</h3>
                    <p className="text-2xl font-black font-display text-rose-600 dark:text-rose-400 mt-1">
                      {formatCurrency(bill.amount)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:divide-slate-800/60 text-xs space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Toifa:</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: bill.category_color }} />
                        <span className="font-bold text-slate-700 dark:text-slate-300">{bill.category_name}</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>Keyingi to'lov:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {bill.next_run.substring(0, 10)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-3">
              <Clock className="h-12 w-12 stroke-1" />
              <span>Hozircha hech qanday davriy to'lovlar rejalashtirilmagan</span>
              <button
                onClick={() => setModalOpen(true)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 underline"
              >
                Ilk avto-to'lovni qo'shish
              </button>
            </div>
          )}
        </div>
      )}

      {/* CREATE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-[zoomIn_0.15s_ease-out]">
            <div>
              <h3 className="text-lg font-bold">Avto-to'lov Rejalashtirish</h3>
              <p className="text-xs text-slate-400 mt-0.5">Avtomatlashtirilgan xarajat turini kiriting.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">To'lov nomi</label>
                <input
                  type="text"
                  required
                  placeholder="Kvartira ijarasi, Spotify obunasi..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                />
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Summa</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="15000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Frequency */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Davriylik</label>
                  <select
                    value={frequency}
                    onChange={(e: any) => setFrequency(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                  >
                    <option value="daily">Kunlik</option>
                    <option value="weekly">Haftalik</option>
                    <option value="monthly">Har oy</option>
                    <option value="yearly">Har yil</option>
                  </select>
                </div>

                {/* Next Run Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Birinchi to'lov kuni</label>
                  <input
                    type="date"
                    required
                    value={nextRun}
                    onChange={(e) => setNextRun(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toifa (Kategoriya)</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                >
                  <option value="">Tanlang...</option>
                  {categories
                    ?.filter((c: any) => c.type === 'expense')
                    .map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                {categories?.filter((c: any) => c.type === 'expense').length === 0 && (
                  <p className="text-xs text-amber-500">Chiqim kategoriyalari yo'q. Avval toifa qo'shing!</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-955 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                >
                  {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
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
