import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { ReviewReport, Review, User } from '@/lib/models';
import { getUserFromRequest, canAccessAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
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
        const status = searchParams.get('status') || 'pending';

        // Build filter
        const filter: Record<string, unknown> = {};

        if (status !== 'all') {
            filter.status = status;
        }

        const skip = (page - 1) * limit;

        const [reports, total] = await Promise.all([
            ReviewReport.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'reviewId',
                    populate: {
                        path: 'guruId',
                        select: 'name profileImage'
                    }
                })
                .lean(),
            ReviewReport.countDocuments(filter),
        ]);

        // Fetch reporter info
        const reporterIds = [...new Set(reports.map(r => r.reporterId))];
        const reporters = await User.find({ firebaseUid: { $in: reporterIds } })
            .select('firebaseUid displayName email')
            .lean();

        const reporterMap = new Map(reporters.map(u => [u.firebaseUid, u]));

        // Fetch review author info
        const reviewUserIds = [...new Set(reports.map(r => (r.reviewId as any)?.userId).filter(Boolean))];
        const reviewUsers = await User.find({ firebaseUid: { $in: reviewUserIds } })
            .select('firebaseUid displayName email')
            .lean();

        const reviewUserMap = new Map(reviewUsers.map(u => [u.firebaseUid, u]));

        const reportsWithInfo = reports.map(report => ({
            ...report,
            reporter: reporterMap.get(report.reporterId) || null,
            reviewAuthor: report.reviewId ? reviewUserMap.get((report.reviewId as any).userId) || null : null,
        }));

        return NextResponse.json({
            reports: reportsWithInfo,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
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
        const { reportId, action } = body;

        if (!reportId || !action) {
            return NextResponse.json({ error: 'Report ID and action are required' }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return NextResponse.json({ error: 'Invalid Report ID' }, { status: 400 });
        }

        await connectToDatabase();

        const report = await ReviewReport.findById(reportId);

        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        if (action === 'dismiss') {
            report.status = 'dismissed';
        } else if (action === 'reviewed') {
            report.status = 'reviewed';
        } else if (action === 'removeReview') {
            // Hide the review and mark report as resolved
            await Review.findByIdAndUpdate(report.reviewId, { isHidden: true });
            report.status = 'removed';
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        await report.save();

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error('Error updating report:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
