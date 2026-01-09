
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

const GuruSchema = new mongoose.Schema({
    instagramUrl: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    profileImage: { type: String },
    bio: { type: String },
    category: { type: String },
}, { collection: 'gurus' });

const Guru = mongoose.models.Guru || mongoose.model('Guru', GuruSchema);

async function checkGurus() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const gurus = await Guru.find({}).limit(5);
    console.log(`Found ${gurus.length} gurus`);

    gurus.forEach(guru => {
        console.log(`Guru: ${guru.name}, ProfileImage: ${guru.profileImage}`);
    });

    await mongoose.disconnect();
}

checkGurus();
