'use client';

import React from 'react';
import Search from './Search';
import SearchFilters from './SearchFilters';
import GuruCard from './GuruCard';
import GuruSection from './GuruSection';
import { useLanguage } from './LanguageProvider';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface HomeContentProps {
    gurus: any[];
    experts: any[];
    scammers: any[];
    trending: any[];
    isSearching: boolean;
    query: string;
}

export default function HomeContent({ gurus, experts, scammers, trending, isSearching, query }: HomeContentProps) {
    const { t } = useLanguage();

    return (
        <main className="flex-1 flex flex-col items-center w-full">
            {/* Premium Hero Section */}
            <section className="relative w-full py-24 md:py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                <div className="space-y-6 max-w-4xl relative z-10 animate-in fade-in zoom-in duration-700">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance leading-tight">
                        {t.heroTitle1} <span className="text-foreground/80">{t.heroFakes}</span> <br />
                        {t.heroTitle2} <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">{t.heroGreats}</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {t.heroSubtitle}
                        <span className="block mt-2 text-foreground/80 font-medium">{t.heroTagline}</span>
                    </p>
                </div>

                <div className="w-full max-w-xl mt-12 relative z-10 animate-in slide-in-from-bottom-4 duration-1000 delay-200">
                    <Search />
                </div>

                <div className="mt-8 relative z-10 animate-in slide-in-from-bottom-5 duration-1000 delay-300">
                    <Link href="/add-guru">
                        <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-primary px-8 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-primary/50 hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 hover:ring-offset-background">
                            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                                <div className="relative h-full w-8 bg-white/20"></div>
                            </div>
                            <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90 group-active:rotate-180" />
                            <span className="relative">{t.addGuru}</span>
                        </button>
                    </Link>
                </div>
            </section>

            {/* Filters Section */}
            <section className="w-full max-w-7xl px-4 -mt-8 relative z-20">
                <SearchFilters />
            </section>

            {/* Results Section */}
            <section className="w-full max-w-7xl px-4 py-16 space-y-20">

                {isSearching ? (
                    <div>
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                                {query ? `${t.resultsFor} "${query}"` : t.filteredResults}
                            </h2>
                            <span className="text-sm text-muted-foreground">
                                {gurus.length} {gurus.length === 1 ? t.guruFound : t.gurusFound}
                            </span>
                        </div>
                        {gurus.length === 0 ? (
                            <div className="text-center py-24 bg-secondary/20 rounded-2xl border border-dashed border-border/50 backdrop-blur-sm">
                                <p className="text-muted-foreground text-lg">{t.noGurusFound}</p>
                                <p className="text-sm text-muted-foreground/60 mt-2">{t.tryFewerKeywords}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                {gurus.map((guru: any) => (
                                    <GuruCard key={guru._id} guru={guru} />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Trending Gurus */}
                        <GuruSection
                            title={t.trendingGurus}
                            subtitle={t.trendingSubtitle}
                            icon="🔥"
                            variant="trending"
                            gurus={trending}
                        />

                        {/* Hall of Fame - Experts */}
                        <GuruSection
                            title={t.hallOfFame}
                            subtitle={t.hallOfFameSubtitle}
                            icon="🏆"
                            variant="expert"
                            gurus={experts}
                        />

                        {/* Wall of Shame - Scammers */}
                        <GuruSection
                            title={t.wallOfShame}
                            subtitle={t.wallOfShameSubtitle}
                            icon="⚠️"
                            variant="scammer"
                            gurus={scammers}
                        />

                        {experts.length === 0 && scammers.length === 0 && trending.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">{t.startSearching}</p>
                            </div>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}
