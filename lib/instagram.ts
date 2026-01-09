export async function fetchInstagramImage(url: string): Promise<string | null> {
    try {
        // Extract username from URL
        // Expected formats: https://www.instagram.com/username/ or https://instagram.com/username
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split('/').filter(p => p);
        const username = parts[0];

        if (!username) {
            console.warn("Could not extract username from URL:", url);
            return null;
        }

        const apiKey = "uqGbGZu9bhgMAqGVFLePQvAX"; // In a real app, move this to env vars
        const apiUrl = new URL("https://www.searchapi.io/api/v1/search");
        apiUrl.searchParams.append("engine", "instagram_profile");
        apiUrl.searchParams.append("username", username);
        apiUrl.searchParams.append("api_key", apiKey);

        console.log(`Fetching Instagram profile for: ${username}`);

        const response = await fetch(apiUrl.toString());

        if (!response.ok) {
            console.warn(`SearchAPI failed: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();

        // Return HD avatar if available, otherwise regular avatar
        if (data.profile?.avatar_hd) {
            return data.profile.avatar_hd;
        }
        if (data.profile?.avatar) {
            return data.profile.avatar;
        }

        return null;
    } catch (error) {
        console.error("Error fetching form SearchAPI:", error);
        return null;
    }
}
