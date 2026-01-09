const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Try to parse .env.local manually
let uri = 'mongodb://localhost:27017/gurudome'; // Default
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/MONGODB_URI=(.*)/);
        if (match && match[1]) {
            uri = match[1].trim().replace(/["']/g, '');
        }
    }
} catch (e) {
    console.log('Could not read .env.local, using default URI');
}

async function run() {
    try {
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);

        // Access collection directly
        const reviews = await mongoose.connection.collection('reviews').find({}).sort({ createdAt: -1 }).limit(5).toArray();

        console.log('Latest 5 Reviews:');
        console.log(JSON.stringify(reviews, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
