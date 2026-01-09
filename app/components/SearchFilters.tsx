'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { Filter, ArrowUpDown, X } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

const CATEGORIES = [
    'Dropshipping',
    'Crypto/Forex',
    'Real Estate',
    'Marketing',
    'Fitness',
    'Lifestyle',
    'Other',
];

const CATEGORY_KEYS: Record<string, keyof typeof import('@/lib/i18n').en.categories> = {
    'Dropshipping': 'dropshipping',
    'Crypto/Forex': 'cryptoForex',
    'Real Estate': 'realEstate',
    'Marketing': 'marketing',
    'Fitness': 'fitness',
    'Lifestyle': 'lifestyle',
    'Other': 'other',
};

export default function SearchFilters() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    const currentCategory = searchParams.get('category') || '';
    const currentMinRating = searchParams.get('minRating') || '';
    const currentMaxRating = searchParams.get('maxRating') || '';
    const currentSort = searchParams.get('sort') || 'rating';

    const hasActiveFilters = currentCategory || currentMinRating || currentMaxRating;

    const RATING_FILTERS = [
        { label: t.ratingFilters.all, minRating: null, maxRating: null },
        { label: t.ratingFilters.fourPlus, minRating: '4', maxRating: null },
        { label: t.ratingFilters.threePlus, minRating: '3', maxRating: null },
        { label: t.ratingFilters.underThree, minRating: null, maxRating: '3' },
    ];

    const SORT_OPTIONS = [
        { value: 'rating', label: t.sortOptions.rating },
        { value: 'reviews', label: t.sortOptions.reviews },
        { value: 'newest', label: t.sortOptions.newest },
        { value: 'name', label: t.sortOptions.name },
    ];

    function updateParams(updates: Record<string, string | null>) {
        const params = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    }

    function handleCategoryChange(category: string) {
        updateParams({ category: category || null });
    }

    function handleRatingChange(minRating: string | null, maxRating: string | null) {
        updateParams({ minRating, maxRating });
    }

    function handleSortChange(sort: string) {
        updateParams({ sort: sort === 'rating' ? null : sort });
    }

    function clearAllFilters() {
        updateParams({ category: null, minRating: null, maxRating: null, sort: null });
    }

    // Determine active rating filter
    const activeRatingLabel = RATING_FILTERS.find(
        (f) =>
            (f.minRating || '') === currentMinRating &&
            (f.maxRating || '') === currentMaxRating
    )?.label || t.ratingFilters.all;

    return (
        <div className={`space-y-4 transition-opacity ${isPending ? 'opacity-60' : ''}`}>
            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Category Dropdown */}
                <div className="relative">
                    <select
                        value={currentCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="appearance-none pl-9 pr-8 py-2 text-sm rounded-full border border-white/10 bg-background/50 backdrop-blur-sm cursor-pointer hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    >
                        <option value="">{t.allCategories}</option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {t.categories[CATEGORY_KEYS[cat]]}
                            </option>
                        ))}
                    </select>
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Rating Filter Chips */}
                <div className="flex items-center gap-2">
                    {RATING_FILTERS.map((filter) => {
                        const isActive = filter.label === activeRatingLabel;
                        return (
                            <button
                                key={filter.label}
                                onClick={() => handleRatingChange(filter.minRating, filter.maxRating)}
                                className={`px-3 py-1.5 text-sm rounded-full border transition-all ${isActive
                                    ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                                    : 'border-white/10 bg-background/50 hover:border-primary/30 hover:bg-background/80'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        );
                    })}
                </div>

                {/* Sort Dropdown */}
                <div className="relative ml-auto">
                    <select
                        value={currentSort}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="appearance-none pl-9 pr-8 py-2 text-sm rounded-full border border-white/10 bg-background/50 backdrop-blur-sm cursor-pointer hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                        {t.clearFilters}
                    </button>
                )}
            </div>
        </div>
    );
}
