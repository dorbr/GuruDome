import React from 'react';
import { Star } from 'lucide-react';

interface GuruPlaceholderCardProps {
    variant: 'expert' | 'scammer' | 'trending';
}

export default function GuruPlaceholderCard({ variant }: GuruPlaceholderCardProps) {
    const getColors = () => {
        switch (variant) {
            case 'expert':
                return {
                    border: 'border-amber-500/20',
                    glow: 'group-hover:shadow-amber-500/10',
                    gradient: 'from-amber-500/5',
                    icon: 'text-amber-500/20',
                    pulse: 'bg-amber-500/10'
                };
            case 'scammer':
                return {
                    border: 'border-red-500/20',
                    glow: 'group-hover:shadow-red-500/10',
                    gradient: 'from-red-500/5',
                    icon: 'text-red-500/20',
                    pulse: 'bg-red-500/10'
                };
            case 'trending':
                return {
                    border: 'border-indigo-500/20',
                    glow: 'group-hover:shadow-indigo-500/10',
                    gradient: 'from-indigo-500/5',
                    icon: 'text-indigo-500/20',
                    pulse: 'bg-indigo-500/10'
                };
        }
    };

    const colors = getColors();

    return (
        <div className={`glass-panel relative overflow-hidden rounded-xl border ${colors.border} shadow-md h-full flex flex-col`}>
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} via-transparent to-transparent opacity-50`} />

            <div className="p-6 relative z-10 flex flex-col flex-1 gap-4">
                <div className="flex items-center gap-4">
                    {/* Avatar Placeholder */}
                    <div className={`h-12 w-12 rounded-full ${colors.pulse} animate-pulse shrink-0`} />

                    <div className="flex-1 space-y-2">
                        {/* Name Placeholder */}
                        <div className={`h-5 w-3/4 rounded ${colors.pulse} animate-pulse`} />
                        {/* Category Placeholder */}
                        <div className={`h-3 w-1/3 rounded ${colors.pulse} animate-pulse opacity-60`} />
                    </div>
                </div>

                {/* Rating Placeholder */}
                <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className={`h-4 w-4 ${colors.icon}`} />
                        ))}
                    </div>
                    <div className={`h-4 w-8 rounded ml-2 ${colors.pulse} animate-pulse`} />
                </div>

                {/* Bio Placeholder lines */}
                <div className="space-y-2 mt-2">
                    <div className={`h-3 w-full rounded ${colors.pulse} animate-pulse opacity-50`} />
                    <div className={`h-3 w-5/6 rounded ${colors.pulse} animate-pulse opacity-50`} />
                    <div className={`h-3 w-4/6 rounded ${colors.pulse} animate-pulse opacity-50`} />
                </div>
            </div>
        </div>
    );
}
