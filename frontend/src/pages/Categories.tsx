import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import {
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Category as CategoryIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';

export default function Categories() {
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState('#F59E0B');

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/api/categories');
      return res.data.data;
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/api/categories', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setModalOpen(false);
      resetForm();
      toast.success('Yangi kategoriya yaratildi!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      const res = await apiClient.put(`/api/categories/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setModalOpen(false);
      resetForm();
      toast.success('Kategoriya yangilandi!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.delete(`/api/categories/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategoriya o\'chirildi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'O\'chirishda xatolik');
    },
  });

  const resetForm = () => {
    setName('');
    setType('expense');
    setColor('#F59E0B');
    setEditingCategory(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setColor(cat.color || '#F59E0B');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Kategoriya nomini kiriting');
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        payload: { name, type, color },
      });
    } else {
      createCategoryMutation.mutate({ name, type, color });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Ushbu kategoriyani o\'chirmoqchimisiz? Tahrirlangan tranzaksiyalar "Boshqa" kategoriyasiga o\'tadi.')) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const colorOptions = [
    '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#64748B',
  ];

  const expenseCategories = categories?.filter((c: any) => c.type === 'expense') || [];
  const incomeCategories = categories?.filter((c: any) => c.type === 'income') || [];

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#16161E] p-6 rounded-2xl border border-amber-500/20 shadow-sm dark:shadow-xl">
        <div>
          <h1 className="text-2xl font-black tracking-tight font-display text-slate-900 dark:text-white">Kategoriyalar Boshqaruvi 🟡</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tranzaksiyalaringizni guruhlash va saralash uchun toifalar sozlamasi.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl gold-gradient text-white dark:text-[#0B0B0E] text-sm font-bold shadow-md shadow-amber-500/20 transition-all w-full sm:w-auto"
        >
          <AddCircleIcon style={{ fontSize: 20 }} />
          Yangi kategoriya
        </button>
      </div>

      {categoriesLoading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <div className="h-8 w-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Kategoriyalar yuklanmoqda...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expense Categories */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-black text-lg">
              <CategoryIcon style={{ fontSize: 22 }} />
              <span>Chiqim Kategoriyalari (-)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {expenseCategories.map((cat: any) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#16161E] border border-amber-500/20 shadow-sm flex items-center justify-between group hover:border-[#F59E0B] transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                      style={{ backgroundColor: cat.color || '#F59E0B' }}
                    >
                      {cat.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{cat.name}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#D97706] dark:hover:text-[#FCD34D] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      title="Tahrirlash"
                    >
                      <EditIcon style={{ fontSize: 18 }} />
                    </button>
                    {!cat.is_default && (
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        title="O'chirish"
                      >
                        <DeleteIcon style={{ fontSize: 18 }} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Income Categories */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-black text-lg">
              <CategoryIcon style={{ fontSize: 22 }} />
              <span>Kirim Kategoriyalari (+)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {incomeCategories.map((cat: any) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#16161E] border border-amber-500/20 shadow-sm flex items-center justify-between group hover:border-[#F59E0B] transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                      style={{ backgroundColor: cat.color || '#10B981' }}
                    >
                      {cat.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{cat.name}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#D97706] dark:hover:text-[#FCD34D] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      title="Tahrirlash"
                    >
                      <EditIcon style={{ fontSize: 18 }} />
                    </button>
                    {!cat.is_default && (
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        title="O'chirish"
                      >
                        <DeleteIcon style={{ fontSize: 18 }} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit Category */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#16161E] border border-amber-500/30 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {editingCategory ? 'Kategoriyani Tahrirlash 🟡' : 'Yangi Kategoriya Yaratish 🟡'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#D97706] dark:text-[#FCD34D] uppercase">Kategoriya Nomi</label>
                <input
                  type="text"
                  placeholder="Masalan: Sayohat"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-slate-50 dark:bg-[#0B0B0E] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#D97706] dark:text-[#FCD34D] uppercase">Turi</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-slate-50 dark:bg-[#0B0B0E] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                >
                  <option value="expense">Chiqim (-)</option>
                  <option value="income">Kirim (+)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#D97706] dark:text-[#FCD34D] uppercase mb-2 block">Belgi Rangi</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="h-8 w-8 rounded-xl flex items-center justify-center transition-transform hover:scale-110"
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <CheckIcon style={{ fontSize: 18 }} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-amber-500/20 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  className="flex-1 py-2.5 gold-gradient text-white dark:text-[#0B0B0E] text-sm font-extrabold rounded-xl shadow transition-colors"
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
