import React, { useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import { History, TrendingUp, Droplets, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const HistoricalAnalytics = ({ historicalData, lastYearData }) => {
    const stats = useMemo(() => {
        if (!historicalData || !historicalData.daily) return null;
        const daily = historicalData.daily;
        const lyDaily = lastYearData?.daily;

        // Calculate average max temp this month
        const avgMax = daily.temperature_2m_max.reduce((a, b) => a + b, 0) / daily.temperature_2m_max.length;
        const totalRain = daily.precipitation_sum.reduce((a, b) => a + b, 0);

        let comparisonText = "";
        let comparisonClass = "";
        let comparisonIcon = null;

        if (lyDaily) {
            const lyAvgMax = lyDaily.temperature_2m_max.reduce((a, b) => a + b, 0) / lyDaily.temperature_2m_max.length;
            const diff = avgMax - lyAvgMax;
            const absDiff = Math.abs(diff).toFixed(1);

            if (diff > 0.5) {
                comparisonText = `This period is ${absDiff}°C hotter than last year.`;
                comparisonClass = "text-orange-400";
                comparisonIcon = <ArrowUpRight size={18} />;
            } else if (diff < -0.5) {
                comparisonText = `This period is ${absDiff}°C cooler than last year.`;
                comparisonClass = "text-blue-400";
                comparisonIcon = <ArrowDownRight size={18} />;
            } else {
                comparisonText = "Temperatures are consistent with last year.";
                comparisonClass = "opacity-70";
            }
        }

        return { avgMax: avgMax.toFixed(1), totalRain: totalRain.toFixed(1), comparisonText, comparisonClass, comparisonIcon };
    }, [historicalData, lastYearData]);

    if (!stats) return null;

    // Simple SVG Line Chart Drawing
    const renderChart = () => {
        const data = historicalData.daily.temperature_2m_max;
        const width = 800;
        const height = 200;
        const padding = 20;

        const min = Math.min(...data) - 2;
        const max = Math.max(...data) + 2;
        const range = max - min;

        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
            const y = height - ((val - min) / range) * (height - padding * 2) - padding;
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 mt-4 overflow-visible">
                {/* Horizontal grid lines */}
                {[0, 0.5, 1].map((p, i) => (
                    <line
                        key={i}
                        x1={padding}
                        y1={padding + (height - padding * 2) * p}
                        x2={width - padding}
                        y2={padding + (height - padding * 2) * p}
                        stroke="currentColor"
                        strokeOpacity="0.1"
                        strokeWidth="1"
                    />
                ))}

                {/* The trend line */}
                <Motion.polyline
                    fill="none"
                    stroke="var(--accent-color)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Circles and Digits for points */}
                {data.map((val, i) => {
                    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
                    const y = height - ((val - min) / range) * (height - padding * 2) - padding;

                    // Show digits only for every 6th point to avoid clutter, plus the last point
                    const showDigit = i % 6 === 0 || i === data.length - 1;

                    return (
                        <g key={i}>
                            <circle cx={x} cy={y} r="3" fill="var(--accent-color)" />
                            {showDigit && (
                                <text
                                    x={x}
                                    y={y - 8}
                                    fontSize="10"
                                    textAnchor="middle"
                                    fill="currentColor"
                                    style={{ opacity: 0.8, fontWeight: 600 }}
                                >
                                    {Math.round(val)}°
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        );
    };

    return (
        <section className="animate-up" style={{ animationDelay: '0.6s' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <History /> Historical Analytics (30 Days)
            </h2>

            <div className="glass" style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                    <div className="flex flex-col gap-1">
                        <span className="label">Avg Max Temp</span>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={20} className="text-accent" style={{ color: 'var(--accent-color)' }} />
                            <span style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.avgMax}°C</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="label">Total Precipitation</span>
                        <div className="flex items-center gap-2">
                            <Droplets size={20} className="text-blue-400" />
                            <span style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalRain}mm</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 justify-center">
                        <div className={`flex items-center gap-2 ${stats.comparisonClass}`} style={{ fontWeight: 600 }}>
                            {stats.comparisonIcon} {stats.comparisonText}
                        </div>
                    </div>
                </div>

                <div className="chart-container" style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, fontSize: '0.8rem', opacity: 0.5 }}>Temp Trend (°C)</div>
                    {renderChart()}
                    <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.5, fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        <span>30 Days Ago</span>
                        <span>Today</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HistoricalAnalytics;
