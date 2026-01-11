'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { en, he, Language, isRTL, TranslationKeys } from '@/lib/i18n';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: TranslationKeys;
    dir: 'ltr' | 'rtl';
    isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, TranslationKeys> = { en, he };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Get saved language from localStorage
        const saved = localStorage.getItem('language') as Language | null;
        if (saved && (saved === 'en' || saved === 'he')) {
            setLanguageState(saved);
        } else {
            // If no saved language, check system language
            const systemLang = navigator.language.split('-')[0];
            if (systemLang === 'he') {
                setLanguageState('he');
            }
            // 'en' is default so no need to explicitly set it if system is not 'he'
            // effectively 'en' is the fallback
        }
        setMounted(true);
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    }, []);

    const dir = isRTL(language) ? 'rtl' : 'ltr';
    const isRtl = isRTL(language);

    // Update HTML attributes when language changes
    useEffect(() => {
        if (mounted) {
            document.documentElement.lang = language;
            document.documentElement.dir = dir;
        }
    }, [language, dir, mounted]);

    const value: LanguageContextType = {
        language,
        setLanguage,
        t: translations[language],
        dir,
        isRtl,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
