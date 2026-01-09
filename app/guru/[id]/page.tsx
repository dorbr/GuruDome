import { notFound } from 'next/navigation';
import { Guru, Review } from '@/lib/models';
import connectToDatabase from '@/lib/db';
import mongoose from 'mongoose';
import GuruContent from './GuruContent';

async function getGuruData(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    const guru = await Guru.findById(id);
    return guru ? JSON.parse(JSON.stringify(guru)) : null;
}

async function getReviews(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return [];
    await connectToDatabase();
    const reviews = await Review.find({ guruId: id, isHidden: { $ne: true } }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(reviews));
}

export default async function GuruPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const guru = await getGuruData(id);

    if (!guru) {
        notFound();
    }

    const reviews = await getReviews(id);

    return <GuruContent guru={guru} reviews={reviews} guruId={id} />;
}
