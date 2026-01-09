const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf-8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^"(.*)"$/, '$1'); // Remove quotes if present
                process.env[key] = value;
            }
        });
        console.log('Loaded .env.local');
    } else {
        console.warn('.env.local not found');
    }
} catch (e) {
    console.error('Error loading .env.local', e);
}

const GuruSchema = new mongoose.Schema({
    instagramUrl: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    profileImage: { type: String },
    bio: { type: String },
    category: { type: String },
    socialHandles: {
        twitter: { type: String },
        youtube: { type: String },
        tiktok: { type: String },
        website: { type: String },
    },
    ratingStats: {
        averageRating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
    },
});

const Guru = mongoose.models.Guru || mongoose.model('Guru', GuruSchema);

async function seed() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is not defined in .env.local');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const gurus = [
        {
            name: "Dr. Success",
            instagramUrl: "https://instagram.com/drsuccess_test",
            bio: "Helping you achieve financial freedom through legitimate means.",
            category: "Finance",
            ratingStats: { averageRating: 5.0, totalReviews: 120 },
            profileImage: "https://randomuser.me/api/portraits/men/1.jpg"
        },
        {
            name: "Crypto King",
            instagramUrl: "https://instagram.com/cryptoking_test",
            bio: "Top tier signals and analysis.",
            category: "Crypto",
            ratingStats: { averageRating: 4.8, totalReviews: 85 },
            profileImage: "https://randomuser.me/api/portraits/men/2.jpg"
        },
        {
            name: "Scammy Sam",
            instagramUrl: "https://instagram.com/scammysam_test",
            bio: "Send me 1 ETH and I send 2 back.",
            category: "Crypto",
            ratingStats: { averageRating: 1.2, totalReviews: 50 },
            profileImage: "https://randomuser.me/api/portraits/men/3.jpg"
        },
        {
            name: "Fake Guru",
            instagramUrl: "https://instagram.com/fakeguru_test",
            bio: "I sell courses that don't exist.",
            category: "Business",
            ratingStats: { averageRating: 2.1, totalReviews: 30 },
            profileImage: "https://randomuser.me/api/portraits/men/4.jpg"
        }
    ];

    for (const guruData of gurus) {
        // Upsert to avoid duplicates if run multiple times
        await Guru.findOneAndUpdate(
            { instagramUrl: guruData.instagramUrl },
            guruData,
            { upsert: true, new: true }
        );
        console.log(`Upserted: ${guruData.name}`);
    }

    console.log('Seeding complete');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
