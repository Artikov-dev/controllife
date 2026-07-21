import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Loader2, 
  Tag,
  Check,
  FolderMinus,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function Categories() {
  const queryClient = useQueryClient();
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('Tag');

  // Beautiful preset colors for the selector
  const PRESET_COLORS = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#64748b', // Slate
  ];

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/api/categories');
      return res.data.data;
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingCategory) {
        const res = await apiClient.put(`/api/categories/${editingCategory.id}`, payload);
        return res.data;
      } else {
        const res = await apiClient.post('/api/categories', payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setModalOpen(false);
      resetForm();
      toast.success(editingCategory ? 'Kategoriya muvaffaqiyatli yangilandi!' : 'Kategoriya muvaffaqiyatli yaratildi!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategoriya muvaffaqiyatli o\'chirildi');
    },
    onError: (err: any) => {
      // If category has transactions, this will show the backend's validation error message
      const errMsg = err.response?.data?.message || 'O\'chirishda xatolik yuz berdi';
      toast.error(errMsg, { duration: 6000 });
    },
  });

  const resetForm = () => {
    setName('');
    setType('expense');
    setColor('#3b82f6');
    setIcon('Tag');
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
    setColor(cat.color || '#3b82f6');
    setIcon(cat.icon || 'Tag');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Kategoriya nomini kiriting');
      return;
    }
    saveMutation.mutate({
      name: name.trim(),
      type,
      color,
      icon,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Haqiqatdan ham ushbu kategoriyani o\'chirmoqchimisiz? Agar unga bog\'langan tranzaksiyalar bo\'lsa, o\'chirish rad etiladi.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display">Kategoriyalar Boshqaruvi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tranzaksiyalar uchun toifalar (kategoriyalar) yaratish va boshqarish.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-500/15 transition-all duration-150 w-full sm:w-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Yangi toifa qo'shish
        </button>
      </div>

      {categoriesLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-xs text-slate-500">Yuklanmoqda...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories && categories.length > 0 ? (
            categories.map((cat: any) => (
              <div
                key={cat.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/50 shadow-sm relative overflow-hidden flex flex-col justify-between group transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                {/* Visual Category Color Banner */}
                <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: cat.color || '#ccc' }} />

                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      cat.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {cat.type === 'income' ? 'Kirim' : 'Chiqim'}
                    </span>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                      style={{ backgroundColor: cat.color || '#ccc' }}
                    >
                      <Tag className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200">{cat.name}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">ID: #{cat.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-3">
              <FolderMinus className="h-12 w-12 stroke-1" />
              <span>Hozircha hech qanday toifalar qo'shilmagan</span>
              <button
                onClick={handleOpenAdd}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
              >
                Ilk toifani qo'shish
              </button>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-[zoomIn_0.15s_ease-out]">
            <h3 className="text-lg font-bold">
              {editingCategory ? 'Toifani Tahrirlash' : 'Yangi Toifa Yaratish'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kategoriya Turi</label>
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      type === 'expense' ? 'bg-white dark:bg-slate-850 text-rose-600 shadow' : 'text-slate-400'
                    }`}
                  >
                    Chiqim (Xarajat)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      type === 'income' ? 'bg-white dark:bg-slate-850 text-emerald-600 shadow' : 'text-slate-400'
                    }`}
                  >
                    Kirim (Daromad)
                  </button>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nomi</label>
                <input
                  type="text"
                  required
                  placeholder="Kiyim-kechak, Oziq-ovqat..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                />
              </div>

              {/* Color Preset Palette */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Rang Tanlang
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setColor(preset)}
                      className="h-8 w-8 rounded-full border border-white dark:border-slate-850 shadow-sm flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                      style={{ backgroundColor: preset }}
                    >
                      {color === preset && (
                        <Check className="h-4.5 w-4.5 text-white" />
                      )}
                    </button>
                  ))}
                  {/* Custom color input */}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800 cursor-pointer overflow-hidden p-0 bg-transparent flex-shrink-0"
                    title="Boshqa rang"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                >
                  {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
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
