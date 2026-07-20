'use client';

import React from 'react';
import {
  X,
  User,
  Shield,
  Palette,
  Globe,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Bell,
  Plus,
  Minus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useUpdateNickname, useChangePassword, useDeleteAccount } from '@/hooks/use-user';
import { extractErrorMessage } from '@/lib/api/response';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { useRouter } from 'next/navigation';
import i18n from '@/lib/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'profile' | 'security' | 'appearance' | 'notifications';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    reminderOffsets,
    addReminderOffset,
    removeReminderOffset,
    notificationPermission,
    setNotificationPermission,
  } = useUIStore();
  const addToast = useUIStore((s) => s.addToast);

  const [activeTab, setActiveTab] = React.useState<SettingsTab>('profile');

  const [nickname, setNickname] = React.useState(user?.nickname || '');
  const updateNickname = useUpdateNickname();

  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showCurrentPw, setShowCurrentPw] = React.useState(false);
  const [showNewPw, setShowNewPw] = React.useState(false);
  const changePassword = useChangePassword();

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deletePassword, setDeletePassword] = React.useState('');
  const deleteAccount = useDeleteAccount();

  const [newReminderMinutes, setNewReminderMinutes] = React.useState('');

  React.useEffect(() => {
    if (user?.nickname) setNickname(user.nickname);
  }, [user?.nickname]);

  const handleUpdateNickname = async () => {
    if (!nickname.trim() || nickname.trim().length < 2) return;
    try {
      const updated = await updateNickname.mutateAsync(nickname.trim());
      useAuthStore.getState().updateUser({ nickname: updated.nickname });
      addToast(t('settings.nicknameUpdated'), 'success');
    } catch (error) {
      addToast(extractErrorMessage(error, t('error.generic')), 'error');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      addToast(t('auth.passwordMismatch'), 'error');
      return;
    }
    if (newPassword.length < 8) {
      addToast(t('validation.passwordTooShort'), 'error');
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast(t('settings.passwordChanged'), 'success');
    } catch (error) {
      addToast(extractErrorMessage(error, t('error.generic')), 'error');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync(deletePassword);
      addToast(t('settings.accountDeleted'), 'info');
      logout();
      router.push('/login');
    } catch (error) {
      addToast(extractErrorMessage(error, t('error.generic')), 'error');
    }
  };

  const handleLanguageChange = (lang: 'ko' | 'en') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleRequestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      addToast(t('settings.notificationBlocked'), 'error');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      addToast(t('settings.notificationGranted'), 'success');
    } else if (permission === 'denied') {
      addToast(t('settings.notificationDenied'), 'error');
    }
  };

  const handleAddReminder = () => {
    const minutes = parseInt(newReminderMinutes, 10);
    if (!isNaN(minutes) && minutes > 0 && minutes <= 1440) {
      addReminderOffset(minutes);
      setNewReminderMinutes('');
    }
  };

  const formatReminderOffset = (minutes: number) => {
    if (minutes >= 60 && minutes % 60 === 0) {
      const hours = minutes / 60;
      return `${hours}${t('settings.hourBefore')}`;
    }
    return `${minutes}${t('settings.minutesBefore')}`;
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [setNotificationPermission]);

  if (!isOpen) return null;

  const tabs: { key: SettingsTab; icon: React.ReactNode; label: string }[] = [
    { key: 'profile', icon: <User className="w-4 h-4" />, label: t('settings.profile') },
    { key: 'security', icon: <Shield className="w-4 h-4" />, label: t('settings.security') },
    { key: 'appearance', icon: <Palette className="w-4 h-4" />, label: t('settings.appearance') },
    { key: 'notifications', icon: <Bell className="w-4 h-4" />, label: t('settings.notifications') },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-2xl max-h-[92vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {t('settings.title')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
                        <nav className="w-44 shrink-0 border-r border-neutral-200 dark:border-neutral-800 p-2 space-y-1 bg-neutral-50 dark:bg-neutral-900/50">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {activeTab === 'profile' && (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1.5">
                        {t('settings.email')}
                      </label>
                      <div className="px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm text-neutral-600 dark:text-neutral-400">
                        {user?.email}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1.5">
                        {t('settings.nickname')}
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          placeholder={t('settings.nicknamePlaceholder')}
                          fullWidth
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleUpdateNickname}
                          isLoading={updateNickname.isPending}
                          className="shrink-0"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}

                            {activeTab === 'security' && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      {t('settings.changePassword')}
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        {t('settings.currentPassword')}
                      </label>
                      <div className="relative flex items-center">
                        <Input
                          type={showCurrentPw ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          fullWidth
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                          className="absolute right-3 text-neutral-400 hover:text-neutral-600"
                        >
                          {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        {t('settings.newPassword')}
                      </label>
                      <div className="relative flex items-center">
                        <Input
                          type={showNewPw ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          fullWidth
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          className="absolute right-3 text-neutral-400 hover:text-neutral-600"
                        >
                          {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Input
                      type="password"
                      label={t('settings.confirmPassword')}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      fullWidth
                    />

                    <Button
                      variant="primary"
                      onClick={handleChangePassword}
                      isLoading={changePassword.isPending}
                      disabled={!currentPassword || !newPassword || !confirmPassword}
                    >
                      {t('settings.changePassword')}
                    </Button>
                  </div>

                                    <div className="mt-8 pt-6 border-t border-red-200 dark:border-red-900/30">
                    <h3 className="text-base font-semibold text-red-600 dark:text-red-400 mb-2">
                      {t('settings.dangerZone')}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                      {t('settings.deleteAccountDesc')}
                    </p>

                    {!showDeleteConfirm ? (
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('settings.deleteAccount')}
                      </Button>
                    ) : (
                      <div className="space-y-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/30">
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                          {t('settings.deleteAccountConfirm')}
                        </p>
                        <Input
                          type="password"
                          placeholder={t('settings.deletePassword')}
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          fullWidth
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeletePassword('');
                            }}
                          >
                            {t('common.cancel')}
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleDeleteAccount}
                            isLoading={deleteAccount.isPending}
                            disabled={!deletePassword}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            {t('settings.deleteAccount')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

                            {activeTab === 'appearance' && (
                <>
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      {t('settings.theme')}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setTheme('light')}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          theme === 'light'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shadow-sm">
                          <Sun className="w-5 h-5 text-amber-500" />
                        </div>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {t('settings.themeLight')}
                        </span>
                        {theme === 'light' && <Check className="w-4 h-4 text-primary-600 ml-auto" />}
                      </button>

                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          theme === 'dark'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                          <Moon className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {t('settings.themeDark')}
                        </span>
                        {theme === 'dark' && <Check className="w-4 h-4 text-primary-600 ml-auto" />}
                      </button>
                    </div>
                  </div>

                                    <div className="space-y-3">
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {t('settings.language')}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleLanguageChange('ko')}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          language === 'ko'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                        }`}
                      >
                        <span className="text-xl">🇰🇷</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {t('settings.languageKo')}
                        </span>
                        {language === 'ko' && <Check className="w-4 h-4 text-primary-600 ml-auto" />}
                      </button>

                      <button
                        onClick={() => handleLanguageChange('en')}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          language === 'en'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                        }`}
                      >
                        <span className="text-xl">🇺🇸</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {t('settings.languageEn')}
                        </span>
                        {language === 'en' && <Check className="w-4 h-4 text-primary-600 ml-auto" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

                            {activeTab === 'notifications' && (
                <>
                                    <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        {t('settings.reminderTitle')}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {t('settings.reminderDesc')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                        {t('settings.reminderOffsets')}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {reminderOffsets.map((offset) => (
                          <div
                            key={offset}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                          >
                            <span>{formatReminderOffset(offset)}</span>
                            <button
                              onClick={() => removeReminderOffset(offset)}
                              className="p-0.5 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Input
                          type="number"
                          placeholder="30"
                          value={newReminderMinutes}
                          onChange={(e) => setNewReminderMinutes(e.target.value)}
                          className="w-24"
                          min={1}
                          max={1440}
                        />
                        <span className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                          {t('settings.minutesBefore')}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddReminder}
                          disabled={!newReminderMinutes}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {t('settings.addReminder')}
                        </Button>
                      </div>
                    </div>
                  </div>

                                    <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <div>
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        {t('settings.browserNotification')}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {t('settings.browserNotificationDesc')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {notificationPermission === 'granted' ? (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <Check className="w-5 h-5" />
                          <span className="text-sm font-medium">{t('settings.notificationGranted')}</span>
                        </div>
                      ) : notificationPermission === 'denied' ? (
                        <div className="text-sm text-red-600 dark:text-red-400">
                          {t('settings.notificationBlocked')}
                        </div>
                      ) : (
                        <Button variant="primary" onClick={handleRequestNotificationPermission}>
                          <Bell className="w-4 h-4 mr-2" />
                          {t('settings.enableNotification')}
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
