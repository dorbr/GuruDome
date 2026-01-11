'use client';

import Link from 'next/link';
import UserMenu from './UserMenu';
import { useLanguage } from './LanguageProvider';
import { useAuth } from './AuthProvider';
import { Globe, Shield } from 'lucide-react';

export default function Header() {
    const { t, language, setLanguage } = useLanguage();
    const { user, isModerator } = useAuth();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'he' : 'en');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/95">
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
                        <Link href="/battles" className="transition-colors hover:text-primary hover:font-semibold flex items-center gap-1.5">
                            <span className="text-yellow-500">⚔️</span>
                            {t.battles}
                        </Link>
                        <Link href="/contact" className="transition-colors hover:text-primary hover:font-semibold">
                            {t.contact}
                        </Link>
                        {user && (
                            <Link href="/my-reviews" className="transition-colors hover:text-primary hover:font-semibold">
                                {t.myReviews}
                            </Link>
                        )}
                        {isModerator && (
                            <Link
                                href="/admin"
                                className="transition-colors hover:text-primary hover:font-semibold flex items-center gap-1.5 text-primary"
                            >
                                <Shield className="h-4 w-4" />
                                Admin
                            </Link>
                        )}
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

                </div>
            </div>
        </header>
    );
}

