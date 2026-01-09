import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { User, Guru, Review, ReviewReport } from '@/lib/models';
import { getUserFromRequest, canAccessAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';

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

        // Get statistics
        const [
            totalUsers,
            totalGurus,
            totalReviews,
            pendingReports,
            bannedUsers,
            recentUsers,
            recentReviews,
        ] = await Promise.all([
            User.countDocuments(),
            Guru.countDocuments(),
            Review.countDocuments(),
            ReviewReport.countDocuments({ status: 'pending' }),
            User.countDocuments({ isBanned: true }),
            User.countDocuments({
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }),
            Review.countDocuments({
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }),
        ]);

        // Get role distribution
        const roleDistribution = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        // Get recent activity (last 5 reviews and reports)
        const recentActivity = await Review.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('guruId', 'name')
            .lean();

        return NextResponse.json({
            stats: {
                totalUsers,
                totalGurus,
                totalReviews,
                pendingReports,
                bannedUsers,
                recentUsers,
                recentReviews,
            },
            roleDistribution: roleDistribution.reduce((acc, { _id, count }) => {
                acc[_id || 'user'] = count;
                return acc;
            }, {} as Record<string, number>),
            recentActivity,
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
