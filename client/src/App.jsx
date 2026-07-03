import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  Wind, Droplets, Activity, Sun, Sunrise, Sunset,
  Thermometer, Clock, Calendar, CloudSun, Sprout,
  Star, Volume2, Bookmark, Map as MapIcon, Info,
  Cloud, CloudRain, CloudLightning, CloudSnow, Moon
} from 'lucide-react';
import SearchBar from './components/SearchBar';
import ThemeToggle from './components/ThemeToggle';
import SmartInsights from './components/SmartInsights';
import AgriInsights from './components/AgriInsights';
import DisasterAlerts from './components/DisasterAlerts';
import HistoricalAnalytics from './components/HistoricalAnalytics';
import SplashScreen from './components/SplashScreen';
import './index.css';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [location, setLocation] = useState('Detecting...');
  const [bgClass, setBgClass] = useState('neutral');
  const [isFarmerMode, setIsFarmerMode] = useState(false);
  const [historicalData, setHistoricalData] = useState(null);
  const [lastYearData, setLastYearData] = useState(null);
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites')) || []);
  const [inspectedHour, setInspectedHour] = useState(0);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchWeather = useCallback(async (lat, lon, name) => {
    const updateBg = (code, isDay, temp) => {
      if (code >= 51 && code <= 69) { setBgClass('rainy'); return; }
      if (code >= 71 && code <= 79) { setBgClass('snowy'); return; }
      if (temp >= 30) setBgClass('hot');
      else if (temp >= 20) setBgClass('warm');
      else if (temp >= 10) setBgClass('cool');
      else setBgClass('cold');
      if (!isDay && temp < 25) setBgClass('clear-night');
    };

    try {
      if (!name) {
        const geoRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        name = geoRes.data.address.city || geoRes.data.address.town || geoRes.data.address.village || 'Your Location';
      }

      const formatDateStr = (d) => d.toISOString().split('T')[0];
      const now = new Date();
      const thirtyAgo = new Date(); thirtyAgo.setDate(now.getDate() - 31);
      const yesterday = new Date(); yesterday.setDate(now.getDate() - 1);
      const lyStart = new Date(thirtyAgo); lyStart.setFullYear(lyStart.getFullYear() - 1);
      const lyEnd = new Date(yesterday); lyEnd.setFullYear(lyEnd.getFullYear() - 1);

      const [weatherRes, aqiRes, histRes, lyHistRes] = await Promise.all([
        axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code,soil_moisture_3_to_9cm,precipitation,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto&forecast_days=14`),
        axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5`),
        axios.get(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${formatDateStr(thirtyAgo)}&end_date=${formatDateStr(yesterday)}&daily=temperature_2m_max,precipitation_sum&timezone=auto`),
        axios.get(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${formatDateStr(lyStart)}&end_date=${formatDateStr(lyEnd)}&daily=temperature_2m_max&timezone=auto`)
      ]);

      setLocation(name);
      
      // Save to backend MongoDB history (fire and forget)
      const cityName = name.split(',')[0];
      const countryName = name.split(',')[1]?.trim() || '';
      axios.post('http://localhost:5000/api/history', {
          name: cityName,
          country: countryName,
          lat: lat,
          lon: lon
      }).catch(err => console.log('Backend history save skipped'));
      setWeather(weatherRes.data);
      setAqi(aqiRes.data);
      setHistoricalData(histRes.data);
      setLastYearData(lyHistRes.data);
      setInspectedHour(0);
      updateBg(weatherRes.data.current.weather_code, weatherRes.data.current.is_day, weatherRes.data.current.temperature_2m);
    } catch (err) { console.error('Weather fetch error:', err); }
  }, []);

  const toggleFavorite = () => {
    const city = { name: location, lat: weather.latitude, lon: weather.longitude };
    const exists = favorites.find(f => f.name === location);
    const newFavs = exists ? favorites.filter(f => f.name !== location) : [...favorites, city];
    setFavorites(newFavs);
    localStorage.setItem('favorites', JSON.stringify(newFavs));
  };

  const speakWeather = () => {
    if (!weather) return;
    const text = `Currently in ${location}, it is ${getWeatherDesc(weather.current.weather_code)} with a temperature of ${Math.round(weather.current.temperature_2m)} degrees.`;
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(51.5074, -0.1278, 'London')
      );
    } else {
      Promise.resolve().then(() => fetchWeather(51.5074, -0.1278, 'London'));
    }
  }, [fetchWeather]);

  useEffect(() => {
    const timer = setTimeout(() => { if (weather) setShowSplash(false); }, 2200);
    return () => clearTimeout(timer);
  }, [weather]);

  const formatDate = (isoStr) => new Date(isoStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  const formatTime = (isoStr) => new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <SplashScreen isVisible={showSplash} />
      <AnimatePresence>
        {!showSplash && weather && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`app-container ${bgClass}`}
          >
            <div className={`bg-gradient ${bgClass}`}></div>

            <header className="animate-up">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1.5rem' }}>
                <CloudSun size={32} className="text-accent" style={{ color: 'var(--accent-color)' }} /> Aura
              </div>
              <SearchBar onSearch={(lat, lon, name) => fetchWeather(lat, lon, name)} />
              <div className="controls">
                {favorites.length > 0 && (
                  <div className="favorites-popover glass">
                    {favorites.slice(0, 3).map((f, i) => (
                      <button key={i} onClick={() => fetchWeather(f.lat, f.lon, f.name)} className="fav-pill">{f.name.split(',')[0]}</button>
                    ))}
                  </div>
                )}
                <button onClick={() => setIsFarmerMode(!isFarmerMode)} className="btn-icon" style={{ background: isFarmerMode ? 'rgba(34, 197, 94, 0.2)' : 'var(--glass-bg)', borderColor: isFarmerMode ? '#22c55e' : 'var(--glass-border)' }}>
                  <Sprout size={24} color={isFarmerMode ? '#22c55e' : 'currentColor'} />
                </button>
                <ThemeToggle theme={theme} toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
              </div>
            </header>

            <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <section className="current-grid">
                <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-card glass" style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={toggleFavorite} className="btn-icon-small"><Star fill={favorites.find(f => f.name === location) ? "var(--accent-color)" : "none"} stroke="var(--accent-color)" size={20} /></button>
                    <button onClick={speakWeather} className="btn-icon-small"><Volume2 size={20} /></button>
                  </div>
                  <h1 className="location-name">{location}</h1>
                  <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>{getWeatherDesc(weather.current.weather_code)}</p>
                  <div className="temperature">{Math.round(weather.current.temperature_2m)}<span style={{ fontSize: '3rem', marginTop: '1rem' }}>°C</span></div>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '1.2rem' }}>
                    <span>H: {Math.round(weather.daily.temperature_2m_max[0])}°</span>
                    <span>L: {Math.round(weather.daily.temperature_2m_min[0])}°</span>
                  </div>
                </Motion.div>

                <div className="dashboard">
                  <DetailCard icon={<Wind />} label="Wind" value={`${weather.current.wind_speed_10m} km/h`} subtext={getWindDir(weather.current.wind_direction_10m)} />
                  <DetailCard icon={<Droplets />} label="Rain Chance" value={`${weather.daily.precipitation_probability_max[0]}%`} subtext={weather.current.precipitation > 0 ? "It's raining" : "No rain"} />
                  <DetailCard icon={<Activity />} label="AQI" value={aqi?.current.us_aqi} subtext={getAqiStatus(aqi?.current.us_aqi)} />
                  <DetailCard icon={<Sun />} label="UV Index" value={weather.daily.uv_index_max[0]} subtext={getUvStatus(weather.daily.uv_index_max[0])} />
                  <DetailCard icon={<Sunrise />} label="Sunrise" value={formatTime(weather.daily.sunrise[0])} subtext={`Sunset: ${formatTime(weather.daily.sunset[0])}`} />
                  <DetailCard icon={<Thermometer />} label="Feels Like" value={`${Math.round(weather.current.apparent_temperature)}°C`} subtext={`Humidity: ${weather.current.relative_humidity_2m}%`} />
                </div>
              </section>

              <DisasterAlerts weather={weather} />
              {isFarmerMode ? <AgriInsights weather={weather} /> : <SmartInsights weather={weather} />}

              <section className="animate-up" style={{ animationDelay: '0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Clock /> Hourly Forecast</h2>
                  <div className="glass-item" style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Info size={14} /> Time: {formatTime(weather.hourly.time[inspectedHour])}
                  </div>
                </div>
                <div className="glass-item" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <input type="range" min="0" max="23" value={inspectedHour} onChange={(e) => setInspectedHour(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-color)' }} />
                  <div className="hourly-details-text" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>
                    <span>{Math.round(weather.hourly.temperature_2m[inspectedHour])}°C</span>
                    <span>{weather.hourly.precipitation_probability[inspectedHour]}% Rain</span>
                    <span>{getWeatherDesc(weather.hourly.weather_code[inspectedHour])}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                  {weather.hourly.time.slice(0, 24).map((time, i) => (
                    <div key={i} className="glass-item" style={{ minWidth: '110px', padding: '1.5rem', textAlign: 'center', flexShrink: 0, border: i === inspectedHour ? '2px solid var(--accent-color)' : 'none', transform: i === inspectedHour ? 'scale(1.05)' : 'none', transition: 'all 0.3s ease' }} onClick={() => setInspectedHour(i)}>
                      <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{i === 0 ? 'Now' : formatTime(time)}</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{Math.round(weather.hourly.temperature_2m[i])}°</p>
                      <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>{weather.hourly.precipitation_probability[i]}% rain</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="animate-up" style={{ animationDelay: '0.4s' }}>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Calendar /> 14-Day Forecast</h2>
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                  {weather.daily.time.map((time, i) => (
                    <div key={i} className="glass-item" style={{ minWidth: '160px', padding: '1.5rem', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{i === 0 ? 'Today' : formatDate(time).split(',')[0]}</span>
                        {getWeatherIconComponent(weather.daily.weather_code[i], 24)}
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.9 }}><Sun size={14} color="#fbbf24"/> High:</span>
                          <span style={{ fontWeight: 600 }}>{Math.round(weather.daily.temperature_2m_max[i])}°C</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.9 }}><Moon size={14} color="#fbbf24"/> Low:</span>
                          <span style={{ fontWeight: 600 }}>{Math.round(weather.daily.temperature_2m_min[i])}°C</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.9 }}><Droplets size={14} color="var(--accent-color)"/> Rain:</span>
                          <span style={{ fontWeight: 600 }}>{weather.daily.precipitation_probability_max[i]}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <HistoricalAnalytics historicalData={historicalData} lastYearData={lastYearData} />
            </main>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DetailCard({ icon, label, value, subtext }) {
  return (
    <div className="glass-item detail-card">
      <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{React.cloneElement(icon, { size: 14 })} {label}</div>
      <div className="value">{value}</div>
      <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>{subtext}</div>
    </div>
  );
}

const getWeatherDesc = (code) => {
  const codes = { 0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 61: 'Slight rain', 95: 'Thunderstorm' };
  return codes[code] || 'Cloudy';
};
const getWeatherIconComponent = (code, size=20) => {
  if (code === 0 || code === 1) return <Sun size={size} />;
  if (code === 2) return <CloudSun size={size} />;
  if (code === 3 || code === 45) return <Cloud size={size} />;
  if (code >= 51 && code <= 67) return <CloudRain size={size} />;
  if (code >= 71 && code <= 82) return <CloudSnow size={size} />;
  if (code >= 95) return <CloudLightning size={size} />;
  return <CloudSun size={size} />;
};
const getWindDir = (deg) => ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8];
const getAqiStatus = (aqi) => aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : 'Unhealthy';
const getUvStatus = (uv) => uv <= 2 ? 'Low' : uv <= 5 ? 'Moderate' : 'High';

export default App;
