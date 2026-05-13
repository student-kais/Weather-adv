import React, { useMemo } from 'react';
import { Sparkles, CloudRain, Thermometer, TrendingDown, AlertTriangle, Flame } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const SmartInsights = ({ weather }) => {
    const insights = useMemo(() => {
        if (!weather || !weather.hourly || !weather.daily) return [];

        const list = [];
        const hourly = weather.hourly;
        const currentHourIndex = hourly.time.findIndex(t => new Date(t) >= new Date());

        // Safety check if data is old or time not found
        if (currentHourIndex === -1) return [];

        // 1. Rain Prediction (Next 12 hours)
        let rainStart = -1;
        let rainEnd = -1;
        let maxProb = 0;

        for (let i = currentHourIndex; i < currentHourIndex + 12; i++) {
            if (!hourly.precipitation_probability[i]) continue;

            const prob = hourly.precipitation_probability[i];
            if (prob >= 50) {
                if (rainStart === -1) rainStart = i;
                rainEnd = i;
                if (prob > maxProb) maxProb = prob;
            } else if (rainStart !== -1) {
                break; // Stop at first break in rain
            }
        }

        if (rainStart !== -1) {
            // Format: "3 PM" instead of "3:00 PM" if minutes are 0, but simple LocaleTimeString is fine
            // Formatting to "3-5 PM" style
            const formatSimple = (idx) => {
                const date = new Date(hourly.time[idx]);
                let h = date.getHours();
                const ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12;
                h = h ? h : 12;
                return `${h} ${ampm}`;
            };

            list.push({
                type: 'rain',
                icon: <CloudRain className="text-blue-400" size={24} />,
                title: 'High Chance of Rain',
                message: `Expect rain between ${formatSimple(rainStart)} and ${formatSimple(rainEnd)}. (${maxProb}% chance)`,
                color: 'from-blue-500/20 to-blue-600/20'
            });
        }

        // 2. Sudden Temperature Drop (Next 12 hours)
        const currentTemp = hourly.temperature_2m[currentHourIndex];
        let minTemp = currentTemp;

        for (let i = currentHourIndex; i < currentHourIndex + 12; i++) {
            if (hourly.temperature_2m[i] < minTemp) {
                minTemp = hourly.temperature_2m[i];
            }
        }

        if (currentTemp - minTemp >= 5) {
            list.push({
                type: 'temp-drop',
                icon: <TrendingDown className="text-cyan-400" size={24} />,
                title: 'Temperature Drop',
                message: `Significant drop expected. Temp will fall to ${Math.round(minTemp)}°C by tonight.`,
                color: 'from-cyan-500/20 to-blue-500/20'
            });
        }

        // 3. Heatwave Conditions (Next 48 hours / 2 days)
        const dailyMax = weather.daily.temperature_2m_max;
        const heatwaveThreshold = 35; // Celsius
        let heatwaveDetected = false;

        // Check today and tomorrow
        if (dailyMax[0] >= heatwaveThreshold || dailyMax[1] >= heatwaveThreshold) {
            heatwaveDetected = true;
        }

        if (heatwaveDetected) {
            list.push({
                type: 'heatwave',
                icon: <Flame className="text-orange-500" size={24} />,
                title: 'Heatwave Alert',
                message: 'Heatwave conditions likely in the next 48 hours. Stay hydrated.',
                color: 'from-orange-500/20 to-red-600/20'
            });
        }

        // 4. UV High Alert (If UV Index > 8)
        const todayUV = weather.daily.uv_index_max[0];
        if (todayUV >= 8) {
            list.push({
                type: 'uv',
                icon: <AlertTriangle className="text-yellow-500" size={24} />,
                title: 'Extreme UV Index',
                message: `UV Index is quiet high (${todayUV}). Wear sunscreen and protection.`,
                color: 'from-yellow-500/20 to-orange-500/20'
            });
        }

        return list;
    }, [weather]);

    if (insights.length === 0) return null;

    return (
        <div className="w-full mb-8 animate-up">
            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Sparkles className="text-yellow-400" /> Smart Insights
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {insights.map((insight, idx) => (
                    <Motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass"
                        style={{
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'start',
                            gap: '1rem',
                            borderLeft: '4px solid rgba(255,255,255,0.3)',
                            background: `linear-gradient(to right, ${insight.type === 'heatwave' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)'}, transparent)`
                        }}
                    >
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)' }}>
                            {insight.icon}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.3rem' }}>{insight.title}</h3>
                            <p style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: '1.4' }}>{insight.message}</p>
                        </div>
                    </Motion.div>
                ))}
            </div>
        </div>
    );
};

export default SmartInsights;
