import React from 'react';
import { Sprout, Wind, Droplets, AlertTriangle, CloudRain, Thermometer } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const AgriInsights = ({ weather }) => {
    if (!weather || !weather.hourly) return null;

    const list = [];
    const currentHour = new Date().getHours();

    // 1. Irrigation Advice
    // Check next 24h rain probability
    let rainComing = false;
    for (let i = 0; i < 24; i++) {
        if (weather.hourly.precipitation_probability[currentHour + i] > 40) {
            rainComing = true;
            break;
        }
    }

    // Soil Moisture Analysis (0.3-0.4 is optimal for many crops, <0.2 is dry)
    // Note: Open-Meteo returns m³/m³
    const currentMoisture = weather.hourly.soil_moisture_3_to_9cm ? weather.hourly.soil_moisture_3_to_9cm[currentHour] : 0.25;

    if (currentMoisture < 0.2 && !rainComing) {
        list.push({
            type: 'irrigation',
            icon: <Droplets className="text-blue-500" size={24} />,
            title: 'Irrigation Needed',
            message: 'Soil moisture is low and no rain is expected soon. Best time to water crops.',
            color: 'from-blue-400/20 to-cyan-500/20'
        });
    } else if (rainComing) {
        list.push({
            type: 'skip-irrigation',
            icon: <CloudRain className="text-blue-400" size={24} />,
            title: 'Skip Irrigation',
            message: 'Rain is predicted in the next 24 hours. Save water and let nature do the work.',
            color: 'from-blue-600/20 to-indigo-600/20'
        });
    } else {
        list.push({
            type: 'optimal',
            icon: <Sprout className="text-green-500" size={24} />,
            title: 'Soil moisture optimal',
            message: 'Moisture levels are good. No immediate action required.',
            color: 'from-green-500/20 to-emerald-600/20'
        });
    }

    // 2. Pesticide Spraying (Wind Speed)
    // Ideal is < 10 km/h, Acceptable < 15-20 km/h, Avoid > 20 km/h
    const currentWind = weather.current.wind_speed_10m;

    if (currentWind > 15) {
        list.push({
            type: 'pesticide-avoid',
            icon: <Wind className="text-red-400" size={24} />,
            title: 'Avoid Spraying',
            message: `Wind speed is high (${currentWind} km/h). Spraying now will cause drift and waste chemicals.`,
            color: 'from-red-500/20 to-orange-500/20'
        });
    } else {
        list.push({
            type: 'pesticide-safe',
            icon: <Sprout className="text-emerald-500" size={24} />,
            title: 'Safe to Spray',
            message: `Winds are calm (${currentWind} km/h). Good conditions for applying nutrients or pesticides if needed.`,
            color: 'from-emerald-400/20 to-green-500/20'
        });
    }

    // 3. Frost Risk
    let minTempNext12h = 100;
    for (let i = 0; i < 12; i++) {
        const t = weather.hourly.temperature_2m[currentHour + i];
        if (t < minTempNext12h) minTempNext12h = t;
    }

    if (minTempNext12h <= 2) {
        list.push({
            type: 'frost',
            icon: <Thermometer className="text-cyan-300" size={24} />,
            title: 'Frost Warning',
            message: `Temperatures dropping to ${minTempNext12h}°C in next 12h. Protect sensitive crops.`,
            color: 'from-cyan-500/20 to-blue-500/20'
        });
    }

    const insights = list;

    if (insights.length === 0) return null;

    return (
        <div className="w-full mb-8 animate-up">
            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#22c55e' }}>
                <Sprout className="text-green-500" /> Agriculture Insights
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {insights.map((insight, idx) => (
                    <Motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-item"
                        style={{
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'start',
                            gap: '1rem',
                            borderLeft: '4px solid rgba(34, 197, 94, 0.5)', // Green accent for agri
                            background: `linear-gradient(to right, rgba(34, 197, 94, 0.05), transparent)`
                        }}
                    >
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }}>
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

export default AgriInsights;
