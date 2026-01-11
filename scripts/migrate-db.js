
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

// Define minimal Schema for migration
const GuruSchema = new mongoose.Schema({
    instagramUrl: { type: String },
    socialUrl: { type: String },
}, { strict: false });

const Guru = mongoose.models.Guru || mongoose.model('Guru', GuruSchema);

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        console.log('Starting migration: instagramUrl -> socialUrl');

        // Drop the old index first to avoid duplicate key errors when unsetting
        try {
            await Guru.collection.dropIndex('instagramUrl_1');
            console.log('Dropped index: instagramUrl_1');
        } catch (err) {
            console.log('Index instagramUrl_1 not found or already dropped (ignoring).');
        }

        const gurus = await Guru.find({ instagramUrl: { $exists: true } });
        console.log(`Found ${gurus.length} gurus to migrate.`);

        let successCount = 0;
        let errorCount = 0;

        for (const guru of gurus) {
            try {
                // If socialUrl already exists (maybe from manual edit), skip or merge? 
                // We'll assume we just want to move the value if socialUrl is empty.
                if (!guru.socialUrl) {
                    guru.socialUrl = guru.instagramUrl;
                    guru.instagramUrl = undefined;

                    // We need to use $unset explicitly if we were using updateOne, 
                    // but save() with undefined should work if the schema allows it.
                    // However, to be safe and efficient, let's use updateOne.
                    await Guru.updateOne(
                        { _id: guru._id },
                        {
                            $set: { socialUrl: guru.instagramUrl },
                            $unset: { instagramUrl: "" }
                        }
                    );

                    process.stdout.write('.');
                    successCount++;
                } else {
                    console.log(`\nSkipping ${guru._id}: already has socialUrl`);
                }
            } catch (err) {
                console.error(`\nFailed to migrate guru ${guru._id}:`, err);
                errorCount++;
            }
        }

        console.log('\nMigration complete.');
        console.log(`Success: ${successCount}`);
        console.log(`Errors: ${errorCount}`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
        process.exit(0);
    }
}

migrate();
