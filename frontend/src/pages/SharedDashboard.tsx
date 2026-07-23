import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  AccountBalanceWallet as AccountBalanceWalletIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Savings as SavingsIcon,
  DonutSmall as DonutSmallIcon,
  ShowChart as ShowChartIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Share as ShareIcon,
  Lock as LockIcon,
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
  Cell,
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export default function SharedDashboard() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSharedData() {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_BASE_URL}/api/public/shared/${token}`);
        setData(res.data.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            'Ommaviy havola topilmadi yoki foydalanuvchi tomonidan o\'chirilgan.'
        );
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      fetchSharedData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium">Ommaviy hisob-kitob ma'lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <LockIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Havola mavjud emas</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <Link
            to="/auth/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
          >
            <LoginIcon className="w-5 h-5" /> Tizimga kirish
          </Link>
        </div>
      </div>
    );
  }

  const { user, summary, recent, categories, trend } = data;
  const currency = user.currency || 'UZS';

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6'];

  const categoryChartData = (categories || []).map((cat: any) => ({
    name: cat.name,
    value: parseFloat(cat.total_amount || 0),
    color: cat.color || '#f59e0b',
  }));

  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('uz-UZ').format(num || 0) + ' ' + currency;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Top Read-Only Banner */}
      <header className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b border-amber-500/30 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <ShareIcon />
            </div>
            <div>
              <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                Ommaviy Ulashilgan Sahifa (Read-Only)
              </p>
              <h1 className="text-base font-bold text-slate-100">
                <span className="text-amber-400">{user.full_name}</span> hisob-kitoblari va moliya statistikasi
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/auth/login"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <LoginIcon className="w-4 h-4" /> Kirish
            </Link>
            <Link
              to="/auth/register"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <PersonAddIcon className="w-4 h-4" /> Ro'yxatdan o'tish
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 pt-8 space-y-8">
        {/* User Card & Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* User Profile Overview */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
            <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 rounded-full flex items-center justify-center font-black text-2xl mb-3 shadow-lg border-2 border-amber-400">
              {user.avatar ? (
                <img src={user.avatar} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.full_name.charAt(0).toUpperCase()
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-100">{user.full_name}</h2>
            <p className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-medium mt-1">
              Ommaviy Statistika
            </p>
          </div>

          {/* Total Balance */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-400">Umumiy Balans</span>
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <AccountBalanceWalletIcon />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-100">
                {formatCurrency(summary?.totalBalance || 0)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Hozirgi barcha qoldiq</p>
            </div>
          </div>

          {/* Total Income */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-400">Jami Daromad</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <TrendingUpIcon />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-emerald-400">
                +{formatCurrency(summary?.totalIncome || 0)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Barcha daromadlar jamlanmasi</p>
            </div>
          </div>

          {/* Total Expense */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-400">Jami Xarajat</span>
              <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                <TrendingDownIcon />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-rose-400">
                -{formatCurrency(summary?.totalExpenses || 0)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Barcha chiqimlar jamlanmasi</p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Monthly Trend Area Chart */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ShowChartIcon className="text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">Oylik Dinamika va Trend</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">So'nggi oylar</span>
            </div>
            <div className="h-72 w-full">
              {trend && trend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                    />
                    <Area type="monotone" dataKey="income" name="Daromad" stroke="#10b981" fillOpacity={1} fill="url(#incomeGrad)" />
                    <Area type="monotone" dataKey="expense" name="Xarajat" stroke="#ef4444" fillOpacity={1} fill="url(#expenseGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  Dinamika ma'lumotlari hali mavjud emas
                </div>
              )}
            </div>
          </div>

          {/* Category Distribution Pie Chart */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <DonutSmallIcon className="text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">Kategoriyalar Haqida</h3>
              </div>
              <div className="h-56 w-full flex items-center justify-center">
                {categoryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryChartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-500 text-sm">Kategoriya ma'lumotlari yo'q</div>
                )}
              </div>
            </div>

            {/* Legend list */}
            <div className="space-y-2 mt-4 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
              {categoryChartData.map((cat: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span className="text-slate-300 font-medium">{cat.name}</span>
                  </div>
                  <span className="text-slate-400 font-mono">{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-slate-100 mb-6 flex items-center gap-2">
            <SavingsIcon className="text-amber-400" /> So'nggi Tranzaksiyalar
          </h3>

          {recent && recent.transactions && recent.transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Sana</th>
                    <th className="py-3 px-4">Nomi</th>
                    <th className="py-3 px-4">Kategoriya</th>
                    <th className="py-3 px-4 text-right">Summa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recent.transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {new Date(tx.transaction_date).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-100">{tx.title}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {tx.category_name || 'Umumiy'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold">
                        <span className={tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              Hozircha hech qanday tranzaksiya mavjud emas
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
