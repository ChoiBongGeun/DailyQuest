import { useTranslation } from 'react-i18next';

export function I18nTypeErrorCheck() {
  const { t } = useTranslation();

  // Intentionally wrong key to ensure i18n key typing catches typos.
  return <span>{t('common.appNmae')}</span>;
}
