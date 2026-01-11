
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

// Define minimal Schema 
const GuruSchema = new mongoose.Schema({
    instagramUrl: { type: String },
    socialUrl: { type: String },
    name: { type: String },
}, { strict: false });

const Guru = mongoose.models.Guru || mongoose.model('Guru', GuruSchema);

async function checkData() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        const gurus = await Guru.find({});
        console.log(`Found ${gurus.length} gurus.`);

        gurus.forEach(g => {
            console.log(`ID: ${g._id} | Name: ${g.name}`);
            console.log(`   instagramUrl: ${g.instagramUrl}`);
            console.log(`   socialUrl: ${g.socialUrl}`);
            console.log('-------------------');
        });

    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkData();
