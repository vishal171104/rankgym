"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DailyLog } from "@/lib/storage";

interface ProgressChartProps {
    data: DailyLog[];
}

export function ProgressChart({ data }: ProgressChartProps) {
    // Format data for Recharts
    const chartData = data.map(log => ({
        date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: log.volume,
        soreness: log.soreness * 1000 // Scale up for visibility if needed, or just use separate axis
    })).slice(-10); // Last 10 sessions

    if (chartData.length === 0) {
        return <div className="h-40 flex items-center justify-center text-muted-foreground">No data yet</div>;
    }

    return (
        <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="volume" 
                        stroke="#8b5cf6" 
                        fillOpacity={1} 
                        fill="url(#colorVolume)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
