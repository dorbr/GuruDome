import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { User } from '@/lib/models';
import { getUserFromRequest, canAccessAdmin, isAdmin, forbiddenResponse, unauthorizedResponse, UserRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getUserFromRequest(request);

        if (!currentUser) {
            return unauthorizedResponse();
        }

        if (!canAccessAdmin(currentUser)) {
            return forbiddenResponse();
        }

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') as UserRole | null;
        const banned = searchParams.get('banned');

        // Build filter
        const filter: Record<string, unknown> = {};

        if (search) {
            filter.$or = [
                { email: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } },
            ];
        }

        if (role) {
            filter.role = role;
        }

        if (banned === 'true') {
            filter.isBanned = true;
        } else if (banned === 'false') {
            filter.isBanned = { $ne: true };
        }

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-__v')
                .lean(),
            User.countDocuments(filter),
        ]);

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const currentUser = await getUserFromRequest(request);

        if (!currentUser) {
            return unauthorizedResponse();
        }

        if (!canAccessAdmin(currentUser)) {
            return forbiddenResponse();
        }

        const body = await request.json();
        const { userId, action, role, reason } = body;

        if (!userId || !action) {
            return NextResponse.json({ error: 'User ID and action are required' }, { status: 400 });
        }

        await connectToDatabase();

        const targetUser = await User.findById(userId);

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Only admins can change roles or manage other admins
        if (action === 'changeRole') {
            if (!isAdmin(currentUser)) {
                return forbiddenResponse('Only admins can change user roles');
            }

            if (!role || !['user', 'moderator', 'admin'].includes(role)) {
                return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
            }

            // Prevent demoting yourself
            if (targetUser.firebaseUid === currentUser.firebaseUid && role !== 'admin') {
                return NextResponse.json({ error: 'Cannot demote yourself' }, { status: 400 });
            }

            targetUser.role = role;
        } else if (action === 'ban') {
            // Can't ban admins unless you're an admin
            if (targetUser.role === 'admin' && !isAdmin(currentUser)) {
                return forbiddenResponse('Only admins can ban other admins');
            }

            // Can't ban yourself
            if (targetUser.firebaseUid === currentUser.firebaseUid) {
                return NextResponse.json({ error: 'Cannot ban yourself' }, { status: 400 });
            }

            targetUser.isBanned = true;
            targetUser.bannedAt = new Date();
            targetUser.bannedReason = reason || 'Banned by administrator';
        } else if (action === 'unban') {
            targetUser.isBanned = false;
            targetUser.bannedAt = undefined;
            targetUser.bannedReason = undefined;
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        targetUser.updatedAt = new Date();
        await targetUser.save();

        return NextResponse.json({
            success: true,
            user: {
                _id: targetUser._id,
                email: targetUser.email,
                displayName: targetUser.displayName,
                role: targetUser.role,
                isBanned: targetUser.isBanned,
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
