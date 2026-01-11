import { NextResponse } from "next/server";
import { refreshGuruAIAnalysis } from "@/lib/guru";
import connectToDatabase from "@/lib/db";
import { Guru } from "@/lib/models";

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { guruId } = await request.json();

        if (!guruId) {
            return NextResponse.json({ error: "Guru ID is required" }, { status: 400 });
        }

        // Verify guru exists
        const guru = await Guru.findById(guruId);
        if (!guru) {
            return NextResponse.json({ error: "Guru not found" }, { status: 404 });
        }

        console.log(`Manual trigger for background check: ${guru.name} (${guruId})`);
        const result = await refreshGuruAIAnalysis(guruId, true);

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error("Manual trigger failed:", error);
        return NextResponse.json({ error: "Failed to run analysis", details: String(error) }, { status: 500 });
    }
}
