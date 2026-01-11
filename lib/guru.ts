import connectToDatabase from '@/lib/db';
import { Guru, Review } from '@/lib/models';
import mongoose from 'mongoose';
import { generateGuruAnalysis } from './ai';

export async function updateGuruMetrics(guruId: string, context?: { deletedReview?: any }) {
    await connectToDatabase();

    // Aggregate reviews
    const stats = await Review.aggregate([
        { $match: { guruId: new mongoose.Types.ObjectId(guruId), isHidden: { $ne: true } } },
        {
            $group: {
                _id: '$guruId',
                avgRating: { $avg: '$rating' },
                count: { $sum: 1 },
                avgTrust: { $avg: '$detailedRatings.trustworthiness' },
                avgValue: { $avg: '$detailedRatings.valueForMoney' },
                avgAuth: { $avg: '$detailedRatings.authenticity' }
            }
        }
    ]);

    if (stats.length > 0) {
        const s = stats[0];
        const currentGuru = await Guru.findById(guruId);

        let shouldAddHistory = false;

        // Check if history is empty
        if (!currentGuru.performanceHistory || currentGuru.performanceHistory.length === 0) {
            shouldAddHistory = true;
        } else {
            // Get last entry
            const lastEntry = currentGuru.performanceHistory[currentGuru.performanceHistory.length - 1];

            // Calculate 10% increase threshold
            // e.g. if last was 10, we need 11 (10 + 1)
            // if last was 100, we need 110
            const threshold = Math.ceil(lastEntry.totalReviews * 1.1);

            if (s.count >= threshold) {
                shouldAddHistory = true;
            }
        }

        const updateData: any = {
            'ratingStats.averageRating': s.avgRating,
            'ratingStats.totalReviews': s.count,
            'performanceMetrics.trustworthiness': s.avgTrust || 0,
            'performanceMetrics.valueForMoney': s.avgValue || 0,
            'performanceMetrics.authenticity': s.avgAuth || 0,
        };

        // Fix history if a review was deleted or hidden
        if (context?.deletedReview && currentGuru.performanceHistory && currentGuru.performanceHistory.length > 0) {
            const deleted = context.deletedReview;
            const deletedDate = new Date(deleted.createdAt);

            const updatedHistory = currentGuru.performanceHistory.map((entry: any) => {
                const entryDate = new Date(entry.date);

                if (entryDate > deletedDate) {
                    // This entry included the deleted review, so we must remove it
                    const oldTotal = entry.totalReviews;
                    if (oldTotal <= 1) {
                        return null; // Was the only review? Remove entry.
                    }

                    const newTotal = oldTotal - 1;
                    const newAvg = ((entry.averageRating * oldTotal) - deleted.rating) / newTotal;

                    // Optional: Try to adjust other metrics if they exist
                    const adjustMetric = (avg: number, val: number) =>
                        val ? ((avg * oldTotal) - val) / newTotal : avg;

                    return {
                        date: entry.date, // Keep original date
                        _id: entry._id, // Keep ID if exists
                        totalReviews: newTotal,
                        averageRating: newAvg,
                        trustworthiness: adjustMetric(entry.trustworthiness, deleted.detailedRatings?.trustworthiness),
                        valueForMoney: adjustMetric(entry.valueForMoney, deleted.detailedRatings?.valueForMoney),
                        authenticity: adjustMetric(entry.authenticity, deleted.detailedRatings?.authenticity),
                    };
                }
                return entry;
            }).filter(Boolean); // Remove nulls

            if (updatedHistory.length !== currentGuru.performanceHistory.length || updatedHistory.some((h: any, i: number) => h.totalReviews !== currentGuru.performanceHistory[i].totalReviews)) {
                updateData.performanceHistory = updatedHistory;
            }
        }

        if (shouldAddHistory) {
            // Push new entry (using the potentially updated history as base if we were smart, but here we push to DB array)
            // If we modified history above, we replaced the whole array in updateData.performanceHistory.
            // So we should append to that array if it exists, or $push if it doesn't.

            const newEntry = {
                date: new Date(),
                totalReviews: s.count,
                averageRating: s.avgRating,
                trustworthiness: s.avgTrust || 0,
                valueForMoney: s.avgValue || 0,
                authenticity: s.avgAuth || 0,
            };

            if (updateData.performanceHistory) {
                updateData.performanceHistory.push(newEntry);
            } else {
                updateData.$push = { performanceHistory: newEntry };
            }
        }

        await Guru.findByIdAndUpdate(guruId, updateData);
    } else {
        // No reviews left - reset stats
        await Guru.findByIdAndUpdate(guruId, {
            'ratingStats.averageRating': 0,
            'ratingStats.totalReviews': 0,
            'ratingStats.ratingDistribution': { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            'performanceMetrics.trustworthiness': 0,
            'performanceMetrics.valueForMoney': 0,
            'performanceMetrics.authenticity': 0,
            'performanceHistory': []
        });
    }
}

export async function refreshGuruAIAnalysis(guruId: string, force: boolean = false) {
    await connectToDatabase();
    const guru = await Guru.findById(guruId);
    if (!guru) return;

    // Rate Limiting: Check if we updated recently (e.g. within 24 hours)
    // Only skip if NOT forced
    if (!force && guru.aiSummary?.lastUpdated) {
        const lastUpdate = new Date(guru.aiSummary.lastUpdated);
        const now = new Date();
        const diffInMs = now.getTime() - lastUpdate.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);

        if (diffInHours < 24) {
            console.log(`Skipping AI analysis for ${guru.name} (updated ${diffInHours.toFixed(2)} hours ago)`);
            return guru.aiSummary; // Return existing summary
        }
    }

    // Fetch recent reviews (limit to last 20 for analysis context)
    const reviews = await Review.find({ guruId, isHidden: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(20);

    const analysis = await generateGuruAnalysis(guru.name, reviews);

    if (analysis) {
        await Guru.findByIdAndUpdate(guruId, {
            aiSummary: {
                summary: analysis.summary,
                backgroundCheck: analysis.backgroundCheck,
                lastUpdated: new Date()
            }
        });
    }

    return analysis;
}
