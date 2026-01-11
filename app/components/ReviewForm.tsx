'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useLanguage } from './LanguageProvider';

interface ReviewFormProps {
    guruId: string;
    onSuccess?: () => void;
    initialData?: any;
    reviewId?: string; // If provided, it's an edit
}

export default function ReviewForm({ guruId, onSuccess, initialData, reviewId }: ReviewFormProps) {
    const router = useRouter();
    const { t } = useLanguage();

    // Initialize state with initialData if provided
    const [rating, setRating] = useState(initialData?.rating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [text, setText] = useState(initialData?.text || '');
    const [title, setTitle] = useState(initialData?.title || '');
    const [isScam, setIsScam] = useState(initialData?.isScam || false);
    const [isPurchased, setIsPurchased] = useState(initialData?.isPurchased || false);
    const [detailedRatings, setDetailedRatings] = useState({
        trustworthiness: initialData?.detailedRatings?.trustworthiness || 0,
        valueForMoney: initialData?.detailedRatings?.valueForMoney || 0,
        authenticity: initialData?.detailedRatings?.authenticity || 0
    });

    // Hover states for detailed ratings
    const [hoverDetailed, setHoverDetailed] = useState({
        trustworthiness: 0,
        valueForMoney: 0,
        authenticity: 0
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const getRatingLabel = (r: number) => {
        if (r === 0) return t.selectRating;
        if (r === 1) return t.ratingLabels.terrible;
        if (r === 2) return t.ratingLabels.poor;
        if (r === 3) return t.ratingLabels.average;
        if (r === 4) return t.ratingLabels.good;
        return t.ratingLabels.excellent;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (rating === 0) {
            setError(t.pleaseSelectRating);
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const user = auth?.currentUser;
            const userId = user ? user.uid : `anon-${Math.random().toString(36).substr(2, 9)}`;

            const payload = {
                userId,
                guruId,
                rating,
                text,
                title,
                isScam,
                isPurchased,
                detailedRatings: {
                    trustworthiness: detailedRatings.trustworthiness || rating,
                    valueForMoney: detailedRatings.valueForMoney || rating,
                    authenticity: detailedRatings.authenticity || rating
                }
            };

            let res;
            if (reviewId) {
                // Update existing review
                res = await fetch(`/api/reviews/${reviewId}?userId=${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } else {
                // Create new review
                res = await fetch(`/api/gurus/${guruId}/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit review');
            }

            // Only reset form if creating new review
            if (!reviewId) {
                setRating(0);
                setText('');
                setTitle('');
                setIsScam(false);
                setIsPurchased(false);
                setDetailedRatings({ trustworthiness: 0, valueForMoney: 0, authenticity: 0 });
            }

            router.refresh();

            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper for rendering star inputs
    const StarRating = ({
        value,
        hoverValue,
        onHover,
        onLeave,
        onSelect,
        label,
        size = "md"
    }: {
        value: number,
        hoverValue: number,
        onHover: (s: number) => void,
        onLeave: () => void,
        onSelect: (s: number) => void,
        label?: string,
        size?: "sm" | "md"
    }) => (
        <div className={`flex ${label ? 'items-center justify-between' : 'flex-col gap-2'}`}>
            {label && <label className="text-sm text-muted-foreground">{label}</label>}
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className="focus:outline-none transition-transform hover:scale-110"
                        onMouseEnter={() => onHover(star)}
                        onMouseLeave={onLeave}
                        onClick={() => onSelect(star)}
                    >
                        <Star
                            className={`${size === "sm" ? "h-4 w-4" : "h-7 w-7"} ${star <= (hoverValue || value)
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'text-muted-foreground/30'
                                }`}
                        />
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6 text-card-foreground">
            {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                    {error}
                </div>
            )}

            {/* Scam Report Toggle */}
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-red-100 p-2 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
                    </div>
                    <div>
                        <p className="font-medium">{t.reportAsScam}</p>
                        <p className="text-xs text-muted-foreground">{t.scamDescription}</p>
                    </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="sr-only peer" checked={isScam} onChange={(e) => setIsScam(e.target.checked)} />
                    <div className="peer h-6 w-11 rounded-full bg-input after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500/20 rtl:peer-checked:after:-translate-x-full"></div>
                </label>
            </div>

            {/* Overall Rating */}
            <div className="space-y-2">
                <label className="text-base font-semibold">{t.overallRating} *</label>
                <div className="flex items-center gap-3">
                    <StarRating
                        value={rating}
                        hoverValue={hoverRating}
                        onHover={setHoverRating}
                        onLeave={() => setHoverRating(0)}
                        onSelect={setRating}
                    />
                    <span className="text-lg font-medium text-muted-foreground ml-2 rtl:ml-0 rtl:mr-2">
                        {getRatingLabel(rating)}
                    </span>
                </div>
            </div>

            {/* Detailed Ratings */}
            <div className="rounded-xl bg-muted/30 p-5 space-y-4">
                <h3 className="font-medium text-sm text-foreground/80 mb-2">{t.detailedRatings}</h3>
                <StarRating
                    label={t.trustworthiness}
                    size="sm"
                    value={detailedRatings.trustworthiness}
                    hoverValue={hoverDetailed.trustworthiness}
                    onHover={(v) => setHoverDetailed(prev => ({ ...prev, trustworthiness: v }))}
                    onLeave={() => setHoverDetailed(prev => ({ ...prev, trustworthiness: 0 }))}
                    onSelect={(v) => setDetailedRatings(prev => ({ ...prev, trustworthiness: v }))}
                />
                <StarRating
                    label={t.valueForMoney}
                    size="sm"
                    value={detailedRatings.valueForMoney}
                    hoverValue={hoverDetailed.valueForMoney}
                    onHover={(v) => setHoverDetailed(prev => ({ ...prev, valueForMoney: v }))}
                    onLeave={() => setHoverDetailed(prev => ({ ...prev, valueForMoney: 0 }))}
                    onSelect={(v) => setDetailedRatings(prev => ({ ...prev, valueForMoney: v }))}
                />
                <StarRating
                    label={t.authenticity}
                    size="sm"
                    value={detailedRatings.authenticity}
                    hoverValue={hoverDetailed.authenticity}
                    onHover={(v) => setHoverDetailed(prev => ({ ...prev, authenticity: v }))}
                    onLeave={() => setHoverDetailed(prev => ({ ...prev, authenticity: 0 }))}
                    onSelect={(v) => setDetailedRatings(prev => ({ ...prev, authenticity: v }))}
                />
            </div>

            {/* Purchase Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    </div>
                    <div>
                        <p className="font-medium">{t.purchasedProduct}</p>
                        <p className="text-xs text-muted-foreground">{t.purchasedQuestion}</p>
                    </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="sr-only peer" checked={isPurchased} onChange={(e) => setIsPurchased(e.target.checked)} />
                    <div className="peer h-6 w-11 rounded-full bg-input after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rtl:peer-checked:after:-translate-x-full"></div>
                </label>
            </div>

            {/* Review Title */}
            <div className="space-y-2">
                <label className="text-sm font-medium">{t.reviewTitle}</label>
                <input
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={t.reviewTitlePlaceholder}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                />
            </div>

            {/* Review Text */}
            <div className="space-y-2">
                <label className="text-sm font-medium">{t.yourReview} *</label>
                <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    placeholder={t.yourReviewPlaceholder}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isSubmitting}
                />
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border">
                {t.reviewFormDisclaimer}
            </p>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-primary h-11 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
                {isSubmitting ? (reviewId ? 'Updating...' : t.postingReview) : (reviewId ? 'Update Review' : t.submitReview)}
            </button>
        </form>
    );
}

