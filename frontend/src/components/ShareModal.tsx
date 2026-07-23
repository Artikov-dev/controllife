import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { toast } from 'sonner';
import {
  Share as ShareIcon,
  ContentCopy as ContentCopyIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  DeleteForever as DeleteIcon,
  Autorenew as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isShareEnabled, setIsShareEnabled] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchShareStatus();
    }
  }, [isOpen]);

  const fetchShareStatus = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/public/share-status');
      setShareToken(res.data.data.share_token);
      setIsShareEnabled(res.data.data.is_share_enabled);
    } catch (err: any) {
      console.error('fetchShareStatus error:', err);
      // Quiet fail if not yet initialized
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setActionLoading(true);
      const res = await apiClient.post('/api/public/share-link');
      setShareToken(res.data.data.share_token);
      setIsShareEnabled(true);
      toast.success('Ommaviy havola muvaffaqiyatli yaratildi!');
    } catch (err: any) {
      console.error('handleGenerate error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Server bilan bog\'lanishda xatolik';
      toast.error(`Havola yaratib bo'lmadi: ${errMsg}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async () => {
    try {
      setActionLoading(true);
      await apiClient.delete('/api/public/share-link');
      setShareToken(null);
      setIsShareEnabled(false);
      toast.info('Ommaviy havola bekor qilindi (o\'chirildi)');
    } catch (err: any) {
      console.error('handleRevoke error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Server bilan bog\'lanishda xatolik';
      toast.error(`Havolani o'chirishda xatolik: ${errMsg}`);
    } finally {
      setActionLoading(false);
    }
  };

  const fullShareUrl = shareToken
    ? `${window.location.origin}/shared/${shareToken}`
    : '';

  const handleCopy = () => {
    if (!fullShareUrl) return;
    navigator.clipboard.writeText(fullShareUrl);
    setCopied(true);
    toast.success('Havola buferga nusxalandi!');
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-amber-400">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <ShareIcon />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Uydagilar uchun Ommaviy Havola</h3>
              <p className="text-xs text-slate-400">Read-Only ko'rinishida ulashish</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="py-6 space-y-5">
          <p className="text-sm text-slate-300 leading-relaxed">
            Ushbu havola orqali uydagilar yoki boshqa shaxslar sizning xarajat va daromadlar jamlanmasini login qilmasdan ko'ra olishadi. Ma'lumotlarni faqat ko'rish mumkin, tahrirlash yetka olmaydi.
          </p>

          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : isShareEnabled && fullShareUrl ? (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={fullShareUrl}
                  className="bg-transparent text-xs text-amber-300 font-mono flex-1 outline-none truncate"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1 shrink-0"
                >
                  {copied ? <CheckIcon className="w-4 h-4" /> : <ContentCopyIcon className="w-4 h-4" />}
                  {copied ? 'Nusxalandi' : 'Nusxalash'}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Havola Faol
                </span>
                <a
                  href={fullShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:underline flex items-center gap-1"
                >
                  <VisibilityIcon className="w-3.5 h-3.5" /> Sinab ko'rish
                </a>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <RefreshIcon className="w-4 h-4" /> Havolani yangilash
                </button>
                <button
                  onClick={handleRevoke}
                  disabled={actionLoading}
                  className="py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl transition-all border border-rose-500/20 flex items-center justify-center gap-1.5"
                >
                  <DeleteIcon className="w-4 h-4" /> O'chirish
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-amber-400/80 text-xs">
                Sizda hali ommaviy havola yaratilmagan. Havola yaratish tugmasini bossangiz, unikal ko'rish havolasi tayyor bo'ladi.
              </div>

              <button
                onClick={handleGenerate}
                disabled={actionLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <ShareIcon className="w-4 h-4" /> Havola Yaratish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
