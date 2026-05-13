import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { CloudSun } from 'lucide-react';

const SplashScreen = ({ isVisible }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <Motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 999999,
                        color: 'white'
                    }}
                >
                    <Motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            duration: 1,
                            ease: "easeOut",
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
                    >
                        <div style={{ position: 'relative' }}>
                            <CloudSun size={80} className="text-accent" style={{ color: '#60a5fa' }} />
                            <Motion.div
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '100px',
                                    height: '100px',
                                    background: 'rgba(96, 165, 250, 0.3)',
                                    borderRadius: '50%',
                                    filter: 'blur(20px)',
                                    zIndex: -1
                                }}
                            />
                        </div>
                        <Motion.h1
                            initial={{ letterSpacing: '0.2em', opacity: 0 }}
                            animate={{ letterSpacing: '0.5em', opacity: 1 }}
                            transition={{ duration: 1.5, delay: 0.2 }}
                            style={{
                                fontSize: '3rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                background: 'linear-gradient(to right, #60a5fa, #ffffff)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            Aura
                        </Motion.h1>
                    </Motion.div>

                    <Motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ delay: 1 }}
                        style={{ position: 'absolute', bottom: '10%', fontSize: '0.9rem', letterSpacing: '0.1em' }}
                    >
                        PERCEPTIVE WEATHER INSIGHTS
                    </Motion.p>
                </Motion.div>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;
