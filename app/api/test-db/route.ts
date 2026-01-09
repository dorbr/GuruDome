import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

export async function GET() {
    try {
        await connectToDatabase();
        return NextResponse.json({ status: 'success', message: 'Connected to MongoDB' });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: 'Failed to connect to MongoDB',
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
