import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

export { }; // Make it a module

async function main() {
    // Dynamic imports to ensure env vars are loaded first
    const { default: connectToDatabase } = await import("../lib/db");
    const { Guru } = await import("../lib/models");
    const { refreshGuruAIAnalysis } = await import("../lib/guru");

    console.log("Connecting to DB...");
    await connectToDatabase();

    // Find a guru with reviews
    const guru = await Guru.findOne({ 'ratingStats.totalReviews': { $gt: 0 } });

    if (!guru) {
        console.log("No guru with reviews found.");
        return;
    }

    console.log(`Testing analysis for Guru: ${guru.name} (${guru._id})`);

    try {
        const result = await refreshGuruAIAnalysis(guru._id.toString());
        console.log("Analysis Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Analysis Failed:", error);
    }

    process.exit(0);
}

main();
