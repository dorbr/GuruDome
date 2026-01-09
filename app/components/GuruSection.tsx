'use client';

import React, { useState } from 'react';
import GuruCard from './GuruCard';
import GuruPlaceholderCard from './GuruPlaceholderCard';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

interface GuruSectionProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    variant: 'expert' | 'scammer' | 'trending';
    gurus: any[];
}

export default function GuruSection({ title, subtitle, icon, variant, gurus }: GuruSectionProps) {
    const { language } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);

    const showMore = language === 'he' ? 'הצג עוד' : 'Show More';
    const showLess = language === 'he' ? 'הצג פחות' : 'Show Less';

    // Determine styles based on variant
    const getColors = () => {
        switch (variant) {
            case 'expert':
                return {
                    accent: 'amber-500',
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                    text: 'text-amber-500',
                    gradientFrom: 'from-amber-500/10',
                    shimmerFrom: 'from-amber-500/30',
                    placeholderGlow: 'from-amber-500/10',
                    gradientTo: 'to-amber-500/10'
                };
            case 'scammer':
                return {
                    accent: 'red-500',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    text: 'text-red-500',
                    gradientFrom: 'from-red-500/10',
                    shimmerFrom: 'from-red-500/30',
                    placeholderGlow: 'from-red-500/10',
                    gradientTo: 'to-red-500/10'
                };
            case 'trending':
                return {
                    accent: 'indigo-500',
                    bg: 'bg-indigo-500/10',
                    border: 'border-indigo-500/20',
                    text: 'text-indigo-500',
                    gradientFrom: 'from-indigo-500/10',
                    shimmerFrom: 'from-indigo-500/30',
                    placeholderGlow: 'from-indigo-500/10',
                    gradientTo: 'to-indigo-500/10'
                };
        }
    };

    const colors = getColors();

    // Logic for displaying cards
    // Mobile: Show 1 if collapsed, all if expanded
    // Desktop: Always show all (controlled via CSS mostly, but we can Limit map rendering too or just hide with css)
    // Actually, purely CSS hiding is better for SSR friendliness if possible, but for "Show More" state logic we often use JS.
    // Let's use JS for the list slice to be explicit about what's rendered.
    // However, to support "Desktop always shows all", we need media query awareness or just CSS classes.
    // JS media queries can cause hydration mismatches. 
    // Best approach: Render ALL cards, but use CSS to hide them on mobile if not expanded.

    const hasData = gurus.length > 0;
    const itemsToRender = hasData ? gurus : [1, 2, 3, 4]; // 4 placeholders if no data

    return (
        <div className="relative">
            {/* Background Decor */}
            <div className={`absolute -inset-4 bg-gradient-to-r ${colors.gradientFrom} via-yellow-500/5 ${colors.gradientTo} blur-xl -z-10 rounded-3xl`} />

            <div className="flex items-center gap-3 mb-8">
                <div className={`p-2 ${colors.bg} rounded-lg border ${colors.border}`}>
                    <span className="text-2xl">{icon}</span>
                </div>
                <div>
                    <h2 className={`text-3xl font-bold tracking-tight ${colors.text}`}>{title}</h2>
                    <p className="text-muted-foreground">{subtitle}</p>
                </div>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`}>
                {itemsToRender.map((item, index) => {
                    // Mobile visibility logic:
                    // Index 0: Always visible.
                    // Index > 0: Hidden on mobile unless expanded. Always visible on sm+.
                    const visibilityClass = index === 0 ? '' : (isExpanded ? '' : 'hidden sm:block');

                    if (hasData) {
                        return (
                            <div key={item._id} className={`relative group ${visibilityClass}`}>
                                <div className={`absolute -inset-0.5 bg-gradient-to-b ${colors.shimmerFrom} to-transparent rounded-xl opacity-50 blur group-hover:opacity-100 transition duration-500`} />
                                <GuruCard guru={item} />
                            </div>
                        );
                    } else {
                        return (
                            <div key={`${variant}-placeholder-${index}`} className={`relative group ${visibilityClass}`}>
                                <div className={`absolute -inset-0.5 bg-gradient-to-b ${colors.placeholderGlow} to-transparent rounded-xl opacity-30 blur group-hover:opacity-60 transition duration-500`} />
                                <GuruPlaceholderCard variant={variant} />
                            </div>
                        );
                    }
                })}
            </div>

            {/* Show More Button - Mobile Only */}
            <div className="mt-6 sm:hidden flex justify-center">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${colors.border} ${colors.bg} ${colors.text} hover:bg-opacity-20 active:scale-95`}
                >
                    {isExpanded ? (
                        <>
                            {showLess} <ChevronUp className="w-4 h-4" />
                        </>
                    ) : (
                        <>
                            {showMore} <ChevronDown className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
