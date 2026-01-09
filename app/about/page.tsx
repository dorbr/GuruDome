'use client';

import { Shield, Users, Search, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "../components/LanguageProvider";

export default function AboutPage() {
    const { t } = useLanguage();

    const features = [
        { title: t.verifiedData, key: 'verified' },
        { title: t.realReviews, key: 'reviews' },
        { title: t.scamAlerts, key: 'scam' },
        { title: t.performanceTracking, key: 'tracking' },
    ];

    const howItWorks = [
        {
            icon: Search,
            title: t.deepResearch,
            desc: t.deepResearchDesc
        },
        {
            icon: Users,
            title: t.communityReviews,
            desc: t.communityReviewsDesc
        },
        {
            icon: TrendingUp,
            title: t.performanceTrackingTitle,
            desc: t.performanceTrackingDesc
        }
    ];

    return (
        <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto text-center mb-24 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" />

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary/50 animate-fade-in">
                    {t.aboutHeroTitle.split(' ').slice(0, 2).join(' ')} <br /> {t.aboutHeroTitle.split(' ').slice(2).join(' ')}
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                    {t.aboutHeroSubtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/"
                        className="group relative px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-primary/25 flex items-center gap-2"
                    >
                        {t.exploreGurus}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
                    </Link>
                    <Link
                        href="/contact"
                        className="px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-full hover:bg-secondary/80 transition-all"
                    >
                        {t.contactUs}
                    </Link>
                </div>
            </div>

            {/* Mission Section */}
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center mb-32">
                <div className="space-y-8">
                    <h2 className="text-3xl md:text-4xl font-bold">{t.wildWestTitle}</h2>
                    <div className="space-y-6 text-lg text-muted-foreground">
                        <p>
                            {t.wildWestP1}
                        </p>
                        <p>
                            {t.wildWestP2}
                            <span className="text-foreground font-medium"> {t.thatEndsNow}</span>
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {features.map((item) => (
                            <div key={item.key} className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="font-medium">{item.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent blur-3xl -z-10 rounded-full" />
                    <div className="glass-panel p-8 rounded-2xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Shield className="w-32 h-32" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">{t.ourMission}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {t.ourMissionText}
                        </p>
                    </div>
                </div>
            </div>

            {/* How It Works Grid */}
            <div className="max-w-7xl mx-auto mb-24">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">{t.howItWorks}</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {howItWorks.map((feature, i) => (
                        <div key={i} className="glass-panel p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-white/5 hover:border-white/10 group">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-4xl mx-auto text-center glass-panel p-12 rounded-3xl border border-primary/20 bg-primary/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                <h2 className="text-3xl md:text-4xl font-bold mb-6">{t.readyToFind}</h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    {t.readyToFindDesc}
                </p>
                <Link
                    href="/"
                    className="inline-block px-10 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-1"
                >
                    {t.startSearching}
                </Link>
            </div>
        </main>
    );
}
