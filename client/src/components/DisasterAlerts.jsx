import React from 'react';
import { AlertTriangle, CloudRain, Flame, Snowflake, Tornado, ShieldCheck } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const DisasterAlerts = ({ weather }) => {
    // Only proceed if we have the necessary data
    if (!weather || !weather.hourly) return null;

    const alerts = [];
    const currentHour = new Date().getHours();

    // Scan next 24 hours for extreme conditions
    let maxWindGust = 0;
    let maxPrecipitation = 0;
    let maxTemp = -100;
    let minTemp = 100;

    for (let i = 0; i < 24; i++) {
        const gust = weather.hourly.wind_gusts_10m ? weather.hourly.wind_gusts_10m[currentHour + i] : 0;
        const precip = weather.hourly.precipitation ? weather.hourly.precipitation[currentHour + i] : 0;
        const temp = weather.hourly.temperature_2m[currentHour + i];

        if (gust > maxWindGust) maxWindGust = gust;
        if (precip > maxPrecipitation) maxPrecipitation = precip;
        if (temp > maxTemp) maxTemp = temp;
        if (temp < minTemp) minTemp = temp;
    }

    // 1. Storm / Cyclone Alert (Red > 90km/h, Yellow > 60km/h)
    if (maxWindGust > 90) {
        alerts.push({
            severity: 'extreme',
            type: 'cyclone',
            icon: <Tornado size={28} className="text-red-500" />,
            title: 'CYCLONE WARNING',
            message: `Experimental: Wind gusts reaching ${Math.round(maxWindGust)} km/h. High risk of damage. Stay indoors.`
        });
    } else if (maxWindGust > 60) {
        alerts.push({
            severity: 'severe',
            type: 'storm',
            icon: <Wind size={28} className="text-orange-500" />, // Using Wind icon, but Tornado import exists just in case
            title: 'Severe Storm Alert',
            message: `Strong wind gusts up to ${Math.round(maxWindGust)} km/h expected. Secure loose objects.`
        });
    }

    // 2. Flood / Heavy Rain (Red > 10mm/h, Yellow > 4mm/h consistently or simple check)
    if (maxPrecipitation > 10) {
        alerts.push({
            severity: 'extreme',
            type: 'flood',
            icon: <CloudRain size={28} className="text-blue-600" />,
            title: 'FLASH FLOOD WARNING',
            message: `Intense rainfall (${maxPrecipitation} mm/h) detected. Avoid low-lying areas and river banks.`
        });
    } else if (maxPrecipitation > 4) {
        alerts.push({
            severity: 'severe',
            type: 'heavy-rain',
            icon: <CloudRain size={28} className="text-blue-400" />,
            title: 'Heavy Rain Alert',
            message: `Significant rainfall expected (${maxPrecipitation} mm/h). Reduce speed while driving.`
        });
    }

    // 3. Heatwave (Red > 40°C, Yellow > 35°C)
    if (maxTemp > 40) {
        alerts.push({
            severity: 'extreme',
            type: 'heatwave',
            icon: <Flame size={28} className="text-red-600" />,
            title: 'EXTREME HEAT DANGER',
            message: `Temperatures soaring to ${Math.round(maxTemp)}°C. Heatstroke risk is critical. Stay hydrated.`
        });
    } else if (maxTemp > 35) {
        alerts.push({
            severity: 'moderate',
            type: 'heat',
            icon: <Flame size={28} className="text-orange-400" />,
            title: 'Heat Advisory',
            message: `High temperatures reaching ${Math.round(maxTemp)}°C. Limit outdoor activities.`
        });
    }

    // 4. Cold Wave (Red < -5°C, Yellow < 2°C)
    if (minTemp < -5) {
        alerts.push({
            severity: 'extreme',
            type: 'coldwave',
            icon: <Snowflake size={28} className="text-cyan-600" />,
            title: 'EXTREME COLD WARNING',
            message: `Freezing temperatures down to ${Math.round(minTemp)}°C. Hypothermia risk. Dress in layers.`
        });
    } else if (minTemp < 2) {
        // Only trigger if not already covered by similar checks (AgriInsights handles frost for farming, this handles general public)
        alerts.push({
            severity: 'moderate',
            type: 'cold',
            icon: <Snowflake size={28} className="text-cyan-400" />,
            title: 'Cold Weather Alert',
            message: `Low temperatures around ${Math.round(minTemp)}°C. Ensure heating and warm clothing.`
        });
    }

    if (alerts.length === 0) {
        // Optional: Return nothing if safe, or a "Safe" badge
        return null;
        /* return (
            <div className="glass p-4 mb-8 flex items-center gap-4 border-l-4 border-green-500 animate-up">
                <ShieldCheck className="text-green-500" size={28} />
                <div>
                    <h3 className="font-bold text-lg">No Active Warnings</h3>
                    <p className="opacity-80">Conditions are currently stable.</p>
                </div>
            </div>
        ); */
    }

    return (
        <div className="w-full mb-8 flex flex-col gap-4 animate-up">
            {alerts.map((alert, idx) => (
                <Motion.div
                    key={idx}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass"
                    style={{
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.2rem',
                        borderLeft: `5px solid ${alert.severity === 'extreme' ? '#ef4444' :
                            alert.severity === 'severe' ? '#f97316' :
                                '#eab308'
                            }`,
                        background: `linear-gradient(to right, ${alert.severity === 'extreme' ? 'rgba(239, 68, 68, 0.1)' :
                            alert.severity === 'severe' ? 'rgba(249, 115, 22, 0.1)' :
                                'rgba(234, 179, 8, 0.1)'
                            }, transparent)`
                    }}
                >
                    <div style={{
                        padding: '0.8rem',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        {alert.icon}
                    </div>
                    <div>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            marginBottom: '0.2rem',
                            color: alert.severity === 'extreme' ? '#f87171' : 'inherit',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {alert.title}
                        </h3>
                        <p style={{ opacity: 0.9, fontSize: '1rem', lineHeight: '1.4' }}>
                            {alert.message}
                        </p>
                    </div>
                </Motion.div>
            ))}
        </div>
    );
};

export default DisasterAlerts;
