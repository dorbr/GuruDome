'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface Fighter {
    name: string;
    image?: string;
}

interface BattleIntroProps {
    onComplete: () => void;
    fighter1: Fighter;
    fighter2: Fighter;
}

export default function BattleIntro({ onComplete, fighter1, fighter2 }: BattleIntroProps) {
    const [phase, setPhase] = useState<'enter' | 'clash' | 'exit'>('enter');

    useEffect(() => {
        const sequence = async () => {
            // Start 'enter' is automatic on mount via AnimatePresence/initial

            // Wait for swords to arrive and settle slightly
            await new Promise(r => setTimeout(r, 1000));
            setPhase('clash');

            // Wait for impact / shake / particles
            await new Promise(r => setTimeout(r, 2000));
            setPhase('exit');

            // Cleanup
            await new Promise(r => setTimeout(r, 500));
            onComplete();
        };

        sequence();
    }, [onComplete]);

    // Variants for Fighter 1 (Blue) - Comes from LEFT in LTR
    const fighter1Variants: Variants = {
        enter: {
            x: '-100%',
            opacity: 0,
            scale: 0.8,
            rotate: -20
        },
        ready: {
            x: '0%', // Center-ish offset handled by container padding or margin
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: {
                type: 'spring',
                damping: 12,
                stiffness: 100,
                mass: 1
            }
        },
        anticipate: {
            x: '-10%',
            rotate: -15,
            scale: 0.9,
            transition: { duration: 0.4, ease: "easeIn" }
        },
        clash: {
            x: '15%', // Push past center for overlap
            rotate: 15,
            scale: 1.1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 10
            }
        },
        exit: {
            opacity: 0,
            x: '-20%',
            transition: { duration: 0.3 }
        }
    };

    // Variants for Fighter 2 (Red) - Comes from RIGHT in LTR
    const fighter2Variants: Variants = {
        enter: {
            x: '100%',
            opacity: 0,
            scale: 0.8,
            rotate: 20
        },
        ready: {
            x: '0%',
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: {
                type: 'spring',
                damping: 12,
                stiffness: 100,
                mass: 1
            }
        },
        anticipate: {
            x: '10%',
            rotate: 15,
            scale: 0.9,
            transition: { duration: 0.4, ease: "easeIn" }
        },
        clash: {
            x: '-15%', // Push past center
            rotate: -15,
            scale: 1.1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 10
            }
        },
        exit: {
            opacity: 0,
            x: '20%',
            transition: { duration: 0.3 }
        }
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'exit' ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            dir="ltr" // Force LTR for easy absolute coordinate management. We map names correctly.
        >
            {/* Background Gradient Pulse */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-red-900/20"
                animate={phase === 'clash' ? {
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.1, 1],
                } : { opacity: 0.5 }}
                transition={{ duration: 0.2 }}
            />

            {/* Flash Effect on Clash */}
            {phase === 'clash' && (
                <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                />
            )}

            {/* Shake Container */}
            <motion.div
                className="relative w-full h-full flex items-center justify-center"
                animate={phase === 'clash' ? {
                    x: [-10, 10, -8, 8, -4, 4, 0],
                    y: [-5, 5, -2, 2, 0]
                } : {}}
                transition={{ duration: 0.4 }}
            >
                {/* --- Fighter 1 (Blue) --- */}
                <motion.div
                    className="absolute w-[45vw] max-w-md left-0 origin-bottom-left z-10 flex flex-col items-center"
                    initial="enter"
                    animate={phase === 'clash' ? "clash" : phase === 'enter' ? "ready" : "exit"} // using 'ready' as the idle state after enter
                    variants={fighter1Variants}
                >
                    {/* Info Card - Floats above sword */}
                    <motion.div
                        className="mb-4 flex flex-col items-center"
                        animate={phase === 'clash' ? { y: -20, scale: 1.1 } : { y: 0, scale: 1 }}
                    >
                        {/* {fighter1.image ? (
                            <Image src={fighter1.image} alt={fighter1.name} width={100} height={100} className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] object-cover bg-zinc-900" />
                        ) : ( */}
                        <div className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] bg-blue-900/50 flex items-center justify-center text-3xl">👤</div>
                        {/* )} */}
                        <div className="mt-2 bg-blue-600 text-white text-sm font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-lg transform -skew-x-12">
                            {fighter1.name}
                        </div>
                    </motion.div>

                    <SwordIcon className="w-full h-auto drop-shadow-2xl transform -scale-x-100" type="blue" />
                </motion.div>

                {/* --- Fighter 2 (Red) --- */}
                <motion.div
                    className="absolute w-[45vw] max-w-md right-0 origin-bottom-right z-10 flex flex-col items-center"
                    initial="enter"
                    animate={phase === 'clash' ? "clash" : phase === 'enter' ? "ready" : "exit"}
                    variants={fighter2Variants}
                >
                    {/* Info Card */}
                    <motion.div
                        className="mb-4 flex flex-col items-center"
                        animate={phase === 'clash' ? { y: -20, scale: 1.1 } : { y: 0, scale: 1 }}
                    >
                        {/* {fighter2.image ? (
                            <Image src={fighter2.image} alt={fighter2.name} width={100} height={100} className="w-24 h-24 rounded-full border-4 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] object-cover bg-zinc-900" />
                        ) : ( */}
                        <div className="w-24 h-24 rounded-full border-4 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] bg-red-900/50 flex items-center justify-center text-3xl">👤</div>
                        {/* )} */}
                        <div className="mt-2 bg-red-600 text-white text-sm font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-lg transform -skew-x-12">
                            {fighter2.name}
                        </div>
                    </motion.div>

                    <SwordIcon className="w-full h-auto drop-shadow-2xl" type="red" />
                </motion.div>

                {/* --- Impact Particles --- */}
                <AnimatePresence>
                    {phase === 'clash' && (
                        <>
                            {/* Shockwave Ring */}
                            <motion.div
                                className="absolute border-[4px] border-white rounded-full z-20"
                                initial={{ width: 0, height: 0, opacity: 1, borderWidth: 50 }}
                                animate={{ width: 1000, height: 1000, opacity: 0, borderWidth: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                            {/* Central Burst */}
                            <motion.div
                                className="absolute z-20 w-32 h-32 bg-white rounded-full blur-2xl"
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: 2, opacity: 0 }}
                                transition={{ duration: 0.4 }}
                            />
                        </>
                    )}
                </AnimatePresence>

                {/* --- VS Text --- */}
                <motion.div
                    className="absolute z-40 flex items-center justify-center pointer-events-none"
                    initial={{ scale: 0, opacity: 0, rotate: -10 }}
                    animate={phase === 'clash' ? {
                        scale: 1,
                        opacity: 1,
                        rotate: 0
                    } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                    {phase === 'clash' && (
                        <div className="relative">
                            <span className="absolute inset-0 blur-lg text-white scale-110">VS</span>
                            <span className="text-9xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]"
                                style={{ WebkitTextStroke: '2px white' }}>
                                VS
                            </span>
                        </div>
                    )}
                </motion.div>

            </motion.div>
        </motion.div>
    );
}

// ... unchanged SwordIcon component below
function SwordIcon({ className, type }: { className?: string; type: 'blue' | 'red' }) {
    // Keeping the original SVG component but ensuring it scales nicely
    const isBlue = type === 'blue';
    return (
        <svg
            viewBox="0 0 200 200"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: 'visible' }}
        >
            <defs>
                <linearGradient id={`${type}-blade-gradient`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#e5e7eb" />
                    <stop offset="50%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#9ca3af" />
                </linearGradient>
                <linearGradient id={`${type}-handle-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={isBlue ? "#1e3a8a" : "#7f1d1d"} />
                    <stop offset="100%" stopColor={isBlue ? "#3b82f6" : "#ef4444"} />
                </linearGradient>
            </defs>

            {/* Glowing Aura */}
            <path
                d="M100 20 L130 150 L100 180 L70 150 Z"
                fill={isBlue ? "#3b82f6" : "#ef4444"}
                className="opacity-30 blur-md"
            />

            {/* Blade */}
            <path
                d="M100 20 L125 150 L100 175 L75 150 Z"
                fill={`url(#${type}-blade-gradient)`}
                stroke="#4b5563"
                strokeWidth="1"
            />

            {/* Fuller (Blood groove) */}
            <path
                d="M100 35 L100 145"
                stroke="#d1d5db"
                strokeWidth="3"
                strokeLinecap="round"
            />

            {/* Crossguard */}
            <path
                d="M50 145 C50 145, 80 135, 100 150 C120 135, 150 145, 150 145 L150 160 C150 160, 120 155, 100 165 C80 155, 50 160, 50 160 Z"
                fill="#d97706"
                stroke="#78350f"
                strokeWidth="1"
            />

            {/* Handle */}
            <rect
                x="92" y="160" width="16" height="30" rx="4"
                fill={`url(#${type}-handle-gradient)`}
                stroke="#000"
                strokeWidth="1"
            />

            {/* Pommel */}
            <circle
                cx="100" cy="195" r="8"
                fill="#d97706"
                stroke="#78350f"
                strokeWidth="1"
            />

            {/* Jewel */}
            <circle
                cx="100" cy="155" r="5"
                fill={isBlue ? "#60a5fa" : "#f87171"}
                className="animate-pulse"
            />
        </svg>
    );
}

