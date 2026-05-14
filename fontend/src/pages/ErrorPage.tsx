import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const errorCode = searchParams.get('code') || '404';
  const is500 = errorCode === '500';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background-light dark:bg-background-dark">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-40 h-40 rounded-full bg-primary/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-7xl text-primary/60">
            {is500 ? 'cloud_off' : 'explore_off'}
          </span>
        </div>
        <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold text-lg">{is500 ? '!' : '?'}</span>
        </div>
      </div>

      <h1 className="text-7xl font-extrabold text-primary mb-2 tracking-tight">
        {is500 ? '500' : '404'}
      </h1>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
        {is500
          ? t('error.serverError', 'Lỗi máy chủ')
          : t('error.pageNotFound', 'Trang không tồn tại')
        }
      </h2>

      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        {is500
          ? t('error.serverErrorDesc', 'Đã xảy ra lỗi từ hệ thống. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.')
          : t('error.pageNotFoundDesc', 'Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.')
        }
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">home</span>
          {t('common.backToHome', 'Về trang chủ')}
        </Link>

        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          {t('common.goBack', 'Quay lại')}
        </button>

        <Link
          to="/account/support"
          className="px-6 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">support_agent</span>
          {t('common.contactSupport', 'Liên hệ hỗ trợ')}
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
