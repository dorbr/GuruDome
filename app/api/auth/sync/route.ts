import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { User } from "@/lib/models";

export async function POST(req: Request) {
    try {
        const { uid, email, displayName, photoURL } = await req.json();

        if (!uid || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();

        // First, try to find user by firebaseUid
        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            // No user with this firebaseUid, check if email exists (user might have changed Firebase accounts)
            user = await User.findOne({ email });

            if (user) {
                // Update existing user's firebaseUid to the new one
                user.firebaseUid = uid;
                user.displayName = displayName;
                user.photoURL = photoURL;
                user.updatedAt = new Date();
                await user.save();
            } else {
                // Create new user
                user = await User.create({
                    firebaseUid: uid,
                    email,
                    displayName,
                    photoURL,
                    role: 'user',
                    isBanned: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        } else {
            // Update existing user
            user.displayName = displayName;
            user.photoURL = photoURL;
            user.updatedAt = new Date();
            await user.save();
        }

        // Check if user is banned
        if (user.isBanned) {
            return NextResponse.json({
                error: "Account banned",
                reason: user.bannedReason
            }, { status: 403 });
        }

        return NextResponse.json({
            user: {
                _id: user._id,
                firebaseUid: user.firebaseUid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: user.role || 'user',
                isBanned: user.isBanned || false,
                createdAt: user.createdAt,
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Error syncing user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

