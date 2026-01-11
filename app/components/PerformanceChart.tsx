'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { useLanguage } from './LanguageProvider';

interface PerformanceHistoryItem {
    date: Date;
    trustworthiness: number;
    valueForMoney: number;
    authenticity: number;
}

interface PerformanceChartProps {
    data: PerformanceHistoryItem[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover/95 backdrop-blur-md border rounded-xl p-4 shadow-xl ring-1 ring-border/50">
                <p className="font-semibold mb-2 text-popover-foreground">{label}</p>
                <div className="space-y-1.5">
                    {payload.map((p: any) => (
                        <div key={p.name} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                            <span className="text-muted-foreground">{p.name}:</span>
                            <span className="font-bold text-foreground">{Number(p.value).toFixed(1)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export default function PerformanceChart({ data }: PerformanceChartProps) {
    const { t } = useLanguage();

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 border rounded-xl bg-muted/20 border-dashed text-muted-foreground">
                <p>{t.noDataYet || 'Not enough data for history chart.'}</p>
            </div>
        );
    }

    // Format dates and ensure numbers
    const chartData = data.map(item => ({
        ...item,
        formattedDate: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        trustworthiness: Number(item.trustworthiness?.toFixed(1) || 0),
        valueForMoney: Number(item.valueForMoney?.toFixed(1) || 0),
        authenticity: Number(item.authenticity?.toFixed(1) || 0),
    }));

    return (
        <div className="w-full h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{
                        top: 10,
                        right: 0,
                        left: -40, // Negative left margin in Recharts to align Y-axis with container edge
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorTrust" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAuth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis
                        dataKey="formattedDate"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                    />
                    <YAxis
                        domain={[0, 5]}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.toFixed(0)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        iconType="line"
                        wrapperStyle={{ paddingTop: '20px', textAlign: 'center' }}
                        align="center"
                    />
                    <Area
                        type="monotone"
                        dataKey="trustworthiness"
                        name={t.trustworthiness || 'Trustworthiness'}
                        stroke="#22c55e"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorTrust)"
                    />
                    <Area
                        type="monotone"
                        dataKey="valueForMoney"
                        name={t.valueForMoney || 'Value for Money'}
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                    />
                    <Area
                        type="monotone"
                        dataKey="authenticity"
                        name={t.authenticity || 'Authenticity'}
                        stroke="#6366f1"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorAuth)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
