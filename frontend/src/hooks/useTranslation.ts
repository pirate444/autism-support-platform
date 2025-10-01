import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../contexts/translations';

export const useTranslation = () => {
  const { language } = useLanguage();
  
  const t = (key: string, params?: Record<string, string | number>) => {
    return getTranslation(key, language, params);
  };
  
  return t;
};