
const apiKey = "uqGbGZu9bhgMAqGVFLePQvAX";

async function fetchInstagramImage(url) {
    try {
        console.log(`Fetching: ${url}`);
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split('/').filter(p => p);
        const username = parts[0];

        if (!username) {
            console.warn("Could not extract username from URL:", url);
            return null;
        }

        const apiUrl = new URL("https://www.searchapi.io/api/v1/search");
        apiUrl.searchParams.append("engine", "instagram_profile");
        apiUrl.searchParams.append("username", username);
        apiUrl.searchParams.append("api_key", apiKey);

        console.log(`Calling SearchAPI for: ${username}`);

        const response = await fetch(apiUrl.toString());

        if (!response.ok) {
            console.warn(`SearchAPI failed: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();

        if (data.profile?.avatar_hd) {
            console.log(`Found image (HD): ${data.profile.avatar_hd}`);
            return data.profile.avatar_hd;
        }
        if (data.profile?.avatar) {
            console.log(`Found image (Regular): ${data.profile.avatar}`);
            return data.profile.avatar;
        }

        console.log("No avatar found in response");
        return null;
    } catch (error) {
        console.error("Error fetching form SearchAPI:", error);
        return null;
    }
}

// Test with a known public profile
fetchInstagramImage('https://www.instagram.com/cristiano/');
