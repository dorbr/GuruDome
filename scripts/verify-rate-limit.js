// Native fetch is available in Node 18+

// Configuration
const BASE_URL = 'http://localhost:3000'; // Adjust port if needed
const API_URL = `${BASE_URL}/api/reports`;
const REPORTER_ID = 'test-reporter-123';
const TARGET_ID = '507f1f77bcf86cd799439011'; // Mock ObjectId
const TARGET_TYPE = 'review';

async function submitReport(i) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'RateLimitTestScript'
            },
            body: JSON.stringify({
                targetId: TARGET_ID,
                targetType: TARGET_TYPE,
                reporterId: REPORTER_ID,
                reason: 'spam',
                description: `Test report ${i}`
            })
        });

        const data = await response.json();
        console.log(`Request ${i}: Status ${response.status} - ${JSON.stringify(data)}`);
        return response.status;
    } catch (error) {
        console.error(`Request ${i} Failed:`, error.message);
        return 500;
    }
}

async function runTest() {
    console.log('Starting Rate Limit Verification...');
    console.log('Note: This test requires the Next.js server to be running on localhost:3000');

    // We expect 5 successes, then failure.
    // Wait, the API uses in-memory store. If the server restarts, it resets.
    // Also, the rate limit key is `${reporterId}:${ip}`.
    // Since we are running from the same machine, IP is likely 127.0.0.1 or ::1.

    let successCount = 0;
    let blockedCount = 0;

    for (let i = 1; i <= 7; i++) {
        const status = await submitReport(i);
        if (status === 200) successCount++;
        if (status === 429) blockedCount++;

        // precise delay not strictly needed as rate limit is per hour, but good to be nice
        await new Promise(r => setTimeout(r, 200));
    }

    console.log('\nResults:');
    console.log(`Successful: ${successCount}`);
    console.log(`Blocked: ${blockedCount}`);

    if (successCount === 5 && blockedCount >= 1) {
        console.log('✅ Rate Limiting Verified: blocked after 5 requests.');
    } else {
        console.log('⚠️ Verification Warning: Results may vary depending on existing state or server availability.');
    }
}

runTest();
