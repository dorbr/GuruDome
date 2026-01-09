'use client';

import { Star } from 'lucide-react';
import ReviewCard from '../../components/ReviewCard';
import ReviewModal from '../../components/ReviewModal';
import GuruAvatar from '../../components/GuruAvatar';
import { useLanguage } from '../../components/LanguageProvider';

interface GuruContentProps {
    guru: any;
    reviews: any[];
    guruId: string;
}

export default function GuruContent({ guru, reviews, guruId }: GuruContentProps) {
    const { t } = useLanguage();

    return (
        <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
            {/* Guru Header Profile */}
            <div className="rounded-xl border bg-card p-8 shadow-sm mb-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Profile Image with GuruAvatar */}
                    <GuruAvatar
                        name={guru.name}
                        imageUrl={guru.profileImage}
                        instagramUrl={guru.instagramUrl}
                        className="w-24 h-24 md:w-32 md:h-32 text-4xl"
                    />

                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight">{guru.name}</h1>
                            <p className="text-muted-foreground font-medium">{guru.category || t.creator}</p>
                            {/* Links could go here */}
                            <div className="flex gap-4 text-sm text-primary">
                                {guru.instagramUrl && (
                                    <a href={guru.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {t.instagramProfile}
                                    </a>
                                )}
                            </div>
                        </div>

                        <p className="text-muted-foreground leading-relaxed max-w-2xl">
                            {guru.bio || t.noBioYet}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t mt-4">
                            <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-lg">
                                <span className="text-2xl font-bold">{guru.ratingStats?.averageRating?.toFixed(1) || '0.0'}</span>
                                <div className="flex flex-col text-xs text-muted-foreground">
                                    <div className="flex text-yellow-500">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className={`h-3 w-3 ${star <= Math.round(guru.ratingStats?.averageRating || 0) ? 'fill-current' : 'text-muted'}`} />
                                        ))}
                                    </div>
                                    <span>{guru.ratingStats?.totalReviews || 0} {t.reviews}</span>
                                </div>
                            </div>

                            <ReviewModal guruId={guruId} className="w-auto px-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{t.reviews}</h2>
                </div>

                {reviews.length === 0 ? (
                    <div className="text-center py-16 border rounded-xl border-dashed bg-muted/20 text-muted-foreground">
                        <h3 className="text-lg font-medium text-foreground mb-2">{t.noReviewsYet}</h3>
                        <p className="mb-6">{t.beFirstReview} {guru.name}.</p>
                        <div className="flex justify-center">
                            <ReviewModal guruId={guruId} className="w-auto" />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review: any) => (
                            <ReviewCard key={review._id} review={review} />
                        ))}
                    </div>
                )}
            </div>

        </main>
    );
}
