import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
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
} from '@mui/icons-material';
import { toast } from 'sonner';

export default function DashboardLayout() {
  const { user, logout, theme, toggleTheme, setAuth, accessToken, refreshToken } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Form states for profile edit
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [currency, setCurrency] = useState(user?.currency || 'UZS');
  const [avatar, setAvatar] = useState(user?.avatar || '');

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

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: DashboardIcon, role: 'user' },
    { name: 'Tranzaksiyalar', path: '/transactions', icon: SwapHorizIcon, role: 'user' },
    { name: 'Kategoriyalar', path: '/categories', icon: CategoryIcon, role: 'user' },
    { name: 'Davriy to\'lovlar', path: '/recurring', icon: UpdateIcon, role: 'user' },
    { name: 'Admin Panel', path: '/admin', icon: AdminPanelSettingsIcon, role: 'admin' },
  ];

  const activeItem = navItems.find((item) => item.path === location.pathname);

  return (
    <div className="min-h-screen flex bg-[#0B0B0E] text-slate-100 transition-colors duration-200">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 left-0 bg-[#16161E] border-r border-amber-500/15 z-20 shadow-xl">
        <div className="p-6 flex items-center space-x-3 border-b border-amber-500/15">
          <div className="h-10 w-10 rounded-xl gold-gradient flex items-center justify-center shadow-lg shadow-amber-500/25">
            <AccountBalanceWalletIcon className="text-[#0B0B0E]" style={{ fontSize: 24 }} />
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
                      ? 'bg-gradient-to-r from-[#FCD34D] to-[#F59E0B] text-[#0B0B0E] shadow-lg shadow-amber-500/25 font-black'
                      : 'text-slate-400 hover:bg-white/5 hover:text-[#FCD34D]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent style={{ fontSize: 20 }} className={isActive ? 'text-[#0B0B0E]' : 'text-slate-400 group-hover:text-[#FCD34D]'} />
                    <span>{item.name}</span>
                  </div>
                  {!isActive && <ChevronRightIcon style={{ fontSize: 18 }} className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[#FCD34D]" />}
                </Link>
              );
            })}
        </nav>

        {/* User Card / Footer */}
        <div className="p-4 border-t border-amber-500/15 bg-[#0B0B0E]/60">
          <div className="flex items-center space-x-3 p-2 rounded-xl">
            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center space-x-3 flex-1 min-w-0 text-left group"
              title="Profil Sozlamalari"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.full_name} className="h-10 w-10 rounded-full border-2 border-[#F59E0B] object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="h-10 w-10 rounded-full gold-gradient text-[#0B0B0E] font-black flex items-center justify-center border-2 border-[#FCD34D] group-hover:scale-105 transition-transform">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold truncate text-white group-hover:text-[#FCD34D] transition-colors">{user.full_name}</h4>
                <span className="text-xs text-[#FCD34D] capitalize font-semibold">{user.role}</span>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
              title="Chiqish"
            >
              <LogoutIcon style={{ fontSize: 20 }} />
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile Toggle drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
          
          <aside className="relative flex flex-col w-full max-w-xs bg-[#16161E] border-r border-amber-500/15 p-6 z-50 shadow-2xl">
            <div className="flex items-center justify-between pb-6 border-b border-amber-500/15">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl gold-gradient flex items-center justify-center text-[#0B0B0E]">
                  <AccountBalanceWalletIcon style={{ fontSize: 20 }} />
                </div>
                <span className="font-extrabold text-lg gold-gradient-text">Control Life</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-[#FCD34D]">
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
                          ? 'bg-gradient-to-r from-[#FCD34D] to-[#F59E0B] text-[#0B0B0E] font-black'
                          : 'text-slate-400 hover:bg-white/5 hover:text-[#FCD34D]'
                      }`}
                    >
                      <IconComponent style={{ fontSize: 20 }} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
            </nav>

            <div className="pt-4 border-t border-amber-500/15 flex items-center justify-between">
              <button
                onClick={() => { setSidebarOpen(false); setProfileModalOpen(true); }}
                className="flex items-center space-x-3 text-left"
              >
                <div className="h-9 w-9 rounded-full gold-gradient text-[#0B0B0E] flex items-center justify-center font-extrabold text-sm">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-none">{user.full_name}</h4>
                  <span className="text-xs text-[#FCD34D] capitalize font-semibold">{user.role}</span>
                </div>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400"
              >
                <LogoutIcon style={{ fontSize: 22 }} />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Navbar Header */}
        <header className="sticky top-0 bg-[#16161E]/85 backdrop-blur-xl border-b border-amber-500/15 h-16 flex items-center justify-between px-6 z-10">
          <div className="flex items-center">
            {/* Burger menu for Mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-white/5 mr-3 hover:text-[#FCD34D]"
            >
              <MenuIcon style={{ fontSize: 24 }} />
            </button>
            
            {/* Page Title */}
            <h2 className="text-lg font-black tracking-tight font-display text-white capitalize">
              {activeItem ? activeItem.name : 'Boshqaruv paneli'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-[#FCD34D] bg-[#0B0B0E]/60 hover:bg-white/5 border border-amber-500/15 transition-all duration-150"
              title={theme === 'dark' ? 'Yorug\' rejimga o\'tish' : 'Qorong\'u rejimga o\'tish'}
            >
              {theme === 'dark' ? <SunIcon style={{ fontSize: 20 }} /> : <MoonIcon style={{ fontSize: 20 }} />}
            </button>

            <div className="h-6 w-px bg-amber-500/15 hidden sm:block" />

            {/* Profile trigger */}
            <button
              onClick={() => setProfileModalOpen(true)}
              className="items-center space-x-3 hidden sm:flex hover:bg-white/5 p-1.5 rounded-xl border border-amber-500/15 transition-all"
              title="Profil Sozlamalari"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.full_name} className="h-8 w-8 rounded-full border border-[#F59E0B] object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full gold-gradient text-[#0B0B0E] flex items-center justify-center text-xs font-black border border-[#FCD34D]">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-bold text-white pr-1">{user.full_name.split(' ')[0]}</span>
              <SettingsIcon style={{ fontSize: 16 }} className="text-[#FCD34D]" />
            </button>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8 animate-[fadeIn_0.2s_ease-out]">
            <Outlet />
          </div>
        </main>

      </div>

      {/* Modal: Edit User Profile */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#16161E] border border-amber-500/30 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Profil Sozlamalari ⚙️</h3>
              <button onClick={() => setProfileModalOpen(false)} className="text-slate-400 hover:text-white">
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">To'liq Ismingiz</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Asosiy Valyuta</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                >
                  <option value="UZS">UZS (so'm)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="RUB">RUB (₽)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#FCD34D] uppercase">Avatar Rasm URL Havolasi</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 rounded-xl border border-amber-500/30 bg-[#0B0B0E] text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="flex-1 py-2.5 border border-amber-500/20 text-slate-300 text-sm font-semibold rounded-xl hover:bg-white/5"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 gold-gradient text-[#0B0B0E] text-sm font-extrabold rounded-xl shadow transition-colors"
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
