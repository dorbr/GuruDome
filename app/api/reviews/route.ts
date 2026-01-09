import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Review, Guru } from "@/lib/models";

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Ensure Guru model is registered for population
        // (Accessing Guru here ensures the model is initialized if not already)
        const _ = Guru;

        const reviews = await Review.find({ userId, isHidden: { $ne: true } })
            .populate('guruId', 'name profileImage instagramUrl')
            .sort({ createdAt: -1 });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}
