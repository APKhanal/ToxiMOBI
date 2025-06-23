import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './translations/en';
import es from './translations/es';
// Commented out missing translation files to prevent bundling errors
// import fr from './translations/fr';
// import de from './translations/de';
// import zh from './translations/zh';
// import ar from './translations/ar';
// import hi from './translations/hi';

// Create i18n instance
const i18n = new I18n({
  en,
  es
  // fr,
  // de,
  // zh,
  // ar,
  // hi
});

// Set default locale and fallback
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

// Initialize language from device settings
export const initializeLanguage = async () => {
  try {
    // Try to get stored language preference first
    const storedLocale = await AsyncStorage.getItem('userLanguage');
    
    if (storedLocale) {
      i18n.locale = storedLocale;
    } else {
      // Use device locale if no stored preference
      const deviceLocale = Localization.locale.split('-')[0];
      i18n.locale = Object.keys(i18n.translations).includes(deviceLocale) ? deviceLocale : 'en';
      
      // Store the selected locale
      await AsyncStorage.setItem('userLanguage', i18n.locale);
    }
    
    return i18n.locale;
  } catch (error) {
    console.error('Error initializing language:', error);
    i18n.locale = 'en';
    return 'en';
  }
};

// Set language
export const setLanguage = async (locale) => {
  try {
    // Check if the locale is supported
    if (Object.keys(i18n.translations).includes(locale)) {
      i18n.locale = locale;
      await AsyncStorage.setItem('userLanguage', locale);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error setting language:', error);
    return false;
  }
};

// Get current language
export const getCurrentLanguage = () => {
  return i18n.locale;
};

// Get supported languages
export const getSupportedLanguages = () => {
  return Object.keys(i18n.translations).map(code => ({
    code,
    name: i18n.t(`languages.${code}`)
  }));
};

export default i18n;
