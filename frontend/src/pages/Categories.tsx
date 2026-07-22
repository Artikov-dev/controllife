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
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState('#FBBF24');
  const [icon, setIcon] = useState('Category');

  // Beautiful preset colors for the selector
  const PRESET_COLORS = [
    '#FBBF24', // Gold
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#ec4899', // Pink
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#64748b', // Slate
  ];

  // Fetch all user categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/api/categories');
      return res.data.data;
    },
  });

  // Create Category Mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/api/categories', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setModalOpen(false);
      resetForm();
      toast.success('Kategoriya muvaffaqiyatli saqlandi!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  // Update Category Mutation
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

  // Delete Category Mutation
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
      toast.error(err.response?.data?.message || 'O\'chirishda xatolik yuz berdi');
    },
  });

  const resetForm = () => {
    setName('');
    setType('expense');
    setColor('#FBBF24');
    setIcon('Category');
    setEditingCategory(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setColor(cat.color || '#FBBF24');
    setIcon(cat.icon || 'Category');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Kategoriya nomini kiriting');
      return;
    }

    const payload = {
      name,
      type,
      color,
      icon,
    };

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, payload });
    } else {
      createCategoryMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Ushbu kategoriyani o'chirmoqchimisiz? Aloqador tranzaksiyalar ham ta'sirlanishi mumkin.")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const incomeCategories = categories?.filter((c: any) => c.type === 'income') || [];
  const expenseCategories = categories?.filter((c: any) => c.type === 'expense') || [];

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16161E] p-6 rounded-2xl border border-amber-500/20 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight font-display text-white">Kategoriyalar Boshqaruvi 🟡</h1>
          <p className="text-sm text-slate-400">Tranzaksiyalaringizni guruhlash va saralash uchun toifalar sozlamasi.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FBBF24] hover:bg-[#FCD34D] text-[#111111] text-sm font-bold shadow-lg shadow-amber-500/20 transition-all duration-150 w-full sm:w-auto"
        >
          <AddCircleIcon style={{ fontSize: 20 }} />
          Yangi Kategoriya
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <div className="h-8 w-8 border-4 border-[#FBBF24] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Kategoriyalar yuklanmoqda...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Expense Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <h3 className="text-base font-extrabold text-rose-400 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                Chiqim Kategoriyalari ({expenseCategories.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {expenseCategories.map((cat: any) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-[#16161E] border border-amber-500/20 shadow-sm flex items-center justify-between group hover:border-[#FBBF24] transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white shadow"
                      style={{ backgroundColor: cat.color || '#FBBF24' }}
                    >
                      <CategoryIcon style={{ fontSize: 20 }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                      <span className="text-[11px] text-slate-400 capitalize">Chiqim</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#FBBF24] hover:bg-white/5 transition-colors"
                    >
                      <EditIcon style={{ fontSize: 18 }} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                    >
                      <DeleteIcon style={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Income Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <h3 className="text-base font-extrabold text-emerald-400 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                Kirim Kategoriyalari ({incomeCategories.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {incomeCategories.map((cat: any) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-[#16161E] border border-amber-500/20 shadow-sm flex items-center justify-between group hover:border-[#FBBF24] transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white shadow"
                      style={{ backgroundColor: cat.color || '#10b981' }}
                    >
                      <CategoryIcon style={{ fontSize: 20 }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                      <span className="text-[11px] text-slate-400 capitalize">Kirim</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#FBBF24] hover:bg-white/5 transition-colors"
                    >
                      <EditIcon style={{ fontSize: 18 }} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                    >
                      <DeleteIcon style={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit Category */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#16161E] border border-amber-500/30 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-white">
              {editingCategory ? 'Kategoriyani Tahrirlash 🟡' : 'Yangi Kategoriya Yaratish 🟡'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#FBBF24] uppercase">Kategoriya Nomi</label>
                <input
                  type="text"
                  placeholder="Masalan: Transport yoki Oziq-ovqat"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#111111] text-white text-sm focus:outline-none focus:border-[#FBBF24]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#FBBF24] uppercase">Kategoriya Turi</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#111111] text-white text-sm focus:outline-none focus:border-[#FBBF24]"
                >
                  <option value="expense">Chiqim (Xarajat)</option>
                  <option value="income">Kirim (Daromad)</option>
                </select>
              </div>

              {/* Color Selector */}
              <div>
                <label className="text-xs font-bold text-[#FBBF24] uppercase">Rangini Tanlang</label>
                <div className="flex items-center space-x-2 mt-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-7 w-7 rounded-full transition-transform flex items-center justify-center ${
                        color === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <CheckIcon style={{ fontSize: 14 }} className="text-white" />}
                    </button>
                  ))}
                </div>
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
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
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
