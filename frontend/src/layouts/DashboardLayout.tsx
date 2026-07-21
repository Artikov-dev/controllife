import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  FolderKanban, 
  ShieldAlert, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Wallet,
  ChevronRight,
  Clock
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout, theme, toggleTheme } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    // Call store logout
    logout();
    navigate('/auth/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, role: 'user' },
    { name: 'Tranzaksiyalar', path: '/transactions', icon: ArrowLeftRight, role: 'user' },
    { name: 'Kategoriyalar', path: '/categories', icon: FolderKanban, role: 'user' },
    { name: 'Davriy to\'lovlar', path: '/recurring', icon: Clock, role: 'user' },
    { name: 'Admin Panel', path: '/admin', icon: ShieldAlert, role: 'admin' },
  ];

  const activeItem = navItems.find((item) => item.path === location.pathname);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-20">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight font-display bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Finance Tracker
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems
            .filter((item) => item.role === 'user' || user.role === 'admin')
            .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/15'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                    <span>{item.name}</span>
                  </div>
                  {!isActive && <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-slate-400" />}
                </Link>
              );
            })}
        </nav>

        {/* User Card / Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3 p-2 rounded-xl">
            {user.avatar ? (
              <img src={user.avatar} alt={user.full_name} className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-semibold border border-slate-300 dark:border-slate-700">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate text-slate-900 dark:text-white">{user.full_name}</h4>
              <span className="text-xs text-slate-400 capitalize">{user.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Chiqish"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile Toggle drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          
          <aside className="relative flex flex-col w-full max-w-xs bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 z-50">
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  <Wallet className="h-4 w-4" />
                </div>
                <span className="font-bold text-lg">Finance Tracker</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-1">
              {navItems
                .filter((item) => item.role === 'user' || user.role === 'admin')
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium ${
                        isActive
                          ? 'bg-blue-500 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
            </nav>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-semibold text-slate-600 dark:text-slate-400 text-sm">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-none">{user.full_name}</h4>
                  <span className="text-xs text-slate-400 capitalize">{user.role}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Navbar Header */}
        <header className="sticky top-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-6 z-10 transition-colors">
          <div className="flex items-center">
            {/* Burger menu for Mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 mr-3"
            >
              <Menu className="h-5.5 w-5.5" />
            </button>
            
            {/* Page Title */}
            <h2 className="text-lg font-bold tracking-tight font-display text-slate-900 dark:text-white capitalize">
              {activeItem ? activeItem.name : 'Boshqaruv paneli'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-150 shadow-inner"
              title={theme === 'dark' ? 'Yorug\' rejimga o\'tish' : 'Qorong\'u rejimga o\'tish'}
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* Profile trigger */}
            <div className="items-center space-x-2 hidden sm:flex">
              {user.avatar ? (
                <img src={user.avatar} alt={user.full_name} className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{user.full_name.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8 animate-[fadeIn_0.2s_ease-out]">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
