'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GuruAvatarProps {
    name: string;
    imageUrl?: string; // Stored URL from DB
    socialUrl?: string; // Kept for future potential fallback
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function GuruAvatar({ name, imageUrl, className, size = 'md' }: GuruAvatarProps) {
    const [imageError, setImageError] = useState(false);

    const sizeClasses = {
        sm: 'h-8 w-8 text-xs',
        md: 'h-12 w-12 text-base',
        lg: 'h-16 w-16 text-xl',
        xl: 'h-24 w-24 text-3xl md:h-32 md:w-32 md:text-5xl',
    };

    const finalClassName = className || sizeClasses[size];

    return (
        <div className={`relative rounded-full overflow-hidden bg-primary/10 flex-shrink-0 border border-border/50 flex items-center justify-center ${finalClassName}`}>
            {/* {imageUrl && !imageError ? (
                <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                    unoptimized
                />
            ) : ( */}
            <div className="font-bold text-primary flex items-center justify-center h-full w-full" style={{ fontSize: '1.2em' }}>
                {name.charAt(0).toUpperCase()}
            </div>
            {/* )} */}
        </div>
    );
}
