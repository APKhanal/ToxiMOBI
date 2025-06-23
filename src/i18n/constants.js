/**
 * ToxiGuard Language Constants
 * Defines available languages and related configuration
 */

// Language options available in the app
export const LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
  },
  {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '中文 (简体)',
    flag: '🇨🇳',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    isRTL: true,
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
  },
];

// Default language code
export const DEFAULT_LANGUAGE = 'en';

// Language direction mapping
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

/**
 * Check if a language is RTL (Right-to-Left)
 * @param {string} languageCode - ISO language code
 * @returns {boolean} - True if the language is RTL
 */
export const isRTL = (languageCode) => {
  return RTL_LANGUAGES.includes(languageCode);
};

/**
 * Get language details by code
 * @param {string} languageCode - ISO language code
 * @returns {Object} - Language details object or null if not found
 */
export const getLanguageByCode = (languageCode) => {
  return LANGUAGES.find(lang => lang.code === languageCode) || null;
};

/**
 * Get language native name by code
 * @param {string} languageCode - ISO language code
 * @returns {string} - Native name or language code if not found
 */
export const getLanguageNativeName = (languageCode) => {
  const language = getLanguageByCode(languageCode);
  return language ? language.nativeName : languageCode;
};

/**
 * Get language name by code
 * @param {string} languageCode - ISO language code
 * @returns {string} - Language name or language code if not found
 */
export const getLanguageName = (languageCode) => {
  const language = getLanguageByCode(languageCode);
  return language ? language.name : languageCode;
};
