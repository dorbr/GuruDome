import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import { User } from '@/lib/models';

export type UserRole = 'user' | 'moderator' | 'admin';

export interface AuthUser {
    _id: string;
    firebaseUid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role: UserRole;
    isBanned: boolean;
}

/**
 * Get user from request by extracting Firebase UID from headers
 * In production, this should verify the Firebase ID token
 */
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
    try {
        // Get Firebase UID from custom header (set by frontend)
        const firebaseUid = request.headers.get('x-firebase-uid');

        if (!firebaseUid) {
            return null;
        }

        await connectToDatabase();

        const user = await User.findOne({ firebaseUid }).lean();

        if (!user) {
            return null;
        }

        return {
            _id: user._id.toString(),
            firebaseUid: user.firebaseUid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: user.role || 'user',
            isBanned: user.isBanned || false,
        };
    } catch (error) {
        console.error('Error getting user from request:', error);
        return null;
    }
}

/**
 * Check if user has one of the required roles
 */
export function hasRole(user: AuthUser | null, roles: UserRole[]): boolean {
    if (!user) return false;
    return roles.includes(user.role);
}

/**
 * Check if user is an admin
 */
export function isAdmin(user: AuthUser | null): boolean {
    return hasRole(user, ['admin']);
}

/**
 * Check if user is a moderator or admin
 */
export function isModerator(user: AuthUser | null): boolean {
    return hasRole(user, ['moderator', 'admin']);
}

/**
 * Check if user can access admin features
 */
export function canAccessAdmin(user: AuthUser | null): boolean {
    return isModerator(user);
}

/**
 * Authorization error response helper
 */
export function unauthorizedResponse(message = 'Unauthorized') {
    return new Response(JSON.stringify({ error: message }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * Forbidden error response helper
 */
export function forbiddenResponse(message = 'Forbidden: Insufficient permissions') {
    return new Response(JSON.stringify({ error: message }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
    });
}
