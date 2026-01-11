'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageProvider';

export default function Footer() {
    const { t } = useLanguage();
    const year = new Date().getFullYear();

    return (
        <footer className="w-full py-6 border-t mt-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                    <span>{t.copyright.replace('{year}', String(year))}</span>
                    <span className="hidden md:inline w-1 h-1 rounded-full bg-muted-foreground/50" />
                    <span className="font-medium text-foreground/80">{t.socialInitiative}</span>
                </div>
                <nav className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 md:gap-6">
                    <Link href="/about" className="hover:text-foreground transition-colors">
                        {t.about}
                    </Link>
                    <Link href="/privacy" className="hover:text-foreground transition-colors">
                        {t.privacyPolicy}
                    </Link>
                    <Link href="/terms" className="hover:text-foreground transition-colors">
                        {t.termsOfService}
                    </Link>
                    <Link href="/takedown" className="hover:text-foreground transition-colors">
                        {t.reportTakedown}
                    </Link>
                    <Link href="/community" className="hover:text-foreground transition-colors">
                        {t.communityGuidelines}
                    </Link>
                    <Link href="/contact" className="hover:text-foreground transition-colors">
                        {t.contact}
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
