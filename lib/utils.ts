import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getInstagramUsername(url: string): string | null {
    if (!url) return null;

    try {
        // Remove query parameters and trailing slashes
        const cleanUrl = url.split('?')[0].replace(/\/$/, '');

        // Handle typical Instagram URL formats
        const patterns = [
            /instagram\.com\/([a-zA-Z0-9_.]+)/,
            /instagr\.am\/([a-zA-Z0-9_.]+)/
        ];

        for (const pattern of patterns) {
            const match = cleanUrl.match(pattern);
            if (match && match[1] && match[1] !== 'p' && match[1] !== 'reel' && match[1] !== 'stories') {
                return match[1];
            }
        }

        return null;
    } catch (e) {
        return null;
    }
}
