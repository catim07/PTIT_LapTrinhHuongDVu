import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateUserProfileThunk } from '../../slices/authSlice';
import { toast } from '../../components/Toast/toastEvent';
import { normalizeVietnamPhone, validatePhone } from '../../utils/validatePhone';


// Zod Schema — messages are overridden in JSX via t() so we use generic defaults here
const profileSchema = z.object({
  full_name: z.string().min(2).nonempty(),
  email: z.string().email(),
  phone: z.string().trim().min(1).refine((value) => validatePhone(value)),
  avatar: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  preferences: z.object({
    newsletter: z.boolean(),
    sms_alerts: z.boolean(),
    receive_promotions: z.boolean()
  }).optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  onClose?: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);

  const { register, handleSubmit, formState: { errors, isValid, isSubmitting }, setValue } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      full_name: user?.full_name || user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
      dob: user?.dob || '',
      gender: user?.gender || '',
      address: user?.address || '',
      bio: user?.bio || '',
      preferences: {
        newsletter: user?.preferences?.newsletter || false,
        sms_alerts: user?.preferences?.sms_alerts || false,
        receive_promotions: user?.preferences?.receive_promotions || false
      }
    }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t('profileEdit.avatarSizeError'));
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(t('profileEdit.avatarTypeError'));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarPreview(base64);
        setValue('avatar', base64, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    const userId = user.id || user._id;
    if (!userId) {
      toast.error(t('profileEdit.noUserId'));
      return;
    }
    const normalizedPhone = normalizeVietnamPhone(data.phone);
    try {
      await dispatch(updateUserProfileThunk({
        userId,
        payload: {
          full_name: data.full_name,
          email: data.email,
          phone: normalizedPhone,
          avatar: data.avatar,
          dob: data.dob,
          gender: data.gender,
          address: data.address,
          bio: data.bio,
          preferences: {
            ...(user.preferences || {}),
            ...data.preferences
          }
        }
      })).unwrap();

      toast.success(t('profileEdit.updateSuccess'));
      if (onClose) onClose();
    } catch {
      toast.error(t('profileEdit.updateError'));
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6 shadow-sm animate-fade-in relative max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('profileEdit.title')}</h3>
        {onClose && (
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Avatar & Read-only fields */}
        <div className="flex flex-col items-center border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-6">
          <div className="relative mb-4 group">
            <div className="size-32 rounded-full border-4 border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-5xl text-slate-400">person</span>
              )}
            </div>
            <label className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full cursor-pointer shadow-md hover:scale-110 transition-transform flex items-center justify-center" title={t('profileEdit.changeAvatar')}>
              <span className="material-symbols-outlined text-sm">photo_camera</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          
          <div className="w-full space-y-3 mt-4 text-sm">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <span className="text-slate-500 block text-xs">{t('profileEdit.username')}</span>
              <span className="font-bold text-slate-800 dark:text-white">{user.username}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <span className="text-slate-500 block text-xs">{t('profileEdit.membershipLevel')}</span>
              <span className="font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">stars</span>
                {user.membership_level || 'Member'}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <span className="text-slate-500 block text-xs">{t('profileEdit.lottePoints')}</span>
              <span className="font-bold text-orange-500">{user.lotte_points?.toLocaleString() || 0} {t('profileEdit.pointsUnit')}</span>
            </div>
          </div>
        </div>

        {/* Right column: Form fields */}
        <div className="lg:col-span-2 space-y-5">
          {/* Group 1: Required */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('profileEdit.fullName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('full_name')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-800 ${errors.full_name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                placeholder="Nguyễn Văn A"
              />
              {errors.full_name && <p className="text-red-500 text-xs mt-1 font-medium">{t('profileEdit.nameRequired')}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('profileEdit.email')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('email')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-800 ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                placeholder="email@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{t('profileEdit.invalidEmail')}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('profileEdit.phone')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('phone')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-800 ${errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                placeholder="090..."
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{t('profileEdit.phoneInvalid')}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('profileEdit.gender')}</label>
              <select
                {...register('gender')}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-800"
              >
                <option value="">{t('profileEdit.selectGender')}</option>
                <option value="Nam">{t('profileEdit.male')}</option>
                <option value="Nữ">{t('profileEdit.female')}</option>
                <option value="Khác">{t('profileEdit.other')}</option>
              </select>
            </div>
          </div>

           {/* Group 2: Optionals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('profileEdit.dob')}</label>
              <input
                type="date"
                {...register('dob')}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-800"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('profileEdit.defaultAddress')}</label>
              <input
                type="text"
                {...register('address')}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-800"
                placeholder={t('profileEdit.addressPlaceholder')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('profileEdit.bio')}</label>
              <textarea
                {...register('bio')}
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-800 resize-none"
                placeholder={t('profileEdit.bioPlaceholder')}
              />
            </div>
          </div>

          {/* Group 3: Preferences */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">{t('profileEdit.notifPreferences')}</h4>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('preferences.newsletter')} className="size-4 accent-primary rounded border-slate-300" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{t('profileEdit.newsletter')}</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('preferences.sms_alerts')} className="size-4 accent-primary rounded border-slate-300" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{t('profileEdit.smsAlerts')}</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('preferences.receive_promotions')} className="size-4 accent-primary rounded border-slate-300" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{t('profileEdit.promoAlerts')}</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Footer / Actions */}
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
        {onClose && (
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            {t('profileEdit.cancel')}
          </button>
        )}
        <button 
          type="submit"
          disabled={!isValid || isSubmitting}
          className="px-8 py-2.5 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
          ) : (
            <span className="material-symbols-outlined text-[20px]">save</span>
          )}
          {t('profileEdit.save')}
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
