import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('Noto\'g\'ri email manzili kiritildi'),
  password: z.string().min(1, 'Parol kiritilishi shart'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/auth/login', values);
      const { user, accessToken, refreshToken } = res.data.data;
      
      setAuth(user, accessToken, refreshToken);
      toast.success(`Xush kelibsiz, ${user.full_name}!`);
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Kirishda xatolik yuz berdi. Iltimos qayta urunib ko\'ring.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
          Tizimga kirish
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Hisobingizga kirish uchun quyidagi ma'lumotlarni to'ldiring
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider" htmlFor="email">
            Email Manzili
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-4.5 w-4.5" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="example@finance.com"
              {...register('email')}
              className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 transition-all duration-150 ${
                errors.email
                  ? 'border-red-500 focus:ring-red-500/25'
                  : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider" htmlFor="password">
              Parol
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 transition-all duration-150 ${
                errors.password
                  ? 'border-red-500 focus:ring-red-500/25'
                  : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Yuklanmoqda...
            </>
          ) : (
            'Kirish'
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Hisobingiz yo'qmi?{' '}
          <Link
            to="/auth/register"
            className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Ro'yxatdan o'tish
          </Link>
        </p>
      </div>
    </div>
  );
}
