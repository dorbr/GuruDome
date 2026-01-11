'use client';

import { Star, MessageSquare } from 'lucide-react';

interface BattleMetricsProps {
    label: string;
    value1: string | number;
    value2: string | number;
    icon?: React.ReactNode;
    betterIndex?: 0 | 1 | 2; // 0 = none, 1 = first is better, 2 = second is better
}

export default function BattleMetrics({ label, value1, value2, icon, betterIndex }: BattleMetricsProps) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 relative">
            <div className={`flex-1 text-center font-bold text-lg ${betterIndex === 1 ? 'text-green-500' : 'text-foreground'}`}>
                {value1}
            </div>

            <div className="flex flex-col items-center justify-center w-32 px-2 text-center">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
                {icon && <div className="text-primary/50">{icon}</div>}
            </div>

            <div className={`flex-1 text-center font-bold text-lg ${betterIndex === 2 ? 'text-green-500' : 'text-foreground'}`}>
                {value2}
            </div>

            {/* Visual Indicator of "Win" */}
            {betterIndex !== 0 && (
                <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full blur-[20px] opacity-20 ${betterIndex === 1 ? 'left-[20%]' : 'right-[20%]'}`} />
            )}
        </div>
    );
}
