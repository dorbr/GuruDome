const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Simple env loader
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const firstEquals = line.indexOf('=');
        if (firstEquals !== -1) {
            const key = line.substring(0, firstEquals).trim();
            let value = line.substring(firstEquals + 1).trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            if (key) {
                process.env[key] = value;
            }
        }
    });
}

async function check() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found');
        }

        console.log("Connecting with URI length:", process.env.MONGODB_URI.length);

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // Check collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));

        // Define schema to query
        const BugReportSchema = new mongoose.Schema({}, { strict: false });
        const BugReport = mongoose.model('BugReport', BugReportSchema);

        const count = await BugReport.countDocuments();
        console.log("BugReport Count:", count);

        if (count > 0) {
            const bugs = await BugReport.find({});
            console.log("First bug:", JSON.stringify(bugs[0], null, 2));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

check();
