'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageProvider';

export default function Footer() {
    const { t } = useLanguage();
    const year = new Date().getFullYear();

    return (
        <footer className="w-full py-6 border-t mt-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <div>
                    {t.copyright.replace('{year}', String(year))}
                </div>
                <nav className="flex items-center gap-6">
                    <Link href="/privacy" className="hover:text-foreground transition-colors">
                        {t.privacyPolicy}
                    </Link>
                    <Link href="/terms" className="hover:text-foreground transition-colors">
                        {t.termsOfService}
                    </Link>
                    <Link href="/contact" className="hover:text-foreground transition-colors">
                        {t.contact}
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
