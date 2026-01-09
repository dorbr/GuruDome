const fs = require('fs');

async function downloadInstagramHtml(url) {
    try {
        console.log(`Downloading: ${url}`);
        const cleanUrl = url.split('?')[0].replace(/\/$/, '');

        const response = await fetch(cleanUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });

        if (!response.ok) {
            console.error(`Failed: ${response.status}`);
            return;
        }

        const html = await response.text();
        fs.writeFileSync('debug_instagram.html', html);
        console.log('Saved to debug_instagram.html');

    } catch (error) {
        console.error("Error:", error);
    }
}

// Use the official Instagram account as a test case
downloadInstagramHtml('https://www.instagram.com/instagram/');
