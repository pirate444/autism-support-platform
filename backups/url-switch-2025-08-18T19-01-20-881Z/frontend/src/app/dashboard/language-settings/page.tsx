'use client';

import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import Link from 'next/link';

export default function LanguageSettingsPage() {
  const { t, language } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', description: 'Default language for the platform' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', description: 'اللغة العربية للوطن العربي' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', description: 'Langue française pour les utilisateurs francophones' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', description: 'Idioma español para usuarios hispanohablantes' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('language')} {t('settings')}
              </h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t('changeLanguage')}
            </h2>
            <p className="text-gray-600">
              {t('language')} {t('preferences')} - {t('info')}
            </p>
          </div>

          <div className="space-y-4">
            {languages.map((lang) => (
              <div
                key={lang.code}
                className={`p-4 border rounded-lg transition-colors ${
                  language === lang.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {lang.nativeName} ({lang.name})
                      </h3>
                      <p className="text-sm text-gray-600">{lang.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {language === lang.code && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {t('active')}
                      </span>
                    )}
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              {t('info')}
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {t('language')} {t('preferences')} {t('save')} {t('automatically')}</li>
              <li>• {t('rtl')} {t('support')} {t('available')} {t('for')} {t('arabic')}</li>
              <li>• {t('translations')} {t('include')} {t('ui')} {t('elements')} {t('and')} {t('common')} {t('phrases')}</li>
              <li>• {t('more')} {t('languages')} {t('can')} {t('be')} {t('added')} {t('in')} {t('the')} {t('future')}</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
} 