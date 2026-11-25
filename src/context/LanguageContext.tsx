import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'hi';

const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
};

type MLKitTranslateModule = {
  TranslateLanguage: {
    ENGLISH: unknown;
    HINDI: unknown;
  };
  default: {
    translate: (input: {
      text: string;
      sourceLanguage: unknown;
      targetLanguage: unknown;
      downloadModelIfNeeded: boolean;
    }) => Promise<string>;
  };
};

const loadMLKitTranslate = (): MLKitTranslateModule | null => {
  if (Platform.OS !== 'android') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('@react-native-ml-kit/translate-text') as MLKitTranslateModule;
  } catch (error) {
    console.warn('ML Kit translate not available', error);
    return null;
  }
};

const mlkitTranslate = loadMLKitTranslate();

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (text: string) => Promise<string>;
  languageLabels: Record<Language, string>;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@kindling:language';
const TRANSLATION_CACHE_KEY = '@kindling:translation-cache';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const cacheRef = useRef<Record<string, string>>({});
  const pendingRef = useRef(new Map<string, Promise<string>>());

  useEffect(() => {
    if (Platform.OS === 'ios') {
      setLanguageState('en');
      AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, 'en').catch(() => {
        // best effort
      });
      return;
    }

    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then(value => {
        if (value === 'hi') {
          setLanguageState('hi');
        }
      })
      .catch(() => {
        // silently ignore
      });

    AsyncStorage.getItem(TRANSLATION_CACHE_KEY)
      .then(value => {
        if (value) {
          const parsed = JSON.parse(value) as Record<string, string>;
          cacheRef.current = parsed;
        }
      })
      .catch(() => {
        // ignore read failures
      });
  }, []);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      if (language !== 'en') {
        setLanguageState('en');
      }
      return;
    }

    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language).catch(() => {
      // best effort
    });
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    if (Platform.OS === 'ios') {
      setLanguageState('en');
      return;
    }
    setLanguageState(next);
  }, []);

  const translate = useCallback(
    async (text: string) => {
      const trimmed = text?.trim();
      if (!trimmed) {
        return text;
      }

      const TranslateLanguage = mlkitTranslate?.TranslateLanguage;
      const TranslateText = mlkitTranslate?.default;
      const targetLanguage = language === 'hi' ? TranslateLanguage?.HINDI : TranslateLanguage?.ENGLISH;
      if (!TranslateLanguage || !TranslateText || !targetLanguage || targetLanguage === TranslateLanguage.ENGLISH) {
        return text;
      }

      const cacheKey = `${targetLanguage}:${trimmed}`;
      if (cacheRef.current[cacheKey]) {
        return cacheRef.current[cacheKey];
      }

      if (pendingRef.current.has(cacheKey)) {
        return pendingRef.current.get(cacheKey)!;
      }

      let translatorPromise: Promise<string>;
      try {
        translatorPromise = (TranslateText.translate({
          text: trimmed,
          sourceLanguage: TranslateLanguage.ENGLISH,
          targetLanguage,
          downloadModelIfNeeded: true,
        }) as Promise<string>);
      } catch (error) {
        console.warn('Translation skipped (module missing)', error);
        return text;
      }

      const normalizedPromise = translatorPromise
        .then(result => {
          const resolved = typeof result === 'string' ? result : text;
          cacheRef.current[cacheKey] = resolved;
          AsyncStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cacheRef.current)).catch(() => {
            // best effort cache persistence
          });
          return resolved;
        })
        .catch(error => {
          console.warn('Translation failed', error);
          return text;
        })
        .finally(() => {
          pendingRef.current.delete(cacheKey);
        });

      pendingRef.current.set(cacheKey, normalizedPromise);

      return normalizedPromise;
    },
    [language],
  );

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      translate,
      languageLabels: LANGUAGE_LABELS,
    }),
    [language, setLanguage, translate],
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
