import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Review, Guru } from "@/lib/models";
import mongoose from "mongoose";
import { detectFakeReview, generateGuruAnalysis } from "@/lib/ai";
import { refreshGuruAIAnalysis, updateGuruMetrics } from "@/lib/guru";

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

        // AI Detection
        const aiAnalysis = await detectFakeReview({ text, title, rating });

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
            aiAnalysis,
        });

        // Update Guru Stats & Performance Metrics
        await updateGuruMetrics(id);

        // Trigger AI Analysis in background
        try {
            console.log("Triggering AI analysis for guru:", id);
            // We don't await this to keep the response fast, or we await if we want to ensure it happens. 
            // Given the user feedback "it doesn't work", let's await it to be sure it runs, 
            // or at least catch errors properly. 
            // For Vercel, unawaited promises can be killed. 
            // Let's await it for now as a first step to ensure reliability.
            await refreshGuruAIAnalysis(id);
        } catch (error) {
            console.error("Failed to refresh AI analysis:", error);
            // Don't fail the request just because AI update failed
        }

        return NextResponse.json(newReview, { status: 201 });
    } catch (error) {
        console.error("Error creating review:", error);
        return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
    }
}
