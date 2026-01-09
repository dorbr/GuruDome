import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Review, Guru, User } from '@/lib/models';
import { getUserFromRequest, canAccessAdmin, isAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);

        if (!user) {
            return unauthorizedResponse();
        }

        if (!canAccessAdmin(user)) {
            return forbiddenResponse();
        }

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const filter = searchParams.get('filter') || 'all'; // all, flagged, hidden, scam
        const guruId = searchParams.get('guruId');

        // Build filter
        const queryFilter: Record<string, unknown> = {};

        if (filter === 'flagged') {
            queryFilter.reportCount = { $gt: 0 };
        } else if (filter === 'hidden') {
            queryFilter.isHidden = true;
        } else if (filter === 'scam') {
            queryFilter.isScam = true;
        }

        if (guruId && mongoose.Types.ObjectId.isValid(guruId)) {
            queryFilter.guruId = guruId;
        }

        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            Review.find(queryFilter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('guruId', 'name profileImage')
                .lean(),
            Review.countDocuments(queryFilter),
        ]);

        // Fetch user info for each review
        const userIds = [...new Set(reviews.map(r => r.userId))];
        const users = await User.find({ firebaseUid: { $in: userIds } })
            .select('firebaseUid displayName email photoURL')
            .lean();

        const userMap = new Map(users.map(u => [u.firebaseUid, u]));

        const reviewsWithUsers = reviews.map(review => ({
            ...review,
            user: userMap.get(review.userId) || null,
        }));

        return NextResponse.json({
            reviews: reviewsWithUsers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);

        if (!user) {
            return unauthorizedResponse();
        }

        if (!canAccessAdmin(user)) {
            return forbiddenResponse();
        }

        const body = await request.json();
        const { reviewId, action } = body;

        if (!reviewId || !action) {
            return NextResponse.json({ error: 'Review ID and action are required' }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return NextResponse.json({ error: 'Invalid Review ID' }, { status: 400 });
        }

        await connectToDatabase();

        const review = await Review.findById(reviewId);

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        if (action === 'hide') {
            review.isHidden = true;
        } else if (action === 'show') {
            review.isHidden = false;
        } else if (action === 'clearReports') {
            review.reportCount = 0;
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        await review.save();

        return NextResponse.json({ success: true, review });
    } catch (error) {
        console.error('Error updating review:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);

        if (!user) {
            return unauthorizedResponse();
        }

        // Only admins can permanently delete reviews
        if (!isAdmin(user)) {
            return forbiddenResponse('Only admins can delete reviews');
        }

        const { searchParams } = new URL(request.url);
        const reviewId = searchParams.get('id');

        if (!reviewId) {
            return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return NextResponse.json({ error: 'Invalid Review ID' }, { status: 400 });
        }

        await connectToDatabase();

        const review = await Review.findById(reviewId);

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        // Update guru stats
        const guru = await Guru.findById(review.guruId);
        if (guru) {
            const currentTotal = guru.ratingStats.totalReviews || 0;
            const currentAvg = guru.ratingStats.averageRating || 0;

            if (currentTotal > 1) {
                const newTotal = currentTotal - 1;
                const newAvg = ((currentAvg * currentTotal) - review.rating) / newTotal;

                const ratingKey = `ratingStats.ratingDistribution.${review.rating}`;
                await Guru.findByIdAndUpdate(review.guruId, {
                    $set: {
                        'ratingStats.averageRating': newAvg,
                        'ratingStats.totalReviews': newTotal
                    },
                    $inc: { [ratingKey]: -1 }
                });
            } else {
                // Last review, reset stats
                await Guru.findByIdAndUpdate(review.guruId, {
                    $set: {
                        'ratingStats.averageRating': 0,
                        'ratingStats.totalReviews': 0,
                        'ratingStats.ratingDistribution': { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                    }
                });
            }
        }

        await Review.findByIdAndDelete(reviewId);

        return NextResponse.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
