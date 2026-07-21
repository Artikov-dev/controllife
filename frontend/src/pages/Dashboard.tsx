import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  Loader2, 
  PiggyBank,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, theme } = useAuthStore();
  const queryClient = useQueryClient();
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  // Form states for Quick Transaction
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // Form states for Quick Budget
  const [budgetAmount, setBudgetAmount] = useState('');

  // Fetch Dashboard data
  const { data: dashData, isLoading: dashLoading, error: dashError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/api/transactions/dashboard');
      return res.data.data;
    },
  });

  // Fetch categories for form selects
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
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setTxModalOpen(false);
      
      // Reset Form
      setTitle('');
      setAmount('');
      setDescription('');
      setCategoryId('');
      
      if (data.data.budgetWarning) {
        toast.warning(data.data.budgetWarning.message, { duration: 6000 });
      } else {
        toast.success('Tranzaksiya muvaffaqiyatli saqlandi!');
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  // Save Budget Mutation
  const saveBudgetMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/api/budgets', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setBudgetModalOpen(false);
      setBudgetAmount('');
      toast.success('Byudjet muvaffaqiyatli saqlandi!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Byudjet saqlashda xatolik');
    },
  });

  if (dashLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  if (dashError) {
    return (
      <div className="p-6 text-center bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/30">
        Xatolik yuz berdi: {(dashError as any).message || 'Serverga ulanib bo\'lmadi'}
      </div>
    );
  }

  const { summary, recent, categories: catDist, trend, budgetInfo } = dashData;
  const currencySymbol = user?.currency || 'UZS';

  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
    }).format(num) + ' ' + currencySymbol;
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !categoryId || !txDate) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }
    createTxMutation.mutate({
      title,
      amount: parseFloat(amount),
      description: description || null,
      transaction_date: txDate,
      type,
      category_id: parseInt(categoryId, 10),
    });
  };

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetAmount) return;
    const now = new Date();
    saveBudgetMutation.mutate({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      amount: parseFloat(budgetAmount),
    });
  };

  // Pie chart colors
  const COLORS = ['#f97316', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b'];

  return (
    <div className="space-y-8">
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display">Xush kelibsiz, {user?.full_name}! 👋</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Moliyaviy ko'rsatkichlaringiz haqida qisqacha ma'lumot.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setBudgetModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            <PiggyBank className="h-4 w-4" />
            Byudjet
          </button>
          <button
            onClick={() => setTxModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-lg shadow-orange-500/15 transition-all duration-150"
          >
            <Plus className="h-4 w-4" />
            Tranzaksiya qo'shish
          </button>
        </div>
      </div>

      {/* Grid of Key stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Balance */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/50 stripe-card shadow-sm flex items-center space-x-5">
          <div className="h-12 w-12 rounded-xl bg-orange-500/10 text-orange-500 dark:text-orange-400 flex items-center justify-center flex-shrink-0">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Umumiy Balans</span>
            <h2 className="text-2xl font-bold font-display mt-1 text-slate-900 dark:text-white">
              {formatCurrency(summary.balance)}
            </h2>
          </div>
        </div>

        {/* Card 2: Income */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/50 shadow-sm flex items-center space-x-5">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jami Daromad</span>
            <h2 className="text-2xl font-bold font-display mt-1 text-slate-900 dark:text-white">
              {formatCurrency(summary.totalIncome)}
            </h2>
          </div>
        </div>

        {/* Card 3: Expense */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/50 shadow-sm flex items-center space-x-5">
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jami Xarajat</span>
            <h2 className="text-2xl font-bold font-display mt-1 text-slate-900 dark:text-white">
              {formatCurrency(summary.totalExpense)}
            </h2>
          </div>
        </div>
      </div>

      {/* Budget Info Panel */}
      {budgetInfo ? (
        <div className={`p-6 rounded-2xl border transition-colors ${
          budgetInfo.isExceeded 
            ? 'bg-rose-500/5 border-rose-500/20 text-rose-800 dark:text-rose-400' 
            : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/50'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-slate-400" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">
                Ushbu oy uchun byudjet holati (Taqvim bo'yicha)
              </h3>
            </div>
            <div className="text-sm font-semibold">
              {formatCurrency(budgetInfo.totalExpenses)} / {formatCurrency(budgetInfo.budgetAmount)} ({budgetInfo.percentageUsed}%)
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                budgetInfo.isExceeded ? 'bg-rose-500 animate-pulse' : 'bg-orange-500'
              }`}
              style={{ width: `${Math.min(budgetInfo.percentageUsed, 100)}%` }}
            />
          </div>

          {budgetInfo.isExceeded && (
            <div className="flex items-center mt-3 text-xs text-rose-600 dark:text-rose-400 font-semibold gap-1.5 animate-bounce">
              <AlertTriangle className="h-4 w-4" />
              Diqqat! Oylik xarajat limitidan oshib ketdingiz!
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-500/5 to-amber-500/5 border border-orange-500/10 dark:border-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Ushbu oy uchun xarajat limiti belgilanmagan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Byudjet rejalashtirish orqali oylik xarajatlaringizni maqbullashtiring.</p>
          </div>
          <button
            onClick={() => setBudgetModalOpen(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-orange-500/10"
          >
            Byudjet O'rnatish
          </button>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/50 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-bold text-base">Daromad va Xarajat Trendi</h3>
          <div className="h-72">
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="month" tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: theme === 'dark' ? '#0f172a' : '#ffffff',
                      border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0',
                      borderRadius: '12px'
                    }} 
                  />
                  <Area type="monotone" dataKey="income" name="Daromad" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="expense" name="Xarajat" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                Diagrammani ko'rsatish uchun tranzaksiyalar etarli emas
              </div>
            )}
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/50 shadow-sm space-y-4">
          <h3 className="font-bold text-base">Xarajatlar Taqsimoti</h3>
          <div className="h-72 flex flex-col justify-center">
            {catDist.filter((c: any) => c.type === 'expense').length > 0 ? (
              <div className="relative h-full w-full">
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={catDist.filter((c: any) => c.type === 'expense')}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="amount"
                      nameKey="categoryName"
                    >
                      {catDist.filter((c: any) => c.type === 'expense').map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                      contentStyle={{ 
                        background: theme === 'dark' ? '#0f172a' : '#ffffff',
                        border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0',
                        borderRadius: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Custom Category Legend List */}
                <div className="h-[20%] overflow-y-auto px-2 flex flex-wrap gap-x-3 gap-y-1 justify-center text-xs">
                  {catDist.filter((c: any) => c.type === 'expense').slice(0, 4).map((entry: any, index: number) => (
                    <div key={entry.categoryName} className="flex items-center space-x-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }} />
                      <span className="font-medium truncate max-w-[80px]">{entry.categoryName}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm space-y-2">
                <FolderOpen className="h-10 w-10 stroke-1" />
                <span>Hozircha xarajatlar yo'q</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/50 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base">Oxirgi Tranzaksiyalar</h3>
          <Link
            to="/transactions"
            className="flex items-center text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 hover:underline gap-0.5"
          >
            Barchasini ko'rish
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recent.length > 0 ? (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                  <th className="pb-3 text-xs uppercase tracking-wider">Nomi</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Toifa</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Sana</th>
                  <th className="pb-3 text-right text-xs uppercase tracking-wider">Miqdori</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recent.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 font-medium max-w-[200px] truncate">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{tx.title}</div>
                        {tx.description && <div className="text-xs text-slate-400 font-normal truncate">{tx.description}</div>}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center space-x-2">
                        <span
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tx.category_color || '#ccc' }}
                        />
                        <span className="text-xs font-semibold">{tx.category_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-xs text-slate-500 dark:text-slate-400">
                      {tx.transaction_date}
                    </td>
                    <td className={`py-3.5 text-right font-bold ${
                      tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">
              Hali hech qanday tranzaksiyalar amalga oshirilmagan
            </div>
          )}
        </div>
      </div>

      {/* QUICK TRANSACTION MODAL */}
      {txModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setTxModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-[zoomIn_0.15s_ease-out]">
            <h3 className="text-lg font-bold">Yangi Tranzaksiya Qo'shish</h3>
            
            <form onSubmit={handleTxSubmit} className="space-y-4">
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nomi</label>
                <input
                  type="text"
                  required
                  placeholder="Kvartira ijarasi..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sana</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toifa (Kategoriya)</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
                >
                  <option value="">Tanlang...</option>
                  {categories
                    ?.filter((c: any) => c.type === type)
                    .map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                {categories?.filter((c: any) => c.type === type).length === 0 && (
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTxModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={createTxMutation.isPending}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                >
                  {createTxMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK BUDGET MODAL */}
      {budgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setBudgetModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-[zoomIn_0.15s_ease-out]">
            <div>
              <h3 className="text-lg font-bold">Oylik Xarajat Limiti (Byudjet)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Joriy oy uchun umumiy xarajat limitini o'rnating.</p>
            </div>

            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Limit Miqdori</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="3000000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBudgetModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saveBudgetMutation.isPending}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                >
                  {saveBudgetMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
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
