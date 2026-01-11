'use client';

import { useState } from 'react';
import { Star, Flag, Info } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import ReportModal from './ReportModal';

interface ReviewProps {
    _id: string;
    rating: number;
    text: string;
    createdAt: string;
    userId: string;
    isHidden?: boolean;
}

export default function ReviewCard({ review }: { review: any }) {
    const { t } = useLanguage();
    const [showReportModal, setShowReportModal] = useState(false);

    // Don't render hidden reviews
    if (review.isHidden) {
        return null;
    }

    return (
        <>
            <div className="flex flex-col gap-3 rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md text-card-foreground">
                {/* Header: Author & Date */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                            {review.userId.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold text-sm">{t.userPrefix} {review.userId.slice(0, 4)}...</span>

                            <div className="flex flex-wrap items-center gap-2">
                                {review.isPurchased && (
                                    <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        {t.verifiedPurchased}
                                    </span>
                                )}
                                {review.isScam && (
                                    <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
                                        {t.scamReport}
                                    </span>
                                )}
                                {review.aiAnalysis?.isFake && (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-orange-700 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-400" title={review.aiAnalysis.reasoning}>
                                        <span>🤖</span>
                                        {t.aiFlagged}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pl-14 md:pl-0">
                        {/* Rating */}
                        <div className="flex items-center md:flex-col md:items-end gap-2 md:gap-0">
                            <div className="flex items-center gap-1 text-yellow-500">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-4 w-4 ${star <= review.rating ? 'fill-current' : 'text-muted-foreground/30'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-medium">{review.rating.toFixed(1)}/5.0</span>
                        </div>

                        {/* Report Button */}
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                            title={t.reportReview}
                            aria-label={t.reportReview}
                        >
                            <Flag className="h-4 w-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Title */}
                {review.title && (
                    <h4 className="font-bold text-lg mt-2">{review.title}</h4>
                )}

                {/* Content */}
                {review.text && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        {review.text}
                    </p>
                )}

                {/* Detailed Ratings */}
                {review.detailedRatings && (
                    <div className="mt-4 flex flex-wrap justify-center gap-4 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t.trust}</span>
                            <div className="flex text-yellow-500/80">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} className={`h-3 w-3 ${star <= (review.detailedRatings.trustworthiness || review.rating) ? 'fill-current' : 'text-muted-foreground/20'}`} />
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t.value}</span>
                            <div className="flex text-yellow-500/80">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} className={`h-3 w-3 ${star <= (review.detailedRatings.valueForMoney || review.rating) ? 'fill-current' : 'text-muted-foreground/20'}`} />
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t.authentic}</span>
                            <div className="flex text-yellow-500/80">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} className={`h-3 w-3 ${star <= (review.detailedRatings.authenticity || review.rating) ? 'fill-current' : 'text-muted-foreground/20'}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Opinion Disclaimer */}
                <div className="mt-3 pt-3 border-t border-border/30">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                        <Info className="h-3 w-3 shrink-0" />
                        <span>{t.opinionDisclaimer}</span>
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            <ReportModal
                targetId={review._id}
                targetType="review"
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
            />
        </>
    );
}
