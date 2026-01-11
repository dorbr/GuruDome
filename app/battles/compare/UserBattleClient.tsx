'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, BadgeCheck, Minus } from 'lucide-react';
import confetti from 'canvas-confetti'; // Import confetti
import GuruAvatar from '@/app/components/GuruAvatar';
import BattleMetrics from '@/app/components/BattleMetrics';
import BattleIntro from '@/app/components/BattleIntro';
import { calculateReputationScore, ReputationAnalysis } from '@/lib/battleUtils';

interface Guru {
    _id: string;
    name: string;
    instagramUrl: string;
    profileImage?: string;
    category?: string;
    ratingStats?: {
        averageRating: number;
        totalReviews: number;
    }
}

interface GuruWithAnalysis extends Guru {
    analysis: ReputationAnalysis;
}

export default function UserBattleClient({ id1, id2 }: { id1: string; id2: string }) {
    const [guru1, setGuru1] = useState<GuruWithAnalysis | null>(null);
    const [guru2, setGuru2] = useState<GuruWithAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [showIntro, setShowIntro] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [res1, res2] = await Promise.all([
                    fetch(`/api/gurus/${id1}`),
                    fetch(`/api/gurus/${id2}`)
                ]);

                if (res1.ok) {
                    const data1 = await res1.json();
                    // Calculate Score for Guru 1
                    const analysis = calculateReputationScore(data1.guru, data1.reviews || []);
                    setGuru1({ ...data1.guru, analysis });
                }
                if (res2.ok) {
                    const data2 = await res2.json();
                    // Calculate Score for Guru 2
                    const analysis = calculateReputationScore(data2.guru, data2.reviews || []);
                    setGuru2({ ...data2.guru, analysis });
                }

            } catch (error) {
                console.error("Battle load error", error);
            } finally {
                setLoading(false);
            }
        };

        if (id1 && id2) {
            fetchData();
        }
    }, [id1, id2]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 container mx-auto px-4 text-center">
                <div className="animate-pulse space-y-8">
                    <div className="h-12 w-48 bg-white/5 mx-auto rounded-lg"></div>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="h-64 bg-white/5 rounded-2xl"></div>
                        <div className="h-64 bg-white/5 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!guru1 || !guru2) {
        return (
            <div className="min-h-screen pt-24 text-center">
                <h1 className="text-2xl font-bold mb-4">Fighter not found</h1>
                <Link href="/battles" className="text-primary hover:underline">Return to Arena selection</Link>
            </div>
        );
    }

    // Determine Winners
    const score1 = guru1.analysis.score;
    const score2 = guru2.analysis.score;
    const scoreWin = score1 > score2 ? 1 : score2 > score1 ? 2 : 0;

    const reviews1 = guru1.ratingStats?.totalReviews || 0;
    const reviews2 = guru2.ratingStats?.totalReviews || 0;
    const reviewsWin = reviews1 > reviews2 ? 1 : reviews2 > reviews1 ? 2 : 0;

    // Overall Winner (Reputation Score is King)
    const winnerIndex = scoreWin !== 0 ? scoreWin : reviewsWin;

    // Trigger Confetti on Reveal
    const handleIntroComplete = () => {
        setShowIntro(false);
        if (winnerIndex !== 0) {
            // Fire Confetti from the winner's side
            const originX = winnerIndex === 1 ? 0.25 : 0.75;

            // Initial burst
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { x: originX, y: 0.6 },
                colors: winnerIndex === 1 ? ['#3b82f6', '#93c5fd', '#ffffff'] : ['#ef4444', '#fca5a5', '#ffffff'],
                zIndex: 100
            });

            // Follow up rain
            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 90,
                    spread: 45,
                    origin: { x: originX, y: 0 },
                    gravity: 1.2,
                    zIndex: 100,
                    colors: winnerIndex === 1 ? ['#3b82f6', '#93c5fd'] : ['#ef4444', '#fca5a5']
                });
            }, 300);
        }
    };

    const TrendIcon = ({ trend }: { trend: string }) => {
        if (trend === 'rising') return <TrendingUp className="w-4 h-4 text-green-500" />;
        if (trend === 'falling') return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-background">
            {showIntro && guru1 && guru2 && (
                <BattleIntro
                    onComplete={handleIntroComplete}
                    fighter1={{ name: guru1.name, image: guru1.profileImage }}
                    fighter2={{ name: guru2.name, image: guru2.profileImage }}
                />
            )}

            <div className="container mx-auto px-4 max-w-5xl">
                <Link href="/battles" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Arena
                </Link>

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-muted-foreground mb-4">
                        Tale of the Tape
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">
                        <span className="text-blue-500">{guru1.name}</span>
                        <span className="mx-4 text-muted-foreground/30 text-2xl not-italic font-normal">VS</span>
                        <span className="text-red-500">{guru2.name}</span>
                    </h1>
                </div>

                {/* Main Card */}
                <div className="bg-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-2 divide-x divide-white/5">
                        {/* Fighter 1 Header */}
                        <div className={`p-6 md:p-10 flex flex-col items-center transition-all duration-500 ${winnerIndex === 1 ? 'bg-gradient-to-b from-blue-500/20 to-blue-500/5' : 'bg-gradient-to-b from-blue-500/5 to-transparent'} relative overflow-hidden`}>
                            {winnerIndex === 1 && <div className="absolute top-0 inset-x-0 h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" />}
                            <div className="relative mb-6">
                                <GuruAvatar name={guru1.name} imageUrl={guru1.profileImage} size="xl" className={`w-24 h-24 md:w-32 md:h-32 shadow-xl ring-4 ${winnerIndex === 1 ? 'ring-blue-500 shadow-blue-500/50' : 'ring-blue-500/20'}`} />
                                {winnerIndex === 1 && (
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg whitespace-nowrap z-10 animate-bounce">
                                        <Trophy className="w-3 h-3 mr-1" /> WINNER
                                    </div>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-center mb-1">{guru1.name}</h2>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    {guru1.category || 'Guru'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 w-full text-center mt-2">
                                <div className="bg-white/5 rounded-lg p-2">
                                    <div className="text-xs text-muted-foreground">Trend</div>
                                    <div className="flex items-center justify-center gap-1 font-medium capitalize">
                                        <TrendIcon trend={guru1.analysis.trend} />
                                        {guru1.analysis.trend}
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-2">
                                    <div className="text-xs text-muted-foreground">Quality</div>
                                    <div className="flex items-center justify-center gap-1 font-medium capitalize">
                                        {guru1.analysis.quality === 'high' && <BadgeCheck className="w-3 h-3 text-blue-400" />}
                                        {guru1.analysis.quality}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fighter 2 Header */}
                        <div className={`p-6 md:p-10 flex flex-col items-center transition-all duration-500 ${winnerIndex === 2 ? 'bg-gradient-to-b from-red-500/20 to-red-500/5' : 'bg-gradient-to-b from-red-500/5 to-transparent'} relative overflow-hidden`}>
                            {winnerIndex === 2 && <div className="absolute top-0 inset-x-0 h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]" />}
                            <div className="relative mb-6">
                                <GuruAvatar name={guru2.name} imageUrl={guru2.profileImage} size="xl" className={`w-24 h-24 md:w-32 md:h-32 shadow-xl ring-4 ${winnerIndex === 2 ? 'ring-red-500 shadow-red-500/50' : 'ring-red-500/20'}`} />
                                {winnerIndex === 2 && (
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg whitespace-nowrap z-10 animate-bounce">
                                        <Trophy className="w-3 h-3 mr-1" /> WINNER
                                    </div>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-center mb-1">{guru2.name}</h2>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                    {guru2.category || 'Guru'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 w-full text-center mt-2">
                                <div className="bg-white/5 rounded-lg p-2">
                                    <div className="text-xs text-muted-foreground">Trend</div>
                                    <div className="flex items-center justify-center gap-1 font-medium capitalize">
                                        <TrendIcon trend={guru2.analysis.trend} />
                                        {guru2.analysis.trend}
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-2">
                                    <div className="text-xs text-muted-foreground">Quality</div>
                                    <div className="flex items-center justify-center gap-1 font-medium capitalize">
                                        {guru2.analysis.quality === 'high' && <BadgeCheck className="w-3 h-3 text-red-400" />}
                                        {guru2.analysis.quality}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Comparison */}
                    <div className="p-6 md:p-8 bg-background/50">
                        <BattleMetrics
                            label="Reputation Score"
                            value1={score1}
                            value2={score2}
                            betterIndex={scoreWin}
                            icon={<span className="text-purple-500 font-black text-lg">⚠️</span>}
                        />
                        <BattleMetrics
                            label="Raw Rating"
                            value1={guru1.ratingStats?.averageRating.toFixed(1) || "0.0"}
                            value2={guru2.ratingStats?.averageRating.toFixed(1) || "0.0"}
                            betterIndex={0}
                            icon={<span className="text-yellow-500">★</span>}
                        />
                        <BattleMetrics
                            label="Total Reviews"
                            value1={reviews1}
                            value2={reviews2}
                            betterIndex={reviewsWin}
                        />
                        <BattleMetrics
                            label="Verified?"
                            // Determine verified by quality for now or real purchase data if we add that flag to guru
                            value1={guru1.analysis.quality === 'high' ? 'High Trust' : 'Normal'}
                            value2={guru2.analysis.quality === 'high' ? 'High Trust' : 'Normal'}
                            betterIndex={guru1.analysis.quality === 'high' && guru2.analysis.quality !== 'high' ? 1 : guru2.analysis.quality === 'high' && guru1.analysis.quality !== 'high' ? 2 : 0}
                        />
                    </div>
                </div>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    <p>* Reputation Score is calculated based on review recency, quality, and verification status.</p>
                </div>
            </div>
        </div>
    );
}
