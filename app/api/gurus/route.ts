import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Guru } from "@/lib/models";
import { fetchInstagramImage } from "@/lib/instagram";
import { uploadImageFromUrl } from "@/lib/storage";
import { normalizeSocialUrl } from "@/lib/url-utils";
import { getInstagramUsername } from "@/lib/utils";

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");
        const category = searchParams.get("category");
        const minRating = searchParams.get("minRating");
        const maxRating = searchParams.get("maxRating");
        const sort = searchParams.get("sort") || "rating";

        // Build filter
        const filter: Record<string, unknown> = {};
        const conditions: Record<string, unknown>[] = [];

        // Text search
        if (query) {
            conditions.push(
                { name: { $regex: query, $options: "i" } },
                { socialUrl: { $regex: query, $options: "i" } },
                { "socialHandles.twitter": { $regex: query, $options: "i" } }
            );
            filter.$or = conditions;
        }

        // Category filter
        if (category) {
            filter.category = category;
        }

        // Rating filters
        if (minRating) {
            filter["ratingStats.averageRating"] = {
                ...((filter["ratingStats.averageRating"] as Record<string, unknown>) || {}),
                $gte: parseFloat(minRating)
            };
        }
        if (maxRating) {
            filter["ratingStats.averageRating"] = {
                ...((filter["ratingStats.averageRating"] as Record<string, unknown>) || {}),
                $lt: parseFloat(maxRating)
            };
        }

        // Build sort
        let sortOptions: Record<string, 1 | -1> = { "ratingStats.averageRating": -1 };
        switch (sort) {
            case "reviews":
                sortOptions = { "ratingStats.totalReviews": -1 };
                break;
            case "newest":
                sortOptions = { createdAt: -1 };
                break;
            case "name":
                sortOptions = { name: 1 };
                break;
            case "rating":
            default:
                sortOptions = { "ratingStats.averageRating": -1 };
        }

        const gurus = await Guru.find(filter).sort(sortOptions);
        return NextResponse.json(gurus);
    } catch (error) {
        console.error("Error fetching gurus:", error);
        return NextResponse.json({ error: "Failed to fetch gurus" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();

        // Basic validation
        if (!body.name || !body.socialUrl) {
            return NextResponse.json(
                { error: "Name and Social URL are required" },
                { status: 400 }
            );
        }

        // Normalize the URL
        const normalizedUrl = normalizeSocialUrl(body.socialUrl);
        // Update body with normalized URL so it's saved correctly
        body.socialUrl = normalizedUrl;

        // Block invalid Instagram URLs if we can't extract a username
        if (normalizedUrl.includes('instagram.com') || normalizedUrl.includes('instagr.am')) {
            const username = getInstagramUsername(normalizedUrl);
            if (!username) {
                return NextResponse.json(
                    { error: "Could not capture Instagram username from this URL" },
                    { status: 400 }
                );
            }
        }

        // Check for existing guru
        // Strategy:  
        // 1. Exact match on normalized URL (fastest)
        // 2. If it makes sense (Instagram), try to find by username to catch dirty data
        let existingGuru = await Guru.findOne({ socialUrl: normalizedUrl });

        if (!existingGuru) {
            // Check robustly for Instagram
            const igUsername = getInstagramUsername(normalizedUrl);
            if (igUsername) {
                // Regex to find any URL containing instagram.com/[username]
                // We use a regex that looks for instagram.com/username followed by end of string, slash, or question mark
                // escaping the username for safety
                const escapedUsername = igUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const pattern = `instagram\\.com\\/${escapedUsername}(\\/|\\?|$)`;

                existingGuru = await Guru.findOne({
                    socialUrl: { $regex: new RegExp(pattern, 'i') }
                });
            }
        }

        if (existingGuru) {
            return NextResponse.json(
                {
                    error: "Guru with this Social URL already exists",
                    existingGuruId: existingGuru._id
                },
                { status: 409 }
            );
        }

        // 1. Scrape profile image URL from Instagram
        let scrapedImageUrl = null;
        let firebaseImageUrl = null;

        try {
            if (body.socialUrl.includes('instagram.com')) {
                console.log("Attempting to scrape image for:", body.socialUrl);
                scrapedImageUrl = await fetchInstagramImage(body.socialUrl);
                console.log("Scraped URL result:", scrapedImageUrl);
            } else {
                console.log("Skipping image fetch for non-Instagram URL:", body.socialUrl);
            }

            if (scrapedImageUrl) {
                // 2. Upload to Firebase Storage
                console.log("Attempting to upload to Firebase...");
                // Generate a unique path: gurus/<timestamp>_<random>.jpg
                // or easier: gurus/<instagram_username>.jpg if we extracted it, but timestamp is safer for uniqueness/updates
                const filename = `gurus/${Date.now()}_profile.jpg`;
                firebaseImageUrl = await uploadImageFromUrl(scrapedImageUrl, filename);
                console.log("Firebase Upload URL:", firebaseImageUrl);
            } else {
                console.log("No image URL found during scraping.");
            }
        } catch (scrapeError) {
            console.warn("Failed to process profile image:", scrapeError);
            // Continue without image
        }

        const newGuru = await Guru.create({
            ...body,
            profileImage: firebaseImageUrl // Save the persistent Firebase URL (or null)
        });

        console.log("Created Guru with profileImage:", firebaseImageUrl);
        return NextResponse.json(newGuru, { status: 201 });
    } catch (error) {
        console.error("Error creating guru:", error);
        return NextResponse.json({ error: "Failed to create guru" }, { status: 500 });
    }
}
