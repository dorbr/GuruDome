import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { BugReport } from "@/lib/models";

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();

        const { reporterId, description, pageUrl, userAgent, screenshotUrl } = body;

        if (!description) {
            return NextResponse.json(
                { error: "Description is required" },
                { status: 400 }
            );
        }

        const newReport = await BugReport.create({
            reporterId,
            description,
            pageUrl,
            userAgent,
            screenshotUrl
        });

        return NextResponse.json({
            success: true,
            report: newReport
        }, { status: 201 });

    } catch (error) {
        console.error("Error submitting bug report:", error);
        return NextResponse.json({ error: "Failed to submit bug report" }, { status: 500 });
    }
}
