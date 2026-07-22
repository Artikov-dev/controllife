import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { 
  Dashboard as DashboardIcon,
  SwapHoriz as SwapHorizIcon,
  Category as CategoryIcon,
  Update as UpdateIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Logout as LogoutIcon,
  WbSunny as SunIcon,
  NightsStay as MoonIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';

export default function DashboardLayout() {
  const { user, logout, theme, toggleTheme, setAuth, accessToken, refreshToken } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [quickTxModalOpen, setQuickTxModalOpen] = useState(false);

  // Form states for profile edit
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [currency, setCurrency] = useState(user?.currency || 'UZS');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Form states for Mobile Quick Tx FAB
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txCategoryId, setTxCategoryId] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setCurrency(user.currency || 'UZS');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  // Sync theme class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Protect route
  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  // Fetch categories for Quick Tx modal
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/api/categories');
      return res.data.data;
    },
    enabled: !!user,
  });

  // Quick Create Transaction Mutation
  const createTxMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/api/transactions', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setQuickTxModalOpen(false);
      
      // Reset
      setTxTitle('');
      setTxAmount('');
      setTxCategoryId('');
      
      if (data.data.budgetWarning) {
        toast.warning(data.data.budgetWarning.message, { duration: 6000 });
      } else {
        toast.success('Tranzaksiya muvaffaqiyatli saqlandi! ⚡');
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      toast.error('Ismingizni kiriting');
      return;
    }
    const updatedUser = {
      ...user,
      full_name: fullName,
      currency: currency,
      avatar: avatar || null,
    };
    if (accessToken && refreshToken) {
      setAuth(updatedUser, accessToken, refreshToken);
    }
    setProfileModalOpen(false);
    toast.success('Profil ma\'lumotlari muvaffaqiyatli yangilandi! 👤');
  };

  const handleQuickTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle || !txAmount || !txCategoryId || !txDate) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }
    createTxMutation.mutate({
      title: txTitle,
      amount: parseFloat(txAmount),
      transaction_date: txDate,
      type: txType,
      category_id: parseInt(txCategoryId, 10),
    });
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: DashboardIcon, role: 'user' },
    { name: 'Tranzaksiyalar', path: '/transactions', icon: SwapHorizIcon, role: 'user' },
    { name: 'Kategoriyalar', path: '/categories', icon: CategoryIcon, role: 'user' },
    { name: 'Davriy to\'lovlar', path: '/recurring', icon: UpdateIcon, role: 'user' },
    { name: 'Admin Panel', path: '/admin', icon: AdminPanelSettingsIcon, role: 'admin' },
  ];

  const activeItem = navItems.find((item) => item.path === location.pathname);

  return (
    <div className="min-h-screen flex bg-[#F4F4F7] dark:bg-[#0B0B0E] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 left-0 bg-white dark:bg-[#16161E] border-r border-amber-500/20 dark:border-amber-500/15 z-20 shadow-lg dark:shadow-xl">
        <div className="p-6 flex items-center space-x-3 border-b border-amber-500/20 dark:border-amber-500/15">
          <div className="h-10 w-10 rounded-xl gold-gradient flex items-center justify-center shadow-md shadow-amber-500/20">
            <AccountBalanceWalletIcon className="text-white dark:text-[#0B0B0E]" style={{ fontSize: 24 }} />
          </div>
          <span className="text-xl font-black tracking-tight font-display gold-gradient-text">
            Control Life 🟡
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems
            .filter((item) => item.role === 'user' || user.role === 'admin')
            .map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white dark:from-[#FCD34D] dark:to-[#F59E0B] dark:text-[#0B0B0E] shadow-md shadow-amber-500/20 font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#D97706] dark:hover:text-[#FCD34D]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent style={{ fontSize: 20 }} className={isActive ? 'text-white dark:text-[#0B0B0E]' : 'text-slate-500 dark:text-slate-400 group-hover:text-[#D97706] dark:group-hover:text-[#FCD34D]'} />
                    <span>{item.name}</span>
                  </div>
                  {!isActive && <ChevronRightIcon style={{ fontSize: 18 }} className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[#D97706] dark:text-[#FCD34D]" />}
                </Link>
              );
            })}
        </nav>

        {/* User Card / Footer */}
        <div className="p-4 border-t border-amber-500/20 dark:border-amber-500/15 bg-slate-50/80 dark:bg-[#0B0B0E]/60">
          <div className="flex items-center space-x-3 p-2 rounded-xl">
            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center space-x-3 flex-1 min-w-0 text-left group"
              title="Profil Sozlamalari"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.full_name} className="h-10 w-10 rounded-full border-2 border-[#F59E0B] object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="h-10 w-10 rounded-full gold-gradient text-white dark:text-[#0B0B0E] font-black flex items-center justify-center border-2 border-[#F59E0B] dark:border-[#FCD34D] group-hover:scale-105 transition-transform">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold truncate text-slate-900 dark:text-white group-hover:text-[#D97706] dark:group-hover:text-[#FCD34D] transition-colors">{user.full_name}</h4>
                <span className="text-xs text-[#D97706] dark:text-[#FCD34D] capitalize font-semibold">{user.role}</span>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              title="Chiqish"
            >
              <LogoutIcon style={{ fontSize: 20 }} />
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile Toggle Drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
          
          <aside className="relative flex flex-col w-full max-w-xs bg-white dark:bg-[#16161E] border-r border-amber-500/20 dark:border-amber-500/15 p-6 z-50 shadow-2xl">
            <div className="flex items-center justify-between pb-6 border-b border-amber-500/20 dark:border-amber-500/15">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl gold-gradient flex items-center justify-center text-white dark:text-[#0B0B0E]">
                  <AccountBalanceWalletIcon style={{ fontSize: 20 }} />
                </div>
                <span className="font-extrabold text-lg gold-gradient-text">Control Life</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-[#D97706]">
                <CloseIcon style={{ fontSize: 22 }} />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-2">
              {navItems
                .filter((item) => item.role === 'user' || user.role === 'admin')
                .map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold ${
                        isActive
                          ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white dark:from-[#FCD34D] dark:to-[#F59E0B] dark:text-[#0B0B0E] font-black'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#D97706]'
                      }`}
                    >
                      <IconComponent style={{ fontSize: 20 }} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
            </nav>

            <div className="pt-4 border-t border-amber-500/20 dark:border-amber-500/15 flex items-center justify-between">
              <button
                onClick={() => { setSidebarOpen(false); setProfileModalOpen(true); }}
                className="flex items-center space-x-3 text-left"
              >
                <div className="h-9 w-9 rounded-full gold-gradient text-white dark:text-[#0B0B0E] flex items-center justify-center font-extrabold text-sm">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user.full_name}</h4>
                  <span className="text-xs text-[#D97706] dark:text-[#FCD34D] capitalize font-semibold">{user.role}</span>
                </div>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-500"
              >
                <LogoutIcon style={{ fontSize: 22 }} />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 pb-20 md:pb-8">
        
        {/* Navbar Header */}
        <header className="sticky top-0 bg-white/90 dark:bg-[#16161E]/85 backdrop-blur-xl border-b border-amber-500/20 dark:border-amber-500/15 h-16 flex items-center justify-between px-4 sm:px-6 z-10 shadow-sm">
          <div className="flex items-center">
            {/* Burger menu for Mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 mr-2 hover:text-[#D97706]"
            >
              <MenuIcon style={{ fontSize: 24 }} />
            </button>
            
            {/* Page Title */}
            <h2 className="text-base sm:text-lg font-black tracking-tight font-display text-slate-900 dark:text-white capitalize">
              {activeItem ? activeItem.name : 'Boshqaruv paneli'}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#D97706] dark:hover:text-[#FCD34D] bg-slate-100 dark:bg-[#0B0B0E]/60 hover:bg-slate-200 dark:hover:bg-white/5 border border-amber-500/20 dark:border-amber-500/15 transition-all duration-150"
              title={theme === 'dark' ? 'Yorug\' rejimga o\'tish' : 'Qorong\'u rejimga o\'tish'}
            >
              {theme === 'dark' ? <SunIcon style={{ fontSize: 20 }} /> : <MoonIcon style={{ fontSize: 20 }} />}
            </button>

            <div className="h-6 w-px bg-amber-500/20 dark:bg-amber-500/15 hidden sm:block" />

            {/* Profile trigger */}
            <button
              onClick={() => setProfileModalOpen(true)}
              className="items-center space-x-3 hidden sm:flex hover:bg-slate-100 dark:hover:bg-white/5 p-1.5 rounded-xl border border-amber-500/20 dark:border-amber-500/15 transition-all"
              title="Profil Sozlamalari"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.full_name} className="h-8 w-8 rounded-full border border-[#F59E0B] object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full gold-gradient text-white dark:text-[#0B0B0E] flex items-center justify-center text-xs font-black border border-[#FCD34D]">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-bold text-slate-900 dark:text-white pr-1">{user.full_name.split(' ')[0]}</span>
              <SettingsIcon style={{ fontSize: 16 }} className="text-[#D97706] dark:text-[#FCD34D]" />
            </button>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-[fadeIn_0.2s_ease-out]">
            <Outlet />
          </div>
        </main>

      </div>

      {/* Mobile Floating Action Button (FAB +) */}
      <button
        onClick={() => setQuickTxModalOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full gold-gradient shadow-2xl shadow-amber-500/40 flex items-center justify-center text-white dark:text-[#0B0B0E] hover:scale-105 active:scale-95 transition-all border-2 border-white dark:border-[#16161E]"
        title="Tranzaksiya qo'shish"
      >
        <AddIcon style={{ fontSize: 32 }} />
      </button>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#16161E]/95 backdrop-blur-xl border-t border-amber-500/20 px-2 py-2 flex justify-around items-center shadow-2xl">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            location.pathname === '/dashboard'
              ? 'text-[#D97706] dark:text-[#FCD34D] font-black'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <DashboardIcon style={{ fontSize: 22 }} />
          <span className="text-[10px] mt-0.5 font-bold">Bosh</span>
        </Link>

        <Link
          to="/transactions"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            location.pathname === '/transactions'
              ? 'text-[#D97706] dark:text-[#FCD34D] font-black'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <SwapHorizIcon style={{ fontSize: 22 }} />
          <span className="text-[10px] mt-0.5 font-bold">Tranzaksiya</span>
        </Link>

        <Link
          to="/categories"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            location.pathname === '/categories'
              ? 'text-[#D97706] dark:text-[#FCD34D] font-black'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CategoryIcon style={{ fontSize: 22 }} />
          <span className="text-[10px] mt-0.5 font-bold">Toifa</span>
        </Link>

        <Link
          to="/recurring"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            location.pathname === '/recurring'
              ? 'text-[#D97706] dark:text-[#FCD34D] font-black'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <UpdateIcon style={{ fontSize: 22 }} />
          <span className="text-[10px] mt-0.5 font-bold">Davriy</span>
        </Link>

        <button
          onClick={() => setProfileModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#D97706]"
        >
          <PersonIcon style={{ fontSize: 22 }} />
          <span className="text-[10px] mt-0.5 font-bold">Profil</span>
        </button>
      </div>

      {/* Modal: Quick Add Transaction from Mobile FAB */}
      {quickTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#16161E] border border-amber-500/30 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Tezkor Tranzaksiya ⚡</h3>
              <button onClick={() => setQuickTxModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>

            <form onSubmit={handleQuickTxSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#D97706] dark:text-[#FCD34D] uppercase">Nomi</label>
                <input
                  type="text"
                  placeholder="Masalan: Tushlik"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full px-4 py-3 mt-1 rounded-xl border border-amber-500/30 bg-slate-50 dark:bg-[#0B0B0E] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#D97706] dark:text-[#FCD34D] uppercase">Summa ({user.currency || 'UZS'})</label>
                  <input
                    type="number"
                    placeholder="30000"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full px-4 py-3 mt-1 rounded-xl border border-amber-500/30 bg-slate-50 dark:bg-[#0B0B0E] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#D97706] dark:text-[#FCD34D] uppercase">Turi</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as 'income' | 'expense')}
                    className="w-full px-4 py-3 mt-1 rounded-xl border border-amber-500/30 bg-slate-50 dark:bg-[#0B0B0E] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  >
                    <option value="expense">Chiqim (-)</option>
                    <option value="income">Kirim (+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#D97706] dark:text-[#FCD34D] uppercase">Kategoriya</label>
                <select
                  value={txCategoryId}
                  onChange={(e) => setTxCategoryId(e.target.value)}
                  className="w-full px-4 py-3 mt-1 rounded-xl border border-amber-500/30 bg-slate-50 dark:bg-[#0B0B0E] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                >
                  <option value="">Kategoriyani tanlang</option>
                  {categories
                    ?.filter((c: any) => c.type === txType)
                    .map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#D97706] dark:text-[#FCD34D] uppercase">Sana</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-4 py-3 mt-1 rounded-xl border border-amber-500/30 bg-slate-50 dark:bg-[#0B0B0E] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickTxModalOpen(false)}
                  className="flex-1 py-3 border border-amber-500/20 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={createTxMutation.isPending}
                  className="flex-1 py-3 gold-gradient text-white dark:text-[#0B0B0E] text-sm font-extrabold rounded-xl shadow transition-colors"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User Profile */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#16161E] border border-amber-500/30 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Profil Sozlamalari ⚙️</h3>
              <button onClick={() => setProfileModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#D97706] dark:text-[#FCD34D] uppercase">To'liq Ismingiz</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 mt-1 rounded-xl border border-amber-500/30 bg-slate-50 dark:bg-[#0B0B0E] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#D97706] dark:text-[#FCD34D] uppercase">Asosiy Valyuta</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 mt-1 rounded-xl border border-amber-500/30 bg-slate-50 dark:bg-[#0B0B0E] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                >
                  <option value="UZS">UZS (so'm)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="RUB">RUB (₽)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#D97706] dark:text-[#FCD34D] uppercase">Avatar Rasm URL Havolasi</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-4 py-3 mt-1 rounded-xl border border-amber-500/30 bg-slate-50 dark:bg-[#0B0B0E] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="flex-1 py-3 border border-amber-500/20 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 gold-gradient text-white dark:text-[#0B0B0E] text-sm font-extrabold rounded-xl shadow transition-colors"
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
