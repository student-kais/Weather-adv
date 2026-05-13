import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const ThemeToggle = ({ theme, toggleTheme }) => {
    return (
        <Motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="btn-icon"
            aria-label="Toggle Theme"
        >
            {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
        </Motion.button>
    );
};

export default ThemeToggle;
