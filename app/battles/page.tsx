'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Swords, Users } from 'lucide-react';
import GuruAvatar from '@/app/components/GuruAvatar';
import { useLanguage } from '../components/LanguageProvider';

interface GuruSimple {
    _id: string;
    name: string;
    profileImage?: string;
    category?: string;
}

function BattlesPageContent() {
    const router = useRouter();
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const preselectId = searchParams.get('preselect');

    const [gurus, setGurus] = useState<GuruSimple[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGuru1, setSelectedGuru1] = useState<string>('');
    const [selectedGuru2, setSelectedGuru2] = useState<string>('');
    const [searchTerm1, setSearchTerm1] = useState('');
    const [searchTerm2, setSearchTerm2] = useState('');

    useEffect(() => {
        if (preselectId) {
            setSelectedGuru1(preselectId);
        }
    }, [preselectId]);

    useEffect(() => {
        // Fetch simple guru list
        const fetchGurus = async () => {
            try {
                // Use the public gurus endpoint
                const res = await fetch('/api/gurus');
                if (!res.ok) throw new Error('Failed to fetch gurus');

                const data = await res.json();
                // The API returns an array directly, not { gurus: ... } based on route.ts
                setGurus(Array.isArray(data) ? data : data.gurus || []);
            } catch (error) {
                console.error('Failed to load gurus', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGurus();
    }, []);

    const filteredGurus1 = gurus.filter(g =>
        g.name.toLowerCase().includes(searchTerm1.toLowerCase()) && g._id !== selectedGuru2
    );

    const filteredGurus2 = gurus.filter(g =>
        g.name.toLowerCase().includes(searchTerm2.toLowerCase()) && g._id !== selectedGuru1
    );

    const handleStartBattle = () => {
        if (selectedGuru1 && selectedGuru2) {
            router.push(`/battles/compare?guru1=${selectedGuru1}&guru2=${selectedGuru2}`);
        }
    };

    const getSelectedGuruObj = (id: string) => gurus.find(g => g._id === id);

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl min-h-screen">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 ring-1 ring-primary/20">
                    <Swords className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    {t.battlesPage.pageTitle}
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    {t.battlesPage.pageSubtitle}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start relative">
                {/* VS Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 bg-background border border-primary/50 rounded-full font-black italic text-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                    VS
                </div>

                {/* Fighter 1 Selection */}
                <div className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 min-h-[400px] flex flex-col">
                    <h2 className="text-lg font-semibold mb-4 text-center text-blue-400">{t.battlesPage.challenger1}</h2>

                    {selectedGuru1 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                            <div className="relative mb-4">
                                <GuruAvatar name={getSelectedGuruObj(selectedGuru1)?.name || ''} imageUrl={getSelectedGuruObj(selectedGuru1)?.profileImage} size="xl" />
                                <button
                                    onClick={() => setSelectedGuru1('')}
                                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80 transition-colors"
                                >
                                    <span className="sr-only">Remove</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            </div>
                            <h3 className="text-2xl font-bold">{getSelectedGuruObj(selectedGuru1)?.name}</h3>
                            <p className="text-muted-foreground">{getSelectedGuruObj(selectedGuru1)?.category}</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <input
                                    className="w-full bg-background/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/50"
                                    placeholder={t.battlesPage.searchPlaceholder}
                                    value={searchTerm1}
                                    onChange={(e) => setSearchTerm1(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}
                                    </div>
                                ) : (
                                    filteredGurus1.map(guru => (
                                        <button
                                            key={guru._id}
                                            onClick={() => setSelectedGuru1(guru._id)}
                                            className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-left group"
                                        >
                                            <GuruAvatar name={guru.name} imageUrl={guru.profileImage} size="sm" />
                                            <span className="font-medium group-hover:text-primary transition-colors">{guru.name}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Fighter 2 Selection */}
                <div className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 min-h-[400px] flex flex-col">
                    <h2 className="text-lg font-semibold mb-4 text-center text-red-400">{t.battlesPage.challenger2}</h2>

                    {selectedGuru2 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                            <div className="relative mb-4">
                                <GuruAvatar name={getSelectedGuruObj(selectedGuru2)?.name || ''} imageUrl={getSelectedGuruObj(selectedGuru2)?.profileImage} size="xl" />
                                <button
                                    onClick={() => setSelectedGuru2('')}
                                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80 transition-colors"
                                >
                                    <span className="sr-only">Remove</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            </div>
                            <h3 className="text-2xl font-bold">{getSelectedGuruObj(selectedGuru2)?.name}</h3>
                            <p className="text-muted-foreground">{getSelectedGuruObj(selectedGuru2)?.category}</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <input
                                    className="w-full bg-background/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/50"
                                    placeholder={t.battlesPage.searchPlaceholder}
                                    value={searchTerm2}
                                    onChange={(e) => setSearchTerm2(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}
                                    </div>
                                ) : (
                                    filteredGurus2.map(guru => (
                                        <button
                                            key={guru._id}
                                            onClick={() => setSelectedGuru2(guru._id)}
                                            className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-left group"
                                        >
                                            <GuruAvatar name={guru.name} imageUrl={guru.profileImage} size="sm" />
                                            <span className="font-medium group-hover:text-primary transition-colors">{guru.name}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 text-center">
                <button
                    onClick={handleStartBattle}
                    disabled={!selectedGuru1 || !selectedGuru2}
                    className="px-12 py-4 bg-primary text-primary-foreground text-xl font-bold rounded-full shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:shadow-[0_0_30px_rgba(var(--primary),0.6)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none transition-all duration-300"
                >
                    {t.battlesPage.startBattle}
                </button>
            </div>
        </div>
    );
}

export default function BattlesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Arena...</div>}>
            <BattlesPageContent />
        </Suspense>
    );
}
