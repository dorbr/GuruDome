'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Info, PlusCircle, Mail, Shield, Star, LogIn } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useLanguage } from './LanguageProvider';
import { cn } from '@/lib/utils';

export default function MobileMenu() {
    const pathname = usePathname();
    const { user, isModerator, openLoginModal } = useAuth();
    const { t } = useLanguage();

    const isActive = (path: string) => pathname === path;

    // Hide global mobile menu on admin pages to allow admin-specific navigation
    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t pb-safe">
            <nav className="flex items-center justify-around h-16 px-2">
                {/* 1. Home (All) */}
                <Link
                    href="/"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                        isActive('/') ? "text-primary" : "text-muted-foreground hover:text-primary"
                    )}
                >
                    <Home className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{t.home}</span>
                </Link>

                {/* 2. About (All) */}
                <Link
                    href="/about"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                        isActive('/about') ? "text-primary" : "text-muted-foreground hover:text-primary"
                    )}
                >
                    <Info className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{t.about}</span>
                </Link>

                {/* 3. Add Guru (All - Center) */}
                <Link
                    href="/add-guru"
                    className="flex flex-col items-center justify-center w-full h-full -mt-6"
                >
                    <div className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-full shadow-lg animate-spin-twist",
                        !isActive('/add-guru') && "animate-magic-pulse",
                        isActive('/add-guru')
                            ? "bg-primary text-primary-foreground shadow-primary/40 ring-2 ring-background"
                            : "bg-primary text-primary-foreground shadow-primary/20"
                    )}>
                        <PlusCircle className="w-6 h-6" />
                    </div>
                    <span className={cn(
                        "text-[10px] font-medium mt-1",
                        isActive('/add-guru') ? "text-primary" : "text-muted-foreground"
                    )}>
                        {t.addGuru}
                    </span>
                </Link>

                {/* 4. My Reviews (User) OR Contact (Guest) */}
                {user ? (
                    <Link
                        href="/my-reviews"
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                            isActive('/my-reviews') ? "text-primary" : "text-muted-foreground hover:text-primary"
                        )}
                    >
                        <Star className="w-5 h-5" />
                        <span className="text-[10px] font-medium">{t.myReviewsMobile}</span>
                    </Link>
                ) : (
                    <Link
                        href="/contact"
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                            isActive('/contact') ? "text-primary" : "text-muted-foreground hover:text-primary"
                        )}
                    >
                        <Mail className="w-5 h-5" />
                        <span className="text-[10px] font-medium">{t.contact}</span>
                    </Link>
                )}

                {/* 5. Admin (Mod) OR Contact (User) OR Login (Guest) */}
                {isModerator ? (
                    <Link
                        href="/admin"
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                            isActive('/admin') ? "text-primary" : "text-muted-foreground hover:text-primary"
                        )}
                    >
                        <Shield className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Admin</span>
                    </Link>
                ) : user ? (
                    <Link
                        href="/contact"
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                            isActive('/contact') ? "text-primary" : "text-muted-foreground hover:text-primary"
                        )}
                    >
                        <Mail className="w-5 h-5" />
                        <span className="text-[10px] font-medium">{t.contact}</span>
                    </Link>
                ) : (
                    <button
                        onClick={openLoginModal}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-muted-foreground hover:text-primary"
                        )}
                    >
                        <LogIn className="w-5 h-5" />
                        <span className="text-[10px] font-medium">{t.login}</span>
                    </button>
                )}
            </nav>
        </div>
    );
}
