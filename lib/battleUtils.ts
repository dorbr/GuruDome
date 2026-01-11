export interface Review {
    rating: number;
    createdAt: string;
    text?: string;
    isPurchased?: boolean; // verified student
    isScam?: boolean;
}

export interface ReputationAnalysis {
    score: number;
    trend: 'rising' | 'falling' | 'stable';
    quality: 'high' | 'average' | 'low';
    summary: string;
}

export function calculateReputationScore(guru: any, reviews: Review[]): ReputationAnalysis {
    if (!reviews || reviews.length === 0) {
        return {
            score: 0,
            trend: 'stable',
            quality: 'low',
            summary: 'No data available'
        };
    }

    let totalWeightedScore = 0;
    let totalWeight = 0;
    const now = new Date();

    // Sort reviews by date (newest first) just in case
    const sortedReviews = [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Split for trend analysis (first half vs second half)
    const midPoint = Math.ceil(sortedReviews.length / 2);
    const recentReviews = sortedReviews.slice(0, midPoint);
    const olderReviews = sortedReviews.slice(midPoint);

    const getAvg = (arr: Review[]) => arr.reduce((acc, r) => acc + r.rating, 0) / (arr.length || 1);
    const recentAvg = getAvg(recentReviews);
    const olderAvg = getAvg(olderReviews);

    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    if (recentAvg > olderAvg + 0.5) trend = 'rising';
    else if (recentAvg < olderAvg - 0.5) trend = 'falling';

    // SCORING ALGORITHM
    sortedReviews.forEach((review) => {
        let weight = 1;
        const reviewDate = new Date(review.createdAt);
        const daysOld = (now.getTime() - reviewDate.getTime()) / (1000 * 3600 * 24);

        // 1. Time Decay: Reviews older than 90 days lose 50% impact eventually, 
        // older than 1 year lose 80%.
        if (daysOld < 30) weight *= 1.5; // Freshness bonus
        else if (daysOld > 90) weight *= 0.8;
        else if (daysOld > 365) weight *= 0.5;

        // 2. Verified Bonus
        if (review.isPurchased) weight *= 2.0;

        // 3. Content Depth Bonus
        if (review.text && review.text.length > 100) weight *= 1.2;

        totalWeightedScore += (review.rating * weight);
        totalWeight += weight;
    });

    // Normalize to 0-100 scale
    // Max rating is 5. So (WeightedAvg / 5) * 100
    const weightedAvg = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    let finalScore = (weightedAvg / 5) * 100;

    // Volume Adjustment: Penalize very low review counts slightly to prevent 
    // "One 5-star review = 100/100 score" anomaly
    if (sortedReviews.length < 5) finalScore *= 0.8;
    else if (sortedReviews.length < 10) finalScore *= 0.9;

    let quality: 'high' | 'average' | 'low' = 'average';
    if (reviews.filter(r => r.isPurchased).length > reviews.length * 0.3) quality = 'high';
    if (reviews.length < 5) quality = 'low';

    return {
        score: Math.round(finalScore),
        trend,
        quality,
        summary: `${Math.round(finalScore)}/100`
    };
}
