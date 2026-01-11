import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Guru } from "@/lib/models";
import mongoose from "mongoose";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: "Invalid Guru ID" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const guru = await Guru.findById(id);

        if (!guru) {
            return NextResponse.json(
                { error: "Guru not found" },
                { status: 404 }
            );
        }

        // Fetch recent reviews for this guru (limit 50 for performance/relevance)
        // We need to dynamic import Review to avoid circular deps if they exist, or just import at top if safe.
        // Assuming Review is exported from @/lib/models
        const { Review } = await import("@/lib/models");
        const reviews = await Review.find({ guruId: id, isHidden: { $ne: true } })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        // Return in the format expected by the client: { guru: ..., reviews: ... }
        return NextResponse.json({ guru, reviews });
    } catch (error) {
        console.error("Error fetching guru:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
