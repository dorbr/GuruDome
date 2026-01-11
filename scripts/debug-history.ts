
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
    const { default: connectToDatabase } = await import('../lib/db');
    const { Guru, Review } = await import('../lib/models');
    const { updateGuruMetrics } = await import('../lib/guru');

    await connectToDatabase();

    // 1. Create a Test Guru
    const guru = await Guru.create({
        name: 'Test Guru History',
        socialUrl: 'https://test.com',
    });
    console.log('Created Guru:', guru._id);

    // 2. Add some "History" manually
    // History Entry 1: 1 Review, 5 stars. Date: 2 days ago.
    // History Entry 2: 2 Reviews, avg 4 stars (5 + 3). Date: Yesterday.
    // Current State: Supposed to be 2 reviews.

    const date1 = new Date(); date1.setDate(date1.getDate() - 2);
    const date2 = new Date(); date2.setDate(date2.getDate() - 1);

    guru.performanceHistory = [
        {
            date: date1,
            totalReviews: 1,
            averageRating: 5,
            trustworthiness: 5,
            valueForMoney: 5,
            authenticity: 5
        },
        {
            date: date2,
            totalReviews: 2,
            averageRating: 4, // (5 + 3) / 2 = 4
            trustworthiness: 4,
            valueForMoney: 4,
            authenticity: 4
        }
    ];
    await guru.save();

    // 3. Create the "Real" Reviews in DB so aggregation works
    // Review 1: 5 stars (Created 3 days ago)
    const review1 = await Review.create({
        userId: 'user1',
        guruId: guru._id,
        rating: 5,
        detailedRatings: { trustworthiness: 5, valueForMoney: 5, authenticity: 5 },
        createdAt: new Date(Date.now() - 3 * 86400000)
    });

    // Review 2: 3 stars (Created 1.5 days ago - after entry 1, before entry 2)
    const review2 = await Review.create({
        userId: 'user2',
        guruId: guru._id,
        rating: 3,
        detailedRatings: { trustworthiness: 3, valueForMoney: 3, authenticity: 3 },
        createdAt: new Date(Date.now() - 1.5 * 86400000)
    });

    // 4. Delete Review 2 (The 3 star one)
    // This should affect Entry 2.
    // Entry 2 should go from: Total 2, Avg 4
    // To: Total 1, Avg 5 (Since only Review 1 remains)
    // Entry 1 should be UNTOUCHED because it was before Review 2 existed.

    console.log('Deleting Review 2...');
    await Review.findByIdAndDelete(review2._id);

    console.log('Updating Metrics with context...');
    await updateGuruMetrics(guru._id.toString(), { deletedReview: review2 });

    // 5. Verify
    const updatedGuru = await Guru.findById(guru._id);
    const h = updatedGuru.performanceHistory;

    console.log('History Entry 1 (Should be unchanged):', h[0].totalReviews, h[0].averageRating);
    console.log('History Entry 2 (Should be updated):', h[1].totalReviews, h[1].averageRating);

    if (h[1].totalReviews === 1 && h[1].averageRating === 5) {
        console.log('SUCCESS: History updated correctly.');
    } else {
        console.log('FAIL: History not updated correctly.');
        console.log('Expected: Total 1, Avg 5');
        console.log('Actual:', h[1]);
    }

    // Cleanup
    await Guru.deleteOne({ _id: guru._id });
    await Review.deleteMany({ guruId: guru._id });
    process.exit();
}

run().catch(console.error);
