import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Review, Guru } from "@/lib/models";
import mongoose from "mongoose";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid Guru ID" }, { status: 400 });
        }

        const reviews = await Review.find({ guruId: id, isHidden: { $ne: true } }).sort({ createdAt: -1 });
        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const body = await request.json();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid Guru ID" }, { status: 400 });
        }

        // TODO: Verify Firebase Token here for auth validation
        // const authHeader = request.headers.get('Authorization');
        // ...

        const { userId, rating, text, title, detailedRatings, isScam, isPurchased } = body;

        if (!userId || !rating) {
            return NextResponse.json(
                { error: "User ID and Rating are required" },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Rating must be between 1 and 5" },
                { status: 400 }
            );
        }

        // Check if guru exists
        const guru = await Guru.findById(id);
        if (!guru) {
            return NextResponse.json({ error: "Guru not found" }, { status: 404 });
        }

        // Create Review
        const newReview = await Review.create({
            guruId: id,
            userId,
            rating,
            text,
            title,
            detailedRatings,
            isScam,
            isPurchased,
        });

        // Update Guru Stats
        const currentTotal = guru.ratingStats.totalReviews || 0;
        const currentAvg = guru.ratingStats.averageRating || 0;

        const newTotal = currentTotal + 1;
        const newAvg = ((currentAvg * currentTotal) + rating) / newTotal;

        const ratingKey = `ratingStats.ratingDistribution.${rating}`;

        await Guru.findByIdAndUpdate(id, {
            $set: {
                "ratingStats.averageRating": newAvg,
                "ratingStats.totalReviews": newTotal
            },
            $inc: { [ratingKey]: 1 }
        });

        return NextResponse.json(newReview, { status: 201 });
    } catch (error) {
        console.error("Error creating review:", error);
        return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
    }
}
