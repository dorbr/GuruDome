export { en, type TranslationKeys } from './en';
export { he } from './he';

export type Language = 'en' | 'he';

export const languages: { code: Language; name: string; dir: 'ltr' | 'rtl' }[] = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'he', name: 'עברית', dir: 'rtl' },
];

export function isRTL(lang: Language): boolean {
    return lang === 'he';
}
