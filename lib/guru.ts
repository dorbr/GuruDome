import connectToDatabase from '@/lib/db';
import { Guru, Review } from '@/lib/models';
import mongoose from 'mongoose';
import { generateGuruAnalysis } from './ai';

export async function updateGuruMetrics(guruId: string) {
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

        if (shouldAddHistory) {
            updateData.$push = {
                performanceHistory: {
                    date: new Date(),
                    totalReviews: s.count,
                    averageRating: s.avgRating,
                    trustworthiness: s.avgTrust || 0,
                    valueForMoney: s.avgValue || 0,
                    authenticity: s.avgAuth || 0,
                }
            };
        }

        await Guru.findByIdAndUpdate(guruId, updateData);
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
