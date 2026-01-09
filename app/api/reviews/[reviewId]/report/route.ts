import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Review, ReviewReport } from "@/lib/models";
import mongoose from "mongoose";

const AUTO_HIDE_THRESHOLD = 3; // Auto-hide reviews with this many reports

export async function POST(
    request: Request,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    try {
        await connectToDatabase();
        const { reviewId } = await params;
        const body = await request.json();

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return NextResponse.json({ error: "Invalid Review ID" }, { status: 400 });
        }

        const { reporterId, reason, description } = body;

        if (!reporterId || !reason) {
            return NextResponse.json(
                { error: "Reporter ID and reason are required" },
                { status: 400 }
            );
        }

        // Check if review exists
        const review = await Review.findById(reviewId);
        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        // Check if user already reported this review
        const existingReport = await ReviewReport.findOne({
            reviewId,
            reporterId
        });

        if (existingReport) {
            return NextResponse.json(
                { error: "You have already reported this review" },
                { status: 400 }
            );
        }

        // Create the report
        const newReport = await ReviewReport.create({
            reviewId,
            reporterId,
            reason,
            description
        });

        // Increment report count and check threshold
        const newReportCount = (review.reportCount || 0) + 1;
        const shouldHide = newReportCount >= AUTO_HIDE_THRESHOLD;

        await Review.findByIdAndUpdate(reviewId, {
            $inc: { reportCount: 1 },
            ...(shouldHide && { $set: { isHidden: true } })
        });

        return NextResponse.json({
            success: true,
            report: newReport,
            autoHidden: shouldHide
        }, { status: 201 });
    } catch (error) {
        console.error("Error reporting review:", error);
        return NextResponse.json({ error: "Failed to report review" }, { status: 500 });
    }
}
