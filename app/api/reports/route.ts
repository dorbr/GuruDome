import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Review, Guru, Report } from "@/lib/models";
import mongoose from "mongoose";

// Rate limiting (basic in-memory for demo, ideal would be Redis)
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REPORTS_PER_WINDOW = 5;

// We'll use a simple in-memory map for rate limiting in this serverless context (not perfect but OK for MVP)
// In production, use Vercel KV or similar.
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const timestamps = rateLimitMap.get(identifier) || [];

    // Filter out old timestamps
    const recentTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);

    if (recentTimestamps.length >= MAX_REPORTS_PER_WINDOW) {
        return false;
    }

    recentTimestamps.push(now);
    rateLimitMap.set(identifier, recentTimestamps);
    return true;
}

const AUTO_HIDE_THRESHOLD = 3;

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();

        const { targetType, targetId, reporterId, reason, description } = body;

        // Validation
        if (!targetType || !['review', 'guru'].includes(targetType)) {
            return NextResponse.json({ error: "Invalid target type" }, { status: 400 });
        }
        if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
            return NextResponse.json({ error: "Invalid target ID" }, { status: 400 });
        }
        if (!reporterId || !reason) {
            return NextResponse.json({ error: "Reporter ID and reason are required" }, { status: 400 });
        }

        // Rate Limiting
        const forwardedFor = request.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
        const rateLimitKey = `${reporterId}-${ip}`;

        if (!checkRateLimit(rateLimitKey)) {
            return NextResponse.json({ error: "Too many reports. Please try again later." }, { status: 429 });
        }

        // Check if report already exists
        const existingReport = await Report.findOne({
            targetType,
            targetId,
            reporterId
        });

        if (existingReport) {
            return NextResponse.json({ error: "You have already reported this content" }, { status: 400 });
        }

        // Create Report
        const newReport = await Report.create({
            targetType,
            targetId,
            reporterId,
            reason,
            description,
            ipAddress: ip,
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        // Auto-moderation logic
        // If it's a review and gets enough reports, auto-hide it.
        if (targetType === 'review') {
            const review = await Review.findById(targetId);
            if (review) {
                const newReportCount = (review.reportCount || 0) + 1;
                const shouldHide = newReportCount >= AUTO_HIDE_THRESHOLD;

                await Review.findByIdAndUpdate(targetId, {
                    $inc: { reportCount: 1 },
                    ...(shouldHide && { $set: { isHidden: true } })
                });
            }
        }
        // If it's a guru, we might flag it internally but not hide it automatically yet.

        return NextResponse.json({ success: true, report: newReport }, { status: 201 });

    } catch (error) {
        console.error("Error creating report:", error);
        return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
    }
}
