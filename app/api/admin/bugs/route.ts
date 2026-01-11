import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { BugReport } from '@/lib/models';
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

        const reports = await BugReport.find({})
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return NextResponse.json({
            reports
        });
    } catch (error) {
        console.error('Error fetching bug reports:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);

        if (!user) return unauthorizedResponse();
        if (!canAccessAdmin(user)) return forbiddenResponse();

        const body = await request.json();
        const { reportId, status } = body;

        if (!reportId || !status) {
            return NextResponse.json({ error: 'Report ID and status are required' }, { status: 400 });
        }

        await connectToDatabase();

        const report = await BugReport.findByIdAndUpdate(
            reportId,
            { status },
            { new: true }
        );

        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error('Error updating bug report:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
