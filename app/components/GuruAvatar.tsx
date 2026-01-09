'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GuruAvatarProps {
    name: string;
    imageUrl?: string; // Stored URL from DB
    instagramUrl?: string; // Kept for future potential fallback or other uses, though primarily we use imageUrl now
    className?: string;
}

export default function GuruAvatar({ name, imageUrl, className = "h-12 w-12" }: GuruAvatarProps) {
    const [imageError, setImageError] = useState(false);

    // We prioritize the stored imageUrl.
    // If it exists and hasn't errored, we show it.
    // Otherwise fallback to initial.

    return (
        <div className={`relative rounded-full overflow-hidden bg-primary/10 flex-shrink-0 border border-border/50 flex items-center justify-center ${className}`}>
            {imageUrl && !imageError ? (
                <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                    // Assuming scraped URLs might be external (Instagram CDN), so unoptimized is safer initially 
                    // or configure domains in next.config.mjs. For now unoptimized.
                    unoptimized
                />
            ) : (
                <div className="font-bold text-primary flex items-center justify-center h-full w-full" style={{ fontSize: '1.2em' }}>
                    {name.charAt(0).toUpperCase()}
                </div>
            )}
        </div>
    );
}
