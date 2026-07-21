import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import { Loader2, Mail, Lock, User as UserIcon, Coins, Image } from 'lucide-react';
import { useState } from 'react';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Ism kamida 2 ta belgidan iborat bo\'lishi shart').max(100),
  email: z.string().email('Noto\'g\'ri email manzili kiritildi').max(255),
  password: z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi shart'),
  currency: z.string().max(10).default('UZS'),
  avatar: z.string().url('Avatar URL to\'g\'ri havola bo\'lishi shart').or(z.literal('')).optional().nullable(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      currency: 'UZS',
      avatar: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        avatar: values.avatar || null,
      };
      
      const res = await apiClient.post('/api/auth/register', payload);
      const { user, accessToken, refreshToken } = res.data.data;
      
      setAuth(user, accessToken, refreshToken);
      toast.success(`Ro'yxatdan o'tdingiz, xush kelibsiz ${user.full_name}!`);
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
          Ro'yxatdan o'tish
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Moliyangizni nazorat qilishni boshlash uchun hisob yarating
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider" htmlFor="full_name">
            To'liq Ismingiz
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <UserIcon className="h-4.5 w-4.5" />
            </div>
            <input
              id="full_name"
              type="text"
              placeholder="Ali Valiyev"
              {...register('full_name')}
              className={`w-full pl-11 pr-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 transition-all duration-150 ${
                errors.full_name
                  ? 'border-red-500 focus:ring-red-500/25'
                  : 'border-slate-200 dark:border-slate-800 focus:ring-orange-500/25 focus:border-orange-500'
              }`}
            />
          </div>
          {errors.full_name && (
            <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>
          )}
        </div>

        {/* Email */}
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
              className={`w-full pl-11 pr-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 transition-all duration-150 ${
                errors.email
                  ? 'border-red-500 focus:ring-red-500/25'
                  : 'border-slate-200 dark:border-slate-800 focus:ring-orange-500/25 focus:border-orange-500'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider" htmlFor="password">
            Parol
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <input
              id="password"
              type="password"
              placeholder="Kamida 6 ta belgi"
              {...register('password')}
              className={`w-full pl-11 pr-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 transition-all duration-150 ${
                errors.password
                  ? 'border-red-500 focus:ring-red-500/25'
                  : 'border-slate-200 dark:border-slate-800 focus:ring-orange-500/25 focus:border-orange-500'
              }`}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Currency */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider" htmlFor="currency">
              Valyuta
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Coins className="h-4.5 w-4.5" />
              </div>
              <select
                id="currency"
                {...register('currency')}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 transition-all duration-150"
              >
                <option value="UZS">UZS (so'm)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="RUB">RUB (₽)</option>
              </select>
            </div>
          </div>

          {/* Avatar URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider" htmlFor="avatar">
              Avatar Havolasi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Image className="h-4.5 w-4.5" />
              </div>
              <input
                id="avatar"
                type="text"
                placeholder="https://..."
                {...register('avatar')}
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 transition-all duration-150 ${
                  errors.avatar
                    ? 'border-red-500 focus:ring-red-500/25'
                    : 'border-slate-200 dark:border-slate-800 focus:ring-orange-500/25 focus:border-orange-500'
                }`}
              />
            </div>
            {errors.avatar && (
              <p className="text-xs text-red-500 mt-1">{errors.avatar.message}</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Yuklanmoqda...
            </>
          ) : (
            "Ro'yxatdan o'tish"
          )}
        </button>
      </form>

      <div className="text-center pt-1">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Hisobingiz bormi?{' '}
          <Link
            to="/auth/login"
            className="font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          >
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}
