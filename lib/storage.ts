import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads an image from a URL to Firebase Storage.
 * @param imageUrl The URL of the image to download (e.g. from Instagram).
 * @param destinationPath The path in Firebase Storage to save the file to.
 * @returns The public download URL of the uploaded file.
 */
export async function uploadImageFromUrl(imageUrl: string, destinationPath: string): Promise<string | null> {
    if (!storage) {
        console.error("Firebase Storage is not initialized");
        return null;
    }

    try {
        // 1. Fetch the image
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const blob = await response.blob();

        // 2. Upload to Firebase Storage
        const storageRef = ref(storage, destinationPath);
        const snapshot = await uploadBytes(storageRef, blob);

        // 3. Get download URL
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;

    } catch (error) {
        console.error("Error uploading image to Firebase:", error);
        return null;
    }
}
