import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Review, Guru, User } from '@/lib/models';
import { updateGuruMetrics } from '@/lib/guru';
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
        } else if (filter === 'ai_fake') {
            queryFilter['aiAnalysis.isFake'] = true;
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

        let shouldUpdateMetrics = false;

        if (action === 'hide') {
            review.isHidden = true;
            shouldUpdateMetrics = true;
        } else if (action === 'show') {
            review.isHidden = false;
            shouldUpdateMetrics = true;
        } else if (action === 'clearReports') {
            review.reportCount = 0;
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        await review.save();

        if (shouldUpdateMetrics && review.guruId) {
            await updateGuruMetrics(review.guruId.toString(), {
                deletedReview: action === 'hide' ? review : undefined
                // Only treat as 'deleted' for history correction if we are hiding it. 
                // If showing, we technically shouldn't need to correct "history" backwards because that history *should* verify it existed?
                // Actually if we hide it, we want to remove it from past stats.
                // If we show it, it's like a new review appeared? Or it existed all along?
                // For simplicity, let's only fix history on HIDE/DELETE. 
                // Showing a previously hidden review might just be added as a "new" contribution to current stats, 
                // back-populating history for a "re-appeared" review is cleaner if we just let it be. 
                // BUT user specifically asked about DELETED data.
            });
        }

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

        const guruId = review.guruId;

        await Review.findByIdAndDelete(reviewId);

        // Update guru stats
        if (guruId) {
            await updateGuruMetrics(guruId.toString(), { deletedReview: review });
        }

        return NextResponse.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
