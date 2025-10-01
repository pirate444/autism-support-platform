# Language Feature Implementation Guide

This guide explains how to use the multi-language feature implemented in the Autism Support Platform.

## Overview

The platform now supports multiple languages with the following features:
- **4 Languages**: English (en), Arabic (ar), French (fr), Spanish (es)
- **RTL Support**: Full right-to-left support for Arabic
- **User Preferences**: Language preferences are saved per user
- **Real-time Switching**: Instant language switching without page reload
- **Persistent Storage**: Language preferences are saved in localStorage and database

## Backend Implementation

### 1. User Model Updates
The User model now includes a `language` field:
```javascript
language: { type: String, default: 'en', enum: ['en', 'ar', 'fr', 'es'] }
```

### 2. Language API Endpoints
- `GET /api/language/available` - Get available languages
- `GET /api/language/user` - Get user's language preference
- `PUT /api/language/user` - Update user's language preference

### 3. Language Controller
Located at `backend/src/controllers/languageController.js` with three main functions:
- `getAvailableLanguages()` - Returns list of supported languages
- `updateLanguage()` - Updates user's language preference
- `getUserLanguage()` - Retrieves user's current language preference

## Frontend Implementation

### 1. Translation System
- **File**: `frontend/src/utils/translations.ts`
- **Function**: `getTranslation(key, language, params)`
- **Usage**: `t('dashboard')` returns translated text

### 2. Language Context
- **File**: `frontend/src/contexts/LanguageContext.tsx`
- **Hook**: `useLanguage()`
- **Features**: 
  - Automatic language loading from localStorage
  - Server synchronization for authenticated users
  - RTL direction handling for Arabic

### 3. Language Switcher Component
- **File**: `frontend/src/components/LanguageSwitcher.tsx`
- **Features**:
  - Dropdown with flag icons
  - Native language names
  - Current language indicator
  - Responsive design

## How to Use

### 1. In React Components
```tsx
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('dashboard')}</h1>
      <p>{t('welcome')}</p>
      <button onClick={() => setLanguage('ar')}>
        {t('changeLanguage')}
      </button>
    </div>
  );
}
```

### 2. Adding New Translations
Add new keys to the translations object in `frontend/src/utils/translations.ts`:

```typescript
export const translations = {
  en: {
    // ... existing translations
    newKey: 'New Translation',
  },
  ar: {
    // ... existing translations
    newKey: 'ترجمة جديدة',
  },
  fr: {
    // ... existing translations
    newKey: 'Nouvelle traduction',
  },
  es: {
    // ... existing translations
    newKey: 'Nueva traducción',
  }
};
```

### 3. Using Parameters in Translations
```typescript
// In translations file
minLength: 'Minimum length is {min} characters',

// In component
t('minLength', { min: 8 }) // Returns: "Minimum length is 8 characters"
```

### 4. RTL Support
The system automatically handles RTL for Arabic:
- Sets `dir="rtl"` on document
- Adjusts spacing and layout
- Uses appropriate font family

## Adding the Language Switcher to Pages

### 1. Import the Component
```tsx
import LanguageSwitcher from '../components/LanguageSwitcher';
```

### 2. Add to Header
```tsx
<div className="flex items-center space-x-4">
  <LanguageSwitcher />
  {/* Other header elements */}
</div>
```

## Database Migration

If you have existing users, you may want to add a migration script:

```javascript
// Migration script example
const updateExistingUsers = async () => {
  await User.updateMany(
    { language: { $exists: false } },
    { $set: { language: 'en' } }
  );
};
```

## Testing the Feature

### 1. Test Language Switching
1. Navigate to any page with the language switcher
2. Click the language dropdown
3. Select a different language
4. Verify text changes immediately
5. Refresh the page and verify language persists

### 2. Test RTL Support
1. Switch to Arabic
2. Verify text direction changes to RTL
3. Check that layout adjusts appropriately
4. Verify spacing and alignment

### 3. Test User Preferences
1. Log in as a user
2. Change language
3. Log out and log back in
4. Verify language preference is restored

## Best Practices

### 1. Translation Keys
- Use descriptive, hierarchical keys
- Keep keys consistent across components
- Use lowercase with underscores for multi-word keys

### 2. Component Design
- Always use the `t()` function for user-facing text
- Avoid hardcoded strings
- Consider text length variations in different languages

### 3. RTL Considerations
- Test layouts with Arabic text
- Ensure proper spacing and alignment
- Consider icon and image direction

### 4. Performance
- Translations are loaded once and cached
- Language switching is instant
- No additional API calls for translations

## Troubleshooting

### Common Issues

1. **Translation not found**
   - Check if the key exists in all language objects
   - Verify the key spelling matches exactly

2. **RTL layout issues**
   - Check CSS for proper RTL support
   - Verify spacing classes work in both directions

3. **Language not persisting**
   - Check localStorage in browser dev tools
   - Verify API calls are successful
   - Check authentication status

### Debug Mode
Add this to see missing translations:
```typescript
const t = (key: string) => {
  const translation = getTranslation(key, language);
  if (translation === key) {
    console.warn(`Missing translation for key: ${key}`);
  }
  return translation;
};
```

## Future Enhancements

1. **More Languages**: Add support for additional languages
2. **Dynamic Loading**: Load translations on-demand
3. **Translation Management**: Admin interface for managing translations
4. **Auto-detection**: Detect user's browser language
5. **Regional Variants**: Support for regional language variants

## Files Modified/Created

### Backend
- `backend/src/models/User.js` - Added language field
- `backend/src/controllers/languageController.js` - New controller
- `backend/src/routes/language.js` - New routes
- `backend/src/app.js` - Added language routes

### Frontend
- `frontend/src/utils/translations.ts` - Translation system
- `frontend/src/contexts/LanguageContext.tsx` - Language context
- `frontend/src/components/LanguageSwitcher.tsx` - Language switcher
- `frontend/src/app/layout.tsx` - Added LanguageProvider
- `frontend/src/app/globals.css` - Added RTL support
- `frontend/src/app/dashboard/page.tsx` - Updated with translations
- `frontend/src/app/dashboard/language-settings/page.tsx` - New settings page

This implementation provides a robust, scalable multi-language system that enhances the accessibility and user experience of the Autism Support Platform. 