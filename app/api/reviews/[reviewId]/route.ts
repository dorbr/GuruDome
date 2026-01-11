import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Review, Guru } from "@/lib/models";
import mongoose from "mongoose";
import { updateGuruMetrics } from "@/lib/guru";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    try {
        await connectToDatabase();
        const { reviewId } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId'); // Ensure the user owns the review

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return NextResponse.json({ error: "Invalid Review ID" }, { status: 400 });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        // Check ownership
        if (userId && review.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Decrement Guru stats
        const guruId = review.guruId;
        const guru = await Guru.findById(guruId);

        if (guru) {
            // Remove the review first
            await Review.findByIdAndDelete(reviewId);

            // Then recalculate all metrics
            await updateGuruMetrics(guruId.toString());
        } else {
            await Review.findByIdAndDelete(reviewId);
        }

        return NextResponse.json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    try {
        await connectToDatabase();
        const { reviewId } = await params;
        const body = await request.json();
        const { userId, rating, text, title, detailedRatings, isScam, isPurchased } = body;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return NextResponse.json({ error: "Invalid Review ID" }, { status: 400 });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        // Check ownership
        if (userId && review.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
        }

        const oldRating = review.rating;
        const guruId = review.guruId;
        const guru = await Guru.findById(guruId);

        // Update Guru Stats if rating changed
        if (guru && oldRating !== rating) {
            const currentTotal = guru.ratingStats?.totalReviews || 0;
            const currentAvg = guru.ratingStats?.averageRating || 0;
            const currentSum = currentAvg * currentTotal;

            // Remove old rating influence
            const sumMinusOld = currentSum - oldRating;
            // Add new rating influence
            const newSum = sumMinusOld + rating;
            // Total reviews count remains the same
            const newAvg = newSum / currentTotal;

            const oldRatingKey = `ratingStats.ratingDistribution.${oldRating}`;
            const newRatingKey = `ratingStats.ratingDistribution.${rating}`;

            await Guru.findByIdAndUpdate(guruId, {
                $set: {
                    "ratingStats.averageRating": newAvg,
                },
                $inc: {
                    [oldRatingKey]: -1,
                    [newRatingKey]: 1
                }
            });
        }

        // Update Review
        review.rating = rating;
        review.text = text;
        review.title = title;
        review.detailedRatings = detailedRatings;
        review.isScam = isScam;
        review.isPurchased = isPurchased;
        await review.save();

        return NextResponse.json(review);
    } catch (error) {
        console.error("Error updating review:", error);
        return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
    }
}
