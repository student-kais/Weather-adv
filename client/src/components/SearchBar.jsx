import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const POPULAR_CITIES = [
        { name: 'London', country_code: 'GB', latitude: 51.5074, longitude: -0.1278 },
        { name: 'New York', country_code: 'US', latitude: 40.7128, longitude: -74.0060 },
        { name: 'Tokyo', country_code: 'JP', latitude: 35.6895, longitude: 139.6917 },
        { name: 'Dubai', country_code: 'AE', latitude: 25.2048, longitude: 55.2708 },
        { name: 'Paris', country_code: 'FR', latitude: 48.8566, longitude: 2.3522 }
    ];

    const currentList = query.length > 0 ? suggestions : POPULAR_CITIES;

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 1) {
                setSuggestions([]);
                return;
            }
            try {
                const res = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=10&language=en&format=json`);
                if (res.data.results) {
                    setSuggestions(res.data.results);
                } else {
                    setSuggestions([]);
                }
            } catch (err) {
                console.error('Search error:', err);
            }
        };

        const timeout = setTimeout(fetchSuggestions, 200);
        setActiveIndex(-1); // Reset on every query change
        return () => clearTimeout(timeout);
    }, [query]);

    const handleSuggestionClick = (city) => {
        const cityName = `${city.name}, ${city.country || city.country_code || ''}`;
        setQuery(city.name);
        onSearch(city.latitude, city.longitude, cityName);
        setShowSuggestions(false);
    };

    const handleKeyDown = async (e) => {
        if (e.key === 'ArrowDown') {
            setActiveIndex(prev => (prev < currentList.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && currentList[activeIndex]) {
                handleSuggestionClick(currentList[activeIndex]);
            } else if (currentList.length > 0) {
                handleSuggestionClick(currentList[0]);
            } else if (query.length > 1) {
                try {
                    const res = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=en&format=json`);
                    if (res.data.results && res.data.results.length > 0) {
                        handleSuggestionClick(res.data.results[0]);
                    }
                } catch (err) {
                    console.error('Search error:', err);
                }
            }
            setShowSuggestions(false);
        }
    };

    return (
        <div className="search-wrapper">
            <div style={{ position: 'relative', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div className="search-input-container" style={{ position: 'relative', flex: 1 }}>
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        value={query}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search for a city..."
                        className="search-input"
                    />
                    {showSuggestions && (query.length > 0 ? suggestions.length > 0 : true) && (
                        <div className="suggestions-list">
                            <div style={{ padding: '0.8rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, borderBottom: '1px solid var(--glass-border)' }}>
                                {query.length > 0 ? 'Search Results' : 'Suggested Locations'}
                            </div>
                            {(query.length > 0 ? suggestions : POPULAR_CITIES).map((city, idx) => (
                                <div
                                    key={idx}
                                    onMouseDown={(e) => {
                                        e.preventDefault(); // Prevent input blur before click
                                        handleSuggestionClick(city);
                                    }}
                                    onMouseEnter={() => setActiveIndex(idx)}
                                    className={`suggestion-item ${idx === activeIndex ? 'active' : ''}`}
                                    style={{
                                        background: idx === activeIndex ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                                        borderLeft: idx === activeIndex ? '4px solid var(--accent-color)' : '4px solid transparent'
                                    }}
                                >
                                    <span style={{ fontWeight: 600 }}>{city.name}</span>, {city.country_code?.toUpperCase()}
                                    {city.admin1 && <span style={{ opacity: 0.6, fontSize: '0.85rem', marginLeft: '0.5rem' }}>({city.admin1})</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    onClick={() => {
                        const fetchIpLocation = async () => {
                            try {
                                const res = await axios.get('https://ipapi.co/json/');
                                const { latitude, longitude, city } = res.data;
                                if (latitude && longitude) {
                                    onSearch(latitude, longitude, city);
                                    setQuery('');
                                } else {
                                    throw new Error("Invalid IP location data");
                                }
                            } catch (ipErr) {
                                console.error('IP Location error:', ipErr);
                                alert("Unable to retrieve your location via GPS or IP. Please search for your city manually.");
                            }
                        };

                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                                (pos) => {
                                    onSearch(pos.coords.latitude, pos.coords.longitude);
                                    setQuery(''); // Clear search on current location use
                                },
                                (err) => {
                                    console.warn("Geolocation failed, falling back to IP location:", err);
                                    fetchIpLocation();
                                }
                            );
                        } else {
                            fetchIpLocation();
                        }
                    }}
                    className="btn-icon"
                    title="Use Current Location"
                    style={{ borderRadius: '50%', width: '45px', height: '45px', flexShrink: 0 }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 12V7H5a2 2 0 0 1 0-4m14 0h2m-2 0h-2m-2 0H5m14 0V3m0 4v4m0 0h-5m5 0h-5" style={{ display: "none" }} />
                        <line x1="2" x2="5" y1="12" y2="12" />
                        <line x1="19" x2="22" y1="12" y2="12" />
                        <line x1="12" x2="12" y1="2" y2="5" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                        <circle cx="12" cy="12" r="7" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </button>
            </div>


        </div>
    );
};

export default SearchBar;
