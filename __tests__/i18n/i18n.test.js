/**
 * Test for i18n functionality
 */

import i18n, { setLanguage, getCurrentLanguage } from '../../src/i18n';
import { LANGUAGES, DEFAULT_LANGUAGE, isRTL } from '../../src/i18n/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage for tests
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve())
}));

describe('i18n functionality', () => {
  beforeEach(async () => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Set language to English before each test
    await setLanguage('en');
  });

  test('default language is English', () => {
    expect(DEFAULT_LANGUAGE).toBe('en');
  });

  test('changes language correctly', async () => {
    // Verify current language is English
    expect(getCurrentLanguage()).toBe('en');
    
    // Change language to Spanish
    await setLanguage('es');
    
    // Verify language changed to Spanish
    expect(getCurrentLanguage()).toBe('es');
  });

  test('has correct translations for English', async () => {
    await setLanguage('en');
    
    // Verify English translations
    expect(i18n.t('common.apply')).toBe('Apply');
    expect(i18n.t('common.cancel')).toBe('Cancel');
  });

  test('has correct translations for Spanish', async () => {
    await setLanguage('es');
    
    // Verify Spanish translations
    expect(i18n.t('common.apply')).toBe('Aplicar');
    expect(i18n.t('common.cancel')).toBe('Cancelar');
  });

  test('has all defined languages', () => {
    // Verify all languages are defined
    expect(LANGUAGES.length).toBeGreaterThan(0);
    
    // Check that common languages are included
    const languageCodes = LANGUAGES.map(lang => lang.code);
    expect(languageCodes).toContain('en');
    expect(languageCodes).toContain('es');
    expect(languageCodes).toContain('fr');
  });

  test('identifies RTL languages correctly', () => {
    // Arabic should be RTL
    expect(isRTL('ar')).toBe(true);
    
    // English should not be RTL
    expect(isRTL('en')).toBe(false);
    
    // Spanish should not be RTL
    expect(isRTL('es')).toBe(false);
  });
});
