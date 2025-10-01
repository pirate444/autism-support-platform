import { useLanguage } from '../contexts/LanguageContext';
import { useEffect } from 'react';

const withTranslation = (WrappedComponent: React.ComponentType) => {
  return function WithTranslationWrapper(props: any) {
    const { language } = useLanguage();
    
    // Apply language-specific classes
    useEffect(() => {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.classList.toggle('rtl', language === 'ar');
    }, [language]);
    
    return <WrappedComponent {...props} />;
  };
};

export default withTranslation;