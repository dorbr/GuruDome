import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Guru, Review } from '@/lib/models';
import { getUserFromRequest, canAccessAdmin, isAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);

        if (!user) {
            return unauthorizedResponse();
        }

        if (!canAccessAdmin(user)) {
            return forbiddenResponse();
        }

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category');
        const sort = searchParams.get('sort') || 'createdAt';

        // Build filter
        const filter: Record<string, unknown> = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { instagramUrl: { $regex: search, $options: 'i' } },
            ];
        }

        if (category) {
            filter.category = category;
        }

        // Build sort
        let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
        switch (sort) {
            case 'name':
                sortOptions = { name: 1 };
                break;
            case 'rating':
                sortOptions = { 'ratingStats.averageRating': -1 };
                break;
            case 'reviews':
                sortOptions = { 'ratingStats.totalReviews': -1 };
                break;
        }

        const skip = (page - 1) * limit;

        const [gurus, total] = await Promise.all([
            Guru.find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .select('-__v')
                .lean(),
            Guru.countDocuments(filter),
        ]);

        return NextResponse.json({
            gurus,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching gurus:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);

        if (!user) {
            return unauthorizedResponse();
        }

        if (!canAccessAdmin(user)) {
            return forbiddenResponse();
        }

        const body = await request.json();
        const { guruId, updates } = body;

        if (!guruId) {
            return NextResponse.json({ error: 'Guru ID is required' }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(guruId)) {
            return NextResponse.json({ error: 'Invalid Guru ID' }, { status: 400 });
        }

        await connectToDatabase();

        const guru = await Guru.findByIdAndUpdate(
            guruId,
            { ...updates, updatedAt: new Date() },
            { new: true }
        );

        if (!guru) {
            return NextResponse.json({ error: 'Guru not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, guru });
    } catch (error) {
        console.error('Error updating guru:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);

        if (!user) {
            return unauthorizedResponse();
        }

        // Only admins can delete gurus
        if (!isAdmin(user)) {
            return forbiddenResponse('Only admins can delete gurus');
        }

        const { searchParams } = new URL(request.url);
        const guruId = searchParams.get('id');

        if (!guruId) {
            return NextResponse.json({ error: 'Guru ID is required' }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(guruId)) {
            return NextResponse.json({ error: 'Invalid Guru ID' }, { status: 400 });
        }

        await connectToDatabase();

        // Delete guru and all associated reviews
        const [guru] = await Promise.all([
            Guru.findByIdAndDelete(guruId),
            Review.deleteMany({ guruId }),
        ]);

        if (!guru) {
            return NextResponse.json({ error: 'Guru not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Guru and associated reviews deleted' });
    } catch (error) {
        console.error('Error deleting guru:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
