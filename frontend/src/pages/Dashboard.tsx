import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import {
  AccountBalanceWallet as AccountBalanceWalletIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Savings as SavingsIcon,
  AddCircle as AddCircleIcon,
  DonutSmall as DonutSmallIcon,
  ShowChart as ShowChartIcon,
  FlashOn as FlashOnIcon,
  Speed as SpeedIcon,
  CalendarMonth as CalendarMonthIcon,
  Warning as WarningIcon,
  ChevronRight as ChevronRightIcon,
  FolderOpen as FolderOpenIcon,
  Coffee as LocalCoffeeIcon,
  Restaurant as RestaurantIcon,
  LocalTaxi as LocalTaxiIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';

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
  const { user } = useAuthStore();
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
        <div className="h-10 w-10 border-4 border-[#FBBF24] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  if (dashError) {
    return (
      <div className="p-6 text-center bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
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

  // Quick Preset Handler
  const handleQuickPreset = (presetTitle: string, presetAmount: string, defaultType: 'expense' | 'income' = 'expense') => {
    setTitle(presetTitle);
    setAmount(presetAmount);
    setType(defaultType);
    if (categories && categories.length > 0) {
      const matched = categories.find((c: any) => c.type === defaultType);
      if (matched) setCategoryId(matched.id.toString());
    }
    setTxModalOpen(true);
  };

  // Compute Financial Health Score (0 - 100)
  const computeHealthScore = () => {
    const income = summary.totalIncome || 1;
    const expense = summary.totalExpense || 0;
    const ratio = Math.max(0, 1 - expense / income);
    let score = Math.round(ratio * 70); // Up to 70 pts from saving ratio

    if (budgetInfo && !budgetInfo.isExceeded) {
      score += 30; // +30 pts for staying within budget
    } else if (!budgetInfo) {
      score += 15;
    }
    return Math.min(100, Math.max(10, score));
  };

  const healthScore = computeHealthScore();
  const getHealthBadge = (s: number) => {
    if (s >= 80) return { label: "A'lo (A+)", color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (s >= 50) return { label: "Barqaror (B)", color: 'text-[#FBBF24] bg-[#FBBF24]/10 border-amber-500/30' };
    return { label: "Ogoh bo'ling (C)", color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const healthBadge = getHealthBadge(healthScore);

  // Pie chart colors
  const COLORS = ['#FBBF24', '#FCD34D', '#8B5CF6', '#EC4899', '#10B981', '#64748B'];

  return (
    <div className="space-y-8">
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16161E] p-6 rounded-2xl border border-amber-500/20 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight font-display text-white">Xush kelibsiz, {user?.full_name}! 👋</h1>
          <p className="text-sm text-slate-400">Moliyaviy ko'rsatkichlaringiz va statistikangiz rejasi.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setBudgetModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/20 bg-black/40 text-slate-200 text-sm font-semibold hover:bg-white/5 transition-colors"
          >
            <SavingsIcon style={{ fontSize: 20 }} className="text-[#FBBF24]" />
            Byudjet
          </button>
          <button
            onClick={() => setTxModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FBBF24] hover:bg-[#FCD34D] text-[#111111] text-sm font-bold shadow-lg shadow-amber-500/20 transition-all duration-150"
          >
            <AddCircleIcon style={{ fontSize: 20 }} />
            Tranzaksiya qo'shish
          </button>
        </div>
      </div>

      {/* Grid of Key stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Balance */}
        <div className="p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 stripe-card shadow-sm flex items-center space-x-5 hover:-translate-y-1 transition-transform">
          <div className="h-12 w-12 rounded-xl bg-[#FBBF24]/15 text-[#FBBF24] flex items-center justify-center flex-shrink-0">
            <AccountBalanceWalletIcon style={{ fontSize: 28 }} />
          </div>
          <div>
            <span className="text-xs font-bold text-[#FBBF24] uppercase tracking-wider">Umumiy Balans</span>
            <h2 className="text-2xl font-black font-display mt-1 text-white">
              {formatCurrency(summary.balance)}
            </h2>
          </div>
        </div>

        {/* Card 2: Income */}
        <div className="p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 shadow-sm flex items-center space-x-5 hover:-translate-y-1 transition-transform">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <TrendingUpIcon style={{ fontSize: 28 }} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jami Daromad</span>
            <h2 className="text-2xl font-black font-display mt-1 text-white">
              {formatCurrency(summary.totalIncome)}
            </h2>
          </div>
        </div>

        {/* Card 3: Expense */}
        <div className="p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 shadow-sm flex items-center space-x-5 hover:-translate-y-1 transition-transform">
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
            <TrendingDownIcon style={{ fontSize: 28 }} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jami Xarajat</span>
            <h2 className="text-2xl font-black font-display mt-1 text-white">
              {formatCurrency(summary.totalExpense)}
            </h2>
          </div>
        </div>
      </div>

      {/* Financial Health & 1-Click Quick Presets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Health Card */}
        <div className="p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SpeedIcon style={{ fontSize: 22 }} className="text-[#FBBF24]" />
              <h3 className="font-bold text-white">Moliyaviy Salomatlik Indeksi</h3>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${healthBadge.color}`}>
              {healthBadge.label}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-black text-white">{healthScore} <span className="text-sm font-normal text-slate-400">/ 100 ball</span></span>
              <span className="text-xs text-slate-400">Tejamkorlik va Byudjet</span>
            </div>
            <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden border border-amber-500/20">
              <div 
                className="h-full gold-gradient rounded-full transition-all duration-500 gold-glow" 
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Sizning oylik xarajatingiz va byudjet intizomingiz asosida hisoblangan reyting.
          </p>
        </div>

        {/* 1-Click Quick Expense Presets */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 space-y-4">
          <div className="flex items-center space-x-2">
            <FlashOnIcon style={{ fontSize: 22 }} className="text-[#FBBF24]" />
            <h3 className="font-bold text-white">1-Click Tezkor Xarajat Kiritish</h3>
          </div>
          <p className="text-xs text-slate-400">Bir bosishda tayyor shablon orqali tranzaksiya yarating:</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <button
              onClick={() => handleQuickPreset('Kofe ☕', '15000')}
              className="p-3.5 rounded-xl bg-black/40 border border-amber-500/20 hover:border-[#FBBF24] hover:bg-white/5 transition-all text-left flex flex-col justify-between space-y-2 group"
            >
              <LocalCoffeeIcon style={{ fontSize: 22 }} className="text-[#FBBF24] group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-bold text-white">Kofe</div>
                <div className="text-[11px] text-amber-400 font-semibold">15,000 UZS</div>
              </div>
            </button>

            <button
              onClick={() => handleQuickPreset('Tushlik 🍱', '40000')}
              className="p-3.5 rounded-xl bg-black/40 border border-amber-500/20 hover:border-[#FBBF24] hover:bg-white/5 transition-all text-left flex flex-col justify-between space-y-2 group"
            >
              <RestaurantIcon style={{ fontSize: 22 }} className="text-[#FBBF24] group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-bold text-white">Tushlik</div>
                <div className="text-[11px] text-amber-400 font-semibold">40,000 UZS</div>
              </div>
            </button>

            <button
              onClick={() => handleQuickPreset('Taksi 🚖', '25000')}
              className="p-3.5 rounded-xl bg-black/40 border border-amber-500/20 hover:border-[#FBBF24] hover:bg-white/5 transition-all text-left flex flex-col justify-between space-y-2 group"
            >
              <LocalTaxiIcon style={{ fontSize: 22 }} className="text-[#FBBF24] group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-bold text-white">Taksi</div>
                <div className="text-[11px] text-amber-400 font-semibold">25,000 UZS</div>
              </div>
            </button>

            <button
              onClick={() => handleQuickPreset('Oziq-ovqat 🛒', '100000')}
              className="p-3.5 rounded-xl bg-black/40 border border-amber-500/20 hover:border-[#FBBF24] hover:bg-white/5 transition-all text-left flex flex-col justify-between space-y-2 group"
            >
              <ShoppingCartIcon style={{ fontSize: 22 }} className="text-[#FBBF24] group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-bold text-white">Oziq-ovqat</div>
                <div className="text-[11px] text-amber-400 font-semibold">100,000 UZS</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Budget Info Panel */}
      {budgetInfo ? (
        <div className={`p-6 rounded-2xl border transition-colors ${
          budgetInfo.isExceeded 
            ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' 
            : 'bg-[#16161E] border-amber-500/20'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <CalendarMonthIcon style={{ fontSize: 22 }} className="text-[#FBBF24]" />
              <h3 className="font-bold text-white">
                Ushbu oy uchun byudjet holati (Taqvim bo'yicha)
              </h3>
            </div>
            <div className="text-sm font-bold text-[#FCD34D]">
              {formatCurrency(budgetInfo.totalExpenses)} / {formatCurrency(budgetInfo.budgetAmount)} ({budgetInfo.percentageUsed}%)
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-black/50 rounded-full h-3.5 overflow-hidden border border-amber-500/10">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                budgetInfo.isExceeded ? 'bg-rose-500 animate-pulse' : 'bg-[#FBBF24]'
              }`}
              style={{ width: `${Math.min(budgetInfo.percentageUsed, 100)}%` }}
            />
          </div>

          {budgetInfo.isExceeded && (
            <div className="flex items-center mt-3 text-xs text-rose-400 font-semibold gap-1.5 animate-bounce">
              <WarningIcon style={{ fontSize: 18 }} />
              Diqqat! Oylik xarajat limitidan oshib ketdingiz!
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-white">Ushbu oy uchun xarajat limiti belgilanmagan</h3>
            <p className="text-xs text-slate-400">Byudjet rejalashtirish orqali oylik xarajatlaringizni maqbullashtiring.</p>
          </div>
          <button
            onClick={() => setBudgetModalOpen(true)}
            className="px-4 py-2 bg-[#FBBF24] hover:bg-[#FCD34D] text-[#111111] rounded-xl text-xs font-bold transition-colors shadow-md shadow-amber-500/20"
          >
            Byudjet O'rnatish
          </button>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#FBBF24]">Oylik Dinamika (Daromad va Xarajatlar)</h3>
              <p className="text-xs text-slate-400">Oxirgi oylar bo'yicha tahlil</p>
            </div>
            <ShowChartIcon style={{ fontSize: 24 }} className="text-[#FBBF24]" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#FBBF24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111111', 
                    borderColor: 'rgba(251, 191, 36, 0.3)',
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                />
                <Area type="monotone" dataKey="income" name="Daromad" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expense" name="Xarajat" stroke="#FBBF24" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#FBBF24]">Kategoriyalar Ulushi</h3>
              <p className="text-xs text-slate-400">Xarajatlar strukturasi</p>
            </div>
            <DonutSmallIcon style={{ fontSize: 24 }} className="text-[#FBBF24]" />
          </div>

          {catDist && catDist.length > 0 ? (
            <div className="h-56 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={catDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="total"
                    nameKey="category_name"
                  >
                    {catDist.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#111" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#111111', 
                      borderColor: 'rgba(251, 191, 36, 0.3)',
                      borderRadius: '10px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <FolderOpenIcon style={{ fontSize: 40 }} className="mb-2 text-slate-600" />
              <p className="text-xs">Ushbu oy uchun xarajatlar yo'q</p>
            </div>
          )}

          {/* Legend list */}
          <div className="space-y-1.5 pt-2 border-t border-amber-500/20 max-h-36 overflow-y-auto">
            {catDist.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-300 font-medium">{item.category_name}</span>
                </div>
                <span className="font-bold text-white">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#FBBF24]">Oxirgi Tranzaksiyalar</h3>
            <p className="text-xs text-slate-400">Oxirgi amalga oshirilgan 5 ta tranzaksiya</p>
          </div>
          <Link
            to="/transactions"
            className="flex items-center text-xs font-bold text-[#FBBF24] hover:text-[#FCD34D] underline gap-0.5"
          >
            Barchasini ko'rish <ChevronRightIcon style={{ fontSize: 16 }} />
          </Link>
        </div>

        {recent && recent.length > 0 ? (
          <div className="divide-y divide-amber-500/10">
            {recent.map((tx: any) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between hover:bg-white/5 px-3 rounded-xl transition-colors">
                <div className="flex items-center space-x-3.5">
                  <div 
                    className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                    style={{ backgroundColor: tx.category_color || '#FBBF24' }}
                  >
                    {tx.category_name ? tx.category_name.charAt(0).toUpperCase() : 'T'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{tx.title}</h4>
                    <span className="text-xs text-slate-400">{tx.category_name} • {new Date(tx.transaction_date).toLocaleDateString('uz-UZ')}</span>
                  </div>
                </div>
                <div className={`text-sm font-black ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-sm">
            Hozircha hech qanday tranzaksiya mavjud emas.
          </div>
        )}
      </div>

      {/* Modal: Create Transaction */}
      {txModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#16161E] border border-amber-500/30 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-white">Yangi Tranzaksiya Yaratish 🟡</h3>

            <form onSubmit={handleTxSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#FBBF24] uppercase">Nomi</label>
                <input
                  type="text"
                  placeholder="Masalan: Tushlik yoki Ish haqi"
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
                    placeholder="100000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#111111] text-white text-sm focus:outline-none focus:border-[#FBBF24]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#FBBF24] uppercase">Turi</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                    className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#111111] text-white text-sm focus:outline-none focus:border-[#FBBF24]"
                  >
                    <option value="expense">Xarajat (-)</option>
                    <option value="income">Daromad (+)</option>
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
                    ?.filter((c: any) => c.type === type)
                    .map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#FBBF24] uppercase">Sana</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#111111] text-white text-sm focus:outline-none focus:border-[#FBBF24]"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTxModalOpen(false)}
                  className="flex-1 py-2.5 border border-amber-500/20 text-slate-300 text-sm font-semibold rounded-xl hover:bg-white/5"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={createTxMutation.isPending}
                  className="flex-1 py-2.5 bg-[#FBBF24] hover:bg-[#FCD34D] text-[#111111] text-sm font-bold rounded-xl shadow transition-colors"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Set Budget */}
      {budgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#18181B] border border-amber-500/30 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-white">Oylik Byudjet Belgilash 🟡</h3>

            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#FBBF24] uppercase">Oylik Cheklov Summasi ({currencySymbol})</label>
                <input
                  type="number"
                  placeholder="5000000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#111111] text-white text-sm focus:outline-none focus:border-[#FBBF24]"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBudgetModalOpen(false)}
                  className="flex-1 py-2.5 border border-amber-500/20 text-slate-300 text-sm font-semibold rounded-xl hover:bg-white/5"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saveBudgetMutation.isPending}
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
