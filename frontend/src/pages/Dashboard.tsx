import { useState, useEffect } from 'react';
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
  Lightbulb as LightbulbIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
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

interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Modals
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editTxModalOpen, setEditTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<any>(null);
  
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editGoalModalOpen, setEditGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  // Form states for Quick Transaction
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // Form states for Quick Budget
  const [budgetAmount, setBudgetAmount] = useState('');

  // Form states for Savings Goals
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  // Local storage for Savings Goals
  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('control_life_savings_goals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: '1', title: 'Yangi Noutbuk 💻', targetAmount: 12000000, currentAmount: 5500000 },
      { id: '2', title: 'Ta\'til Hordig\'i 🏖️', targetAmount: 8000000, currentAmount: 3200000 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('control_life_savings_goals', JSON.stringify(goals));
  }, [goals]);

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

  // Update Transaction Mutation
  const updateTxMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      const res = await apiClient.put(`/api/transactions/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setEditTxModalOpen(false);
      setEditingTx(null);
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
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Tranzaksiya o\'chirildi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'O\'chirishda xatolik');
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

  // Delete Budget Mutation
  const deleteBudgetMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.delete(`/api/budgets/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Byudjet limiti olib tashlandi');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'O\'chirishda xatolik');
    },
  });

  if (dashLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-10 w-10 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
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

  const handleEditTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    updateTxMutation.mutate({
      id: editingTx.id,
      payload: {
        title,
        amount: parseFloat(amount),
        description: description || null,
        transaction_date: txDate,
        type,
        category_id: parseInt(categoryId, 10),
      },
    });
  };

  const handleOpenEditTx = (tx: any) => {
    setEditingTx(tx);
    setTitle(tx.title);
    setAmount(tx.amount.toString());
    setDescription(tx.description || '');
    setType(tx.type);
    setCategoryId(tx.category_id.toString());
    setTxDate(tx.transaction_date.split('T')[0]);
    setEditTxModalOpen(true);
  };

  const handleDeleteTx = (id: number) => {
    if (confirm('Rostdan ham ushbu tranzaksiyani o\'chirmoqchimisiz?')) {
      deleteTxMutation.mutate(id);
    }
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

  const handleDeleteBudget = () => {
    if (budgetInfo && budgetInfo.id) {
      if (confirm('Oylik byudjet limitini o\'chirmoqchimisiz?')) {
        deleteBudgetMutation.mutate(budgetInfo.id);
      }
    }
  };

  // Savings Goal Handlers
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || !goalTarget) return;
    const newGoal: SavingsGoal = {
      id: Date.now().toString(),
      title: goalTitle,
      targetAmount: parseFloat(goalTarget),
      currentAmount: 0,
    };
    setGoals((prev) => [...prev, newGoal]);
    setGoalTitle('');
    setGoalTarget('');
    setGoalModalOpen(false);
    toast.success('Yangi jamg\'arma maqsadi yaratildi! 🎯');
  };

  const handleOpenEditGoal = (g: SavingsGoal) => {
    setEditingGoal(g);
    setGoalTitle(g.title);
    setGoalTarget(g.targetAmount.toString());
    setEditGoalModalOpen(true);
  };

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !goalTitle || !goalTarget) return;
    setGoals((prev) =>
      prev.map((g) =>
        g.id === editingGoal.id
          ? { ...g, title: goalTitle, targetAmount: parseFloat(goalTarget) }
          : g
      )
    );
    setGoalTitle('');
    setGoalTarget('');
    setEditingGoal(null);
    setEditGoalModalOpen(false);
    toast.success('Maqsad tahrirlandi! ✏️');
  };

  const handleDepositToGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !depositAmount) return;
    const dep = parseFloat(depositAmount);
    setGoals((prev) =>
      prev.map((g) => (g.id === selectedGoal.id ? { ...g, currentAmount: g.currentAmount + dep } : g))
    );
    setDepositAmount('');
    setDepositModalOpen(false);
    setSelectedGoal(null);
    toast.success('Maqsadga pul ajratildi! 💰');
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('Ushbu maqsadni o\'chirmoqchimisiz?')) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast.success('Maqsad o\'chirildi');
    }
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
    let score = Math.round(ratio * 70);

    if (budgetInfo && !budgetInfo.isExceeded) {
      score += 30;
    } else if (!budgetInfo) {
      score += 15;
    }
    return Math.min(100, Math.max(10, score));
  };

  const healthScore = computeHealthScore();
  const getHealthBadge = (s: number) => {
    if (s >= 80) return { label: "A'lo (A+)", color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (s >= 50) return { label: "Barqaror (B)", color: 'text-[#FCD34D] bg-[#F59E0B]/10 border-amber-500/30' };
    return { label: "Ogoh bo'ling (C)", color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const healthBadge = getHealthBadge(healthScore);

  // Generate Smart Insights
  const generateInsights = () => {
    const insights = [];
    
    // Top category insight
    if (catDist && catDist.length > 0) {
      const topCat = catDist[0];
      const totalExp = summary.totalExpense || 1;
      const pct = Math.round((topCat.total / totalExp) * 100);
      insights.push({
        type: 'alert',
        title: `Asosiy Xarajat Toifasi: ${topCat.category_name}`,
        desc: `Ushbu oyda xarajatlaringizning ${pct}% qismi "${topCat.category_name}" toifasiga to'g'ri keldi.`,
      });
    }

    // Savings ratio insight
    if (summary.totalIncome > 0) {
      const savedRatio = Math.max(0, Math.round(((summary.totalIncome - summary.totalExpense) / summary.totalIncome) * 100));
      if (savedRatio >= 20) {
        insights.push({
          type: 'success',
          title: "Zo'r Tejamkorlik Ko'rsatkichi!",
          desc: `Ushbu oyda daromadingizning ${savedRatio}% qismini tejashga erishdingiz. Barakalla!`,
        });
      } else {
        insights.push({
          type: 'info',
          title: "Tejamkorlik Imkoniyati",
          desc: `Ushbu oyda daromadingizning ${savedRatio}% qismi saqlandi. Har oy 20% tejashni maqsad qiling.`,
        });
      }
    }

    // Budget tip
    if (budgetInfo) {
      if (budgetInfo.isExceeded) {
        insights.push({
          type: 'warning',
          title: "Byudjet Cheklovi Oshdi",
          desc: `Oylik xarajatingiz belgilangan limitdan ${budgetInfo.percentageUsed - 100}% ga oshib ketdi.`,
        });
      } else {
        insights.push({
          type: 'success',
          title: "Byudjet Nazorati Yaxshi",
          desc: `Oylik byudjetingizning ${budgetInfo.percentageUsed}% qismi ishlatildi. Reja doirasidasiz!`,
        });
      }
    }

    return insights;
  };

  const smartInsights = generateInsights();

  // Pie chart colors
  const COLORS = ['#F59E0B', '#FCD34D', '#8B5CF6', '#EC4899', '#10B981', '#64748B'];

  return (
    <div className="space-y-8">
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16161E] p-6 rounded-2xl border border-amber-500/20 backdrop-blur-sm shadow-xl">
        <div>
          <h1 className="text-2xl font-black tracking-tight font-display text-white">Xush kelibsiz, {user?.full_name}! 👋</h1>
          <p className="text-sm text-slate-400">Moliyaviy ko'rsatkichlaringiz va statistikangiz rejasi.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setBudgetModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/20 bg-[#0B0B0E] text-slate-200 text-sm font-bold hover:bg-white/5 transition-colors"
          >
            <SavingsIcon style={{ fontSize: 20 }} className="text-[#FCD34D]" />
            Byudjet
          </button>
          <button
            onClick={() => setTxModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl gold-gradient text-[#0B0B0E] text-sm font-extrabold shadow-lg shadow-amber-500/20 transition-all"
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
          <div className="h-12 w-12 rounded-xl bg-[#F59E0B]/15 text-[#FCD34D] flex items-center justify-center flex-shrink-0">
            <AccountBalanceWalletIcon style={{ fontSize: 28 }} className="animate-gold-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#FCD34D] uppercase tracking-wider">Umumiy Balans</span>
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
              <SpeedIcon style={{ fontSize: 22 }} className="text-[#FCD34D] animate-gold-pulse" />
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
            <div className="w-full bg-[#0B0B0E] rounded-full h-3 overflow-hidden border border-amber-500/20">
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
            <FlashOnIcon style={{ fontSize: 22 }} className="text-[#FCD34D] animate-gold-pulse" />
            <h3 className="font-bold text-white">1-Click Tezkor Xarajat Kiritish</h3>
          </div>
          <p className="text-xs text-slate-400">Bir bosishda tayyor shablon orqali tranzaksiya yarating:</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <button
              onClick={() => handleQuickPreset('Kofe ☕', '15000')}
              className="p-3.5 rounded-xl bg-[#0B0B0E] border border-amber-500/20 hover:border-[#F59E0B] hover:bg-white/5 transition-all text-left flex flex-col justify-between space-y-2 group"
            >
              <LocalCoffeeIcon style={{ fontSize: 24 }} className="text-[#FCD34D] animate-coffee-steam" />
              <div>
                <div className="text-xs font-bold text-white">Kofe</div>
                <div className="text-[11px] text-[#FCD34D] font-semibold">15,000 UZS</div>
              </div>
            </button>

            <button
              onClick={() => handleQuickPreset('Tushlik 🍱', '40000')}
              className="p-3.5 rounded-xl bg-[#0B0B0E] border border-amber-500/20 hover:border-[#F59E0B] hover:bg-white/5 transition-all text-left flex flex-col justify-between space-y-2 group"
            >
              <RestaurantIcon style={{ fontSize: 24 }} className="text-[#FCD34D] animate-lunch-bounce" />
              <div>
                <div className="text-xs font-bold text-white">Tushlik</div>
                <div className="text-[11px] text-[#FCD34D] font-semibold">40,000 UZS</div>
              </div>
            </button>

            <button
              onClick={() => handleQuickPreset('Taksi 🚖', '25000')}
              className="p-3.5 rounded-xl bg-[#0B0B0E] border border-amber-500/20 hover:border-[#F59E0B] hover:bg-white/5 transition-all text-left flex flex-col justify-between space-y-2 group"
            >
              <LocalTaxiIcon style={{ fontSize: 24 }} className="text-[#FCD34D] animate-taxi-drive" />
              <div>
                <div className="text-xs font-bold text-white">Taksi</div>
                <div className="text-[11px] text-[#FCD34D] font-semibold">25,000 UZS</div>
              </div>
            </button>

            <button
              onClick={() => handleQuickPreset('Oziq-ovqat 🛒', '100000')}
              className="p-3.5 rounded-xl bg-[#0B0B0E] border border-amber-500/20 hover:border-[#F59E0B] hover:bg-white/5 transition-all text-left flex flex-col justify-between space-y-2 group"
            >
              <ShoppingCartIcon style={{ fontSize: 24 }} className="text-[#FCD34D] animate-cart-pulse" />
              <div>
                <div className="text-xs font-bold text-white">Oziq-ovqat</div>
                <div className="text-[11px] text-[#FCD34D] font-semibold">100,000 UZS</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Smart Insights & Savings Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Smart AI Insights */}
        <div className="p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 space-y-4">
          <div className="flex items-center space-x-2">
            <LightbulbIcon style={{ fontSize: 24 }} className="text-[#FCD34D]" />
            <h3 className="font-bold text-white">Smart Insights 💡</h3>
          </div>
          <p className="text-xs text-slate-400">Moliyaviy odatlaringiz bo'yicha aqlli maslahatlar:</p>

          <div className="space-y-3">
            {smartInsights.map((insight, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#0B0B0E] border border-amber-500/15 space-y-1">
                <div className="text-xs font-bold text-[#FCD34D] flex items-center gap-1.5">
                  <CheckCircleIcon style={{ fontSize: 16 }} className="text-emerald-400" />
                  {insight.title}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{insight.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Savings Goals Tracker */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#FCD34D]">Jamg'arma Maqsadlari Tracker 🎯</h3>
              <p className="text-xs text-slate-400">Orzularingiz uchun jamg'arilayotgan mablag'lar</p>
            </div>
            <button
              onClick={() => setGoalModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 text-[#FCD34D] text-xs font-bold border border-amber-500/30 transition-all flex items-center gap-1"
            >
              <AddIcon style={{ fontSize: 16 }} />
              Yangi Maqsad
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
              return (
                <div key={g.id} className="p-4 rounded-xl bg-[#0B0B0E] border border-amber-500/20 space-y-3 relative group">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{g.title}</h4>
                      <span className="text-xs text-slate-400 font-medium">
                        {formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditGoal(g)}
                        className="p-1 rounded text-slate-400 hover:text-[#FCD34D]"
                        title="Maqsadni tahrirlash"
                      >
                        <EditIcon style={{ fontSize: 16 }} />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(g.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400"
                        title="O'chirish"
                      >
                        <DeleteIcon style={{ fontSize: 16 }} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-[#FCD34D]">
                      <span>Ershildi:</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-black/80 rounded-full h-2.5 overflow-hidden border border-amber-500/20">
                      <div className="h-full gold-gradient rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <button
                    onClick={() => { setSelectedGoal(g); setDepositModalOpen(true); }}
                    className="w-full py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-[#FCD34D] text-xs font-bold border border-amber-500/20 transition-all"
                  >
                    + Pul Qo'shish
                  </button>
                </div>
              );
            })}
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
              <CalendarMonthIcon style={{ fontSize: 22 }} className="text-[#FCD34D]" />
              <h3 className="font-bold text-white">
                Ushbu oy uchun byudjet holati (Taqvim bo'yicha)
              </h3>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm font-bold text-[#FCD34D]">
                {formatCurrency(budgetInfo.totalExpenses)} / {formatCurrency(budgetInfo.budgetAmount)} ({budgetInfo.percentageUsed}%)
              </div>
              <button
                onClick={handleDeleteBudget}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                title="Byudjet limitini o'chirish"
              >
                <DeleteIcon style={{ fontSize: 18 }} />
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-[#0B0B0E] rounded-full h-3.5 overflow-hidden border border-amber-500/10">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                budgetInfo.isExceeded ? 'bg-rose-500 animate-pulse' : 'gold-gradient'
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
            className="px-4 py-2 gold-gradient text-[#0B0B0E] rounded-xl text-xs font-black transition-colors shadow-md shadow-amber-500/20"
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
              <h3 className="font-bold text-[#FCD34D]">Oylik Dinamika (Daromad va Xarajatlar)</h3>
              <p className="text-xs text-slate-400">Oxirgi oylar bo'yicha tahlil</p>
            </div>
            <ShowChartIcon style={{ fontSize: 24 }} className="text-[#FCD34D]" />
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
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0B0B0E', 
                    borderColor: 'rgba(251, 191, 36, 0.3)',
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                />
                <Area type="monotone" dataKey="income" name="Daromad" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expense" name="Xarajat" stroke="#F59E0B" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="p-6 rounded-2xl bg-[#16161E] border border-amber-500/20 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#FCD34D]">Kategoriyalar Ulushi</h3>
              <p className="text-xs text-slate-400">Xarajatlar strukturasi</p>
            </div>
            <DonutSmallIcon style={{ fontSize: 24 }} className="text-[#FCD34D]" />
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0B0B0E" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0B0B0E', 
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
            <h3 className="font-bold text-[#FCD34D]">Oxirgi Tranzaksiyalar</h3>
            <p className="text-xs text-slate-400">Oxirgi amalga oshirilgan 5 ta tranzaksiya</p>
          </div>
          <Link
            to="/transactions"
            className="flex items-center text-xs font-bold text-[#FCD34D] hover:text-[#F59E0B] underline gap-0.5"
          >
            Barchasini ko'rish <ChevronRightIcon style={{ fontSize: 16 }} />
          </Link>
        </div>

        {recent && recent.length > 0 ? (
          <div className="divide-y divide-amber-500/10">
            {recent.map((tx: any) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between hover:bg-white/5 px-3 rounded-xl transition-colors group">
                <div className="flex items-center space-x-3.5">
                  <div 
                    className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                    style={{ backgroundColor: tx.category_color || '#F59E0B' }}
                  >
                    {tx.category_name ? tx.category_name.charAt(0).toUpperCase() : 'T'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{tx.title}</h4>
                    <span className="text-xs text-slate-400">{tx.category_name} • {new Date(tx.transaction_date).toLocaleDateString('uz-UZ')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`text-sm font-black ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditTx(tx)}
                      className="p-1 rounded text-slate-400 hover:text-[#FCD34D]"
                      title="Tahrirlash"
                    >
                      <EditIcon style={{ fontSize: 18 }} />
                    </button>
                    <button
                      onClick={() => handleDeleteTx(tx.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400"
                      title="O'chirish"
                    >
                      <DeleteIcon style={{ fontSize: 18 }} />
                    </button>
                  </div>
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
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Nomi</label>
                <input
                  type="text"
                  placeholder="Masalan: Tushlik yoki Ish haqi"
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
                    placeholder="100000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#FCD34D] uppercase">Turi</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'income' | 'expense')}
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
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
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
                  onClick={() => setTxModalOpen(false)}
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
      {editTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#16161E] border border-amber-500/30 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-white">Tranzaksiyani Tahrirlash 🟡</h3>

            <form onSubmit={handleEditTxSubmit} className="space-y-4">
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
                    value={type}
                    onChange={(e) => setType(e.target.value as 'income' | 'expense')}
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
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
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
                  onClick={() => setEditTxModalOpen(false)}
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

      {/* Modal: Set Budget */}
      {budgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#16161E] border border-amber-500/30 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-white">Oylik Byudjet Belgilash 🟡</h3>

            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Oylik Cheklov Summasi ({currencySymbol})</label>
                <input
                  type="number"
                  placeholder="5000000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
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
                  className="flex-1 py-2.5 gold-gradient text-[#0B0B0E] text-sm font-extrabold rounded-xl shadow transition-colors"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Goal */}
      {goalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#16161E] border border-amber-500/30 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-white">Yangi Jamg'arma Maqsadi 🎯</h3>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Maqsad Nomi</label>
                <input
                  type="text"
                  placeholder="Masalan: Yangi Telefon 📱"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Maqsad Summasi ({currencySymbol})</label>
                <input
                  type="number"
                  placeholder="10000000"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGoalModalOpen(false)}
                  className="flex-1 py-2.5 border border-amber-500/20 text-slate-300 text-sm font-semibold rounded-xl hover:bg-white/5"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 gold-gradient text-[#0B0B0E] text-sm font-extrabold rounded-xl shadow transition-colors"
                >
                  Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Goal */}
      {editGoalModalOpen && editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#16161E] border border-amber-500/30 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-white">Maqsadni Tahrirlash ✏️</h3>

            <form onSubmit={handleUpdateGoal} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Maqsad Nomi</label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Maqsad Summasi ({currencySymbol})</label>
                <input
                  type="number"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setEditGoalModalOpen(false); setEditingGoal(null); }}
                  className="flex-1 py-2.5 border border-amber-500/20 text-slate-300 text-sm font-semibold rounded-xl hover:bg-white/5"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 gold-gradient text-[#0B0B0E] text-sm font-extrabold rounded-xl shadow transition-colors"
                >
                  Yangilash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Deposit to Goal */}
      {depositModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#16161E] border border-amber-500/30 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-white">"{selectedGoal.title}" ga Pul Ajratish 💰</h3>

            <form onSubmit={handleDepositToGoal} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Ajratilayotgan Summa ({currencySymbol})</label>
                <input
                  type="number"
                  placeholder="500000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setDepositModalOpen(false); setSelectedGoal(null); }}
                  className="flex-1 py-2.5 border border-amber-500/20 text-slate-300 text-sm font-semibold rounded-xl hover:bg-white/5"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 gold-gradient text-[#0B0B0E] text-sm font-extrabold rounded-xl shadow transition-colors"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
