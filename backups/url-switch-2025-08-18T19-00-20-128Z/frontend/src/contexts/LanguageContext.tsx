'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getTranslation } from '../utils/translations';
import { apiUrl, getAuthHeaders } from '../utils/api';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'ar', 'fr', 'es'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
    setIsLoading(false);
  }, []);

  // Load user's language preference from server if authenticated
  useEffect(() => {
    const loadUserLanguage = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(apiUrl('/language/user'), {
            headers: getAuthHeaders(),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.language && ['en', 'ar', 'fr', 'es'].includes(data.language)) {
              setLanguageState(data.language);
              localStorage.setItem('language', data.language);
            }
          }
        } catch (error) {
          console.error('Failed to load user language preference:', error);
        }
      }
    };

    loadUserLanguage();
  }, []);

  const setLanguage = async (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Update document direction for RTL languages
    if (newLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = newLanguage;
    }

    // Save to server if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(apiUrl('/language/user'), {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ language: newLanguage }),
        });
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    return getTranslation(key, language, params);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 