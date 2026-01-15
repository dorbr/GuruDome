export function normalizeSocialUrl(url: string): string {
    if (!url) return url;

    try {
        let normalized = url.trim();

        // Ensure protocol
        if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
            normalized = 'https://' + normalized;
        }

        const urlObj = new URL(normalized);

        // Enforce HTTPS
        urlObj.protocol = 'https:';

        // Remove query parameters
        urlObj.search = '';
        // Remove hash
        urlObj.hash = '';

        // Remove trailing slash
        if (urlObj.pathname.endsWith('/')) {
            urlObj.pathname = urlObj.pathname.slice(0, -1);
        }

        // Hostname normalization (lowercase)
        urlObj.hostname = urlObj.hostname.toLowerCase();

        // Remove 'www.'
        if (urlObj.hostname.startsWith('www.')) {
            urlObj.hostname = urlObj.hostname.slice(4);
        }

        // Specific logic for Instagram
        if (urlObj.hostname.includes('instagram.com') || urlObj.hostname.includes('instagr.am')) {
            // Handle /stories/username/... or /stories/username
            if (urlObj.pathname.startsWith('/stories/')) {
                const parts = urlObj.pathname.split('/').filter(p => p);
                // /stories/username -> parts[1] is username
                if (parts.length >= 2) {
                    // Ignore 'highlights' as a username
                    if (parts[1] !== 'highlights') {
                        urlObj.pathname = '/' + parts[1];
                    }
                }
            }

            // Handle /username/
            // Clean up any extra segments if it's just a profile link usually it is /username
            // If it is /p/ or /reel/ we might want to keep it or fail, but the prompt implies user profile URLs.
            // Let's assume we want to extract the username if possible.

            // If path is /username/tagged or /username/reels, strip the extra
            const parts = urlObj.pathname.split('/').filter(p => p);
            if (parts.length > 1) {
                // Check effectively forbidden first segments
                const firstSegment = parts[0];
                if (['p', 'reel', 'reels', 'tv', 'explore', 'stories'].includes(firstSegment)) {
                    // It's a post, not a profile. We probably can't normalize this to a profile URL easily without scraping.
                    // But we can still strip params.
                } else {
                    // Assume first segment is username
                    urlObj.pathname = '/' + firstSegment;
                }
            }
        }

        // Specific logic for TikTok
        if (urlObj.hostname.includes('tiktok.com')) {
            // TikTok often has /@username
            // strip anything after the username
            const parts = urlObj.pathname.split('/').filter(p => p);
            if (parts.length >= 1) {
                if (parts[0].startsWith('@')) {
                    urlObj.pathname = '/' + parts[0];
                } else if (parts[0] === 't') {
                    // shortened url, can't normalize without resolving
                }
            }
        }

        return urlObj.toString();
    } catch (e) {
        // If invalid URL, return original trimmed
        return url.trim();
    }
}
