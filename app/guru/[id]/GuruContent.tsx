'use client';

import { useState } from 'react';
import { Star, ChevronDown } from 'lucide-react';
import ReviewCard from '../../components/ReviewCard';
import ReviewModal from '../../components/ReviewModal';
import GuruAvatar from '../../components/GuruAvatar';
import { useLanguage } from '../../components/LanguageProvider';
import PerformanceHistoryModal from '../../components/PerformanceHistoryModal';

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* AI Summary & Background Check */}
                <div className="md:col-span-2 space-y-6">
                    <div className="rounded-xl border bg-card p-6 shadow-sm h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-xl font-bold">{t.aiBackgroundCheck || 'AI Summary & Background Check'}</h2>
                            <span className="bg-blue-500/10 text-blue-500 text-xs px-2 py-0.5 rounded-full font-medium">
                                {t.beta || 'BETA'}
                            </span>
                        </div>

                        {guru.aiSummary ? (
                            <div className="space-y-4 text-sm leading-relaxed">
                                <div>
                                    <h3 className="font-semibold mb-1 text-foreground">{t.summary || 'Summary'}</h3>
                                    <p className="text-muted-foreground">{guru.aiSummary.summary}</p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg border border-dashed border-red-200 dark:border-red-900/50">
                                    <h3 className="font-semibold mb-1 text-foreground flex items-center gap-2">
                                        {t.backgroundCheckReport || 'Background Check Report'}
                                    </h3>
                                    <p className="text-muted-foreground">{guru.aiSummary.backgroundCheck}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground pt-2">
                                    <p>
                                        {t.lastUpdated || 'Last updated:'} {new Date(guru.aiSummary.lastUpdated).toLocaleDateString()}
                                    </p>
                                    <span className="hidden sm:inline">•</span>
                                    <p className="bg-secondary/50 px-2 py-0.5 rounded-full">
                                        {t.updatesEvery24h || 'Updates every 24h'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No AI analysis available yet. Data is generated periodically.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Tracking */}
                <div className="md:col-span-1">
                    <div className="rounded-xl border bg-card p-6 shadow-sm h-full flex flex-col">
                        <h2 className="text-xl font-bold mb-6">{t.performance}</h2>

                        <div className="space-y-6 mb-8">
                            {[
                                { label: t.trustworthiness, value: guru.performanceMetrics?.trustworthiness || 0, color: 'bg-green-500' },
                                { label: t.valueForMoney, value: guru.performanceMetrics?.valueForMoney || 0, color: 'bg-blue-500' },
                                { label: t.authenticity, value: guru.performanceMetrics?.authenticity || 0, color: 'bg-indigo-500' }
                            ].map((metric) => (
                                <div key={metric.label}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium">{metric.label}</span>
                                        <span className="font-bold">{metric.value.toFixed(1)}/5.0</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${metric.color} transition-all duration-500 ease-out`}
                                            style={{ width: `${(metric.value / 5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* History Chart */}
                        <div className="mt-auto pt-6 border-t">
                            <PerformanceHistoryModal data={guru.performanceHistory || []} className="py-2" />
                        </div>

                        <div className="mt-4 text-xs text-muted-foreground text-center">
                            <p>{t.basedOnReviews.replace('{count}', (guru.ratingStats?.totalReviews || 0).toString())}</p>
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
