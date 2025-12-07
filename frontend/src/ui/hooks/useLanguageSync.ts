import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppConfig } from '../../db/hooks/logic/appConfigDBHooks';

/**
 * Hook to sync i18n language with app config
 * Automatically updates the app language when config changes
 */
export function useLanguageSync() {
  const { i18n } = useTranslation();
  const config = useAppConfig();

  useEffect(() => {
    if (config && config.language && i18n.language !== config.language) {
      i18n.changeLanguage(config.language);
    }
  }, [config, i18n]);
}
