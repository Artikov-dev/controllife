import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { TrendingUp, Shield, BarChart3, Wallet } from 'lucide-react';

export default function AuthLayout() {
  const { user, theme } = useAuthStore();
  const navigate = useNavigate();

  // Sync theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Left Pane - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8">
          <Outlet />
        </div>
      </div>

      {/* Right Pane - Splash Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 justify-center items-center p-12 border-l border-slate-800">
        {/* Decorative Gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] rounded-full bg-pink-500/5 blur-[100px]" />

        <div className="relative z-10 max-w-lg space-y-12">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 text-white">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight font-display bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Finance Tracker
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight font-display">
              Shaxsiy moliyangizni <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                xavfsiz boshqaring
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Daromad va xarajatlaringizni real vaqtda kuzating, oylik byudjetlarni rejalashtiring va ilg'or ma'lumotlar tahlili orqali tejashni boshlang.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/30 backdrop-blur-sm space-y-3">
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white">Dinamik Grafikar</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Barcha xarajatlaringizni toifalangan va chiroyli diagrammalarda ko'ring.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/30 backdrop-blur-sm space-y-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white">Byudjet Nazorati</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Oylik xarajat cheklovlarini qo'ying va ogohlantirishlar oling.
              </p>
            </div>
          </div>

          {/* Small quote / testimonial in glassmorphism style */}
          <div className="p-5 rounded-2xl glass border border-white/5 shadow-2xl space-y-3">
            <div className="flex items-center space-x-1 text-amber-400">
              <Shield className="h-4 w-4 fill-amber-400/20" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Xavfsiz &amp; Ishonchli</span>
            </div>
            <p className="text-sm text-slate-300 italic">
              "Loyiha to'liq himoyalangan raw SQL so'rovlari va JWT sessiya boshqaruvi bilan ta'minlangan. Sizning moliyaviy ma'lumotlaringiz doimo ishonchli qo'llarda."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
