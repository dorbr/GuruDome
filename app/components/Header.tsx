'use client';

import Link from 'next/link';
import UserMenu from './UserMenu';
import { useLanguage } from './LanguageProvider';
import { Globe } from 'lucide-react';

export default function Header() {
    const { t, language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'he' : 'en');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-indigo-600 bg-clip-text text-transparent transition-all group-hover:bg-gradient-to-l duration-500">
                            GuruDome
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/" className="transition-colors hover:text-primary hover:font-semibold">
                            {t.home}
                        </Link>
                        <Link href="/about" className="transition-colors hover:text-primary hover:font-semibold">
                            {t.about}
                        </Link>
                        <Link href="/contact" className="transition-colors hover:text-primary hover:font-semibold">
                            {t.contact}
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {/* Language Toggle */}
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-white/10 bg-background/50 hover:border-primary/30 hover:bg-background/80 transition-all"
                        title={t.language}
                    >
                        <Globe className="w-4 h-4" />
                        <span className="hidden sm:inline">{language === 'en' ? 'עב' : 'EN'}</span>
                    </button>

                    <UserMenu />
                    <Link href="/add-guru">
                        <button className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                            {t.addGuru}
                        </button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
