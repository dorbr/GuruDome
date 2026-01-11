'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import GuruAvatar from './GuruAvatar';
import { useLanguage } from './LanguageProvider';

// Basic type definition for Guru (can be moved to a types file later)
interface GuruProps {
    _id: string;
    name: string;
    instagramUrl: string;
    profileImage?: string;
    category?: string;
    bio?: string;
    ratingStats?: {
        averageRating: number;
        totalReviews: number;
    }
}

const CATEGORY_KEYS: Record<string, keyof typeof import('@/lib/i18n').en.categories> = {
    'Dropshipping': 'dropshipping',
    'Crypto/Forex': 'cryptoForex',
    'Real Estate': 'realEstate',
    'Marketing': 'marketing',
    'Fitness': 'fitness',
    'Lifestyle': 'lifestyle',
    'Other': 'other',
};

export default function GuruCard({ guru }: { guru: GuruProps }) {
    const { t, language } = useLanguage();
    const rating = guru.ratingStats?.averageRating || 0;
    const reviewCount = guru.ratingStats?.totalReviews || 0;

    const noBio = language === 'he' ? 'אין ביוגרפיה זמינה.' : 'No bio available.';
    const viewProfile = language === 'he' ? '← צפה בפרופיל' : 'View Profile →';

    const categoryDisplay = guru.category && CATEGORY_KEYS[guru.category]
        ? t.categories[CATEGORY_KEYS[guru.category]]
        : guru.category;

    return (
        <div className="group relative h-full">
            <Link href={`/guru/${guru._id}`} className="block h-full">
                <div className="glass-panel group-hover:bg-white/10 group-hover:border-primary/30 relative overflow-hidden rounded-xl border border-white/5 shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 h-full flex flex-col">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="p-6 relative z-10 flex flex-col flex-1">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <GuruAvatar
                                    name={guru.name}
                                    imageUrl={guru.profileImage}
                                    instagramUrl={guru.instagramUrl}
                                />

                                <div>
                                    <h3 className="font-bold tracking-tight text-xl text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                        {guru.name}
                                    </h3>
                                    {categoryDisplay && (
                                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground border border-border/50">
                                            {categoryDisplay}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 mb-4">
                            <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-4 w-4 ${star <= Math.round(rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'fill-muted/20 text-muted'}`}
                                    />
                                ))}
                            </div>
                            <span className="ml-1 rtl:ml-0 rtl:mr-1 font-bold text-foreground">{rating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">({reviewCount} {t.reviews.toLowerCase()})</span>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {guru.bio || noBio}
                        </p>

                        <div className="mt-auto pt-4 flex items-center text-xs font-medium text-primary opacity-0 -translate-x-2 rtl:translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 rtl:group-hover:translate-x-0">
                            {viewProfile}
                        </div>
                    </div>
                </div>
            </Link>

            {/* Compare Action - Positioned absolutely over the card but technically outside the main link */}
            <Link
                href={`/battles?preselect=${guru._id}&name=${encodeURIComponent(guru.name)}`}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-white"
                title="Compare this Guru"
                onClick={(e) => e.stopPropagation()}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14.5 17.5 3 3L21 17" /><path d="m21 17-3-3 3 3" /><path d="M3 7v11" /><path d="M3 18h18" /><path d="M21 7v11" /><path d="m9.5 6.5-3-3L3.5 6.5" /><path d="m3.5 6.5 3 3-3-3" /></svg>
            </Link>
        </div>
    );
}
