'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

export default function Search() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    function handleSearch(term: string) {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }

        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    }

    return (
        <div className="relative w-full max-w-lg mx-auto group">
            <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-4 rtl:pl-0 rtl:pr-4 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <SearchIcon className="w-5 h-5" />
            </div>
            <input
                type="text"
                className="block w-full p-4 pl-12 rtl:pl-4 rtl:pr-12 text-sm md:text-base border border-white/10 rounded-full bg-background/50 backdrop-blur-md shadow-sm transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-background/80 focus:shadow-lg focus:shadow-primary/10 placeholder:text-muted-foreground/70"
                placeholder={t.searchPlaceholder}
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get('q')?.toString()}
            />
            {isPending && (
                <div className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-4 rtl:pr-0 rtl:pl-4">
                    <div className="w-4 h-4 border-2 border-primary rounded-full animate-spin border-t-transparent"></div>
                </div>
            )}
        </div>
    );
}
