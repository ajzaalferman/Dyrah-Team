'use client';

import { useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AttendanceTrend {
    date: string;
    present: number;
    late: number;
}

export default function AttendanceChart({ data }: { data: AttendanceTrend[] }) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Format date for display (e.g., "Jan 19")
    const formattedData = data.map(item => ({
        ...item,
        displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    // Every 7 days should take up 100% of the visible container width
    const chartWidthPercent = (data.length / 7) * 100;

    // Scroll to the end on mount to show the most recent 7 days
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, [data]);

    return (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Attendance Trend (Last 30 Days)</h3>

            <div style={{ display: 'flex', height: '350px', position: 'relative' }}>
                {/* Fixed Y-Axis */}
                <div style={{ width: '40px', height: '100%', flexShrink: 0, background: 'var(--color-surface)', zIndex: 10 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formattedData} margin={{ top: 5, right: 0, left: 10, bottom: 40 }}>
                            <YAxis
                                stroke="var(--color-text-muted)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                                width={30}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Scrollable Chart Content */}
                <div
                    ref={scrollContainerRef}
                    style={{
                        flex: 1,
                        overflowX: 'auto',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--color-border) transparent'
                    }}
                >
                    <div style={{ width: `${chartWidthPercent}%`, minWidth: '100%', height: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={formattedData}
                                margin={{ top: 5, right: 30, left: 0, bottom: 40 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis
                                    dataKey="displayDate"
                                    stroke="var(--color-text-muted)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    height={30}
                                    dy={10}
                                />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        boxShadow: 'var(--shadow-md)'
                                    }}
                                />
                                <Legend verticalAlign="top" height={36} />
                                <Line
                                    type="monotone"
                                    dataKey="present"
                                    name="Present"
                                    stroke="var(--color-success)"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: 'var(--color-success)', strokeWidth: 2, stroke: 'var(--color-surface)' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    animationDuration={1500}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="late"
                                    name="Late"
                                    stroke="var(--color-warning)"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: 'var(--color-warning)', strokeWidth: 2, stroke: 'var(--color-surface)' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '1rem', textAlign: 'center' }}>
                Tip: Scroll horizontally to view previous days
            </p>
        </div>
    );
}
