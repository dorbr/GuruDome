'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import {
    Users,
    Star,
    MessageSquare,
    Flag,
    TrendingUp,
    AlertTriangle,
    UserX,
    Activity,
    Shield,
    Clock,
    CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
    totalUsers: number;
    totalGurus: number;
    totalReviews: number;
    pendingReports: number;
    bannedUsers: number;
    recentUsers: number;
    recentReviews: number;
}

interface RoleDistribution {
    user: number;
    moderator: number;
    admin: number;
}

function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    trendLabel,
    href,
    variant = 'default',
    delay = 0
}: {
    title: string;
    value: number;
    icon: React.ElementType;
    trend?: number;
    trendLabel?: string;
    href?: string;
    variant?: 'default' | 'warning' | 'danger' | 'purple' | 'blue';
    delay?: number;
}) {
    const variants = {
        default: 'from-blue-500/10 to-cyan-500/10 border-blue-200/20 text-blue-500',
        warning: 'from-orange-500/10 to-yellow-500/10 border-orange-200/20 text-orange-500',
        danger: 'from-red-500/10 to-pink-500/10 border-red-200/20 text-red-500',
        purple: 'from-purple-500/10 to-indigo-500/10 border-purple-200/20 text-purple-500',
        blue: 'from-sky-500/10 to-blue-500/10 border-sky-200/20 text-sky-500'
    };

    const content = (
        <div
            className={`relative overflow-hidden p-6 rounded-2xl border bg-gradient-to-br ${variants[variant]} backdrop-blur-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-sm font-medium text-muted-foreground/80">{title}</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <h3 className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</h3>
                    </div>
                    {trend !== undefined && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium">
                            <span className={`flex items-center gap-0.5 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                                {trend > 0 ? '+' : ''}{trend}
                            </span>
                            <span className="text-muted-foreground/60">{trendLabel}</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl bg-background/50 backdrop-blur border border-white/10 shadow-sm group-hover:rotate-6 transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );

    if (href) {
        return <Link href={href} className="block">{content}</Link>;
    }
    return content;
}

function RoleBar({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
    const percentage = Math.round((count / Math.max(1, total)) * 100);

    return (
        <div className="group">
            <div className="flex items-center justify-between mb-2 text-sm">
                <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
                <span className="font-bold">{count} <span className="text-muted-foreground font-normal text-xs">({percentage}%)</span></span>
            </div>
            <div className="h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

function ActivityItem({ icon: Icon, title, desc, time, color }: { icon: any, title: string, desc: string, time: string, color: string }) {
    return (
        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div className={`p-2 rounded-lg ${color} shrink-0`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{title}</p>
                <p className="text-xs text-muted-foreground truncate">{desc}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
        </div>
    );
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [roleDistribution, setRoleDistribution] = useState<RoleDistribution | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            if (!user) return;

            try {
                const response = await fetch('/api/admin/stats', {
                    headers: {
                        'x-firebase-uid': user.uid,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch stats');
                }

                const data = await response.json();
                setStats(data.stats);
                setRoleDistribution(data.roleDistribution);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, [user]);

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse p-6">
                <div className="flex items-center justify-between">
                    <div className="h-10 w-48 bg-muted rounded-lg" />
                    <div className="h-10 w-32 bg-muted rounded-lg" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-40 bg-muted rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="h-64 lg:col-span-2 bg-muted rounded-2xl" />
                    <div className="h-64 bg-muted rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="p-6 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 flex items-center gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-red-900 dark:text-red-300">Error Loading Dashboard</h3>
                        <p className="text-red-700 dark:text-red-400 mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="space-y-8 text-left animate-in fade-in duration-500" dir="ltr">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
                        Welcome back, {user?.displayName?.split(' ')[0] || 'Admin'}
                    </h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        {currentDate}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full border border-green-500/20 text-sm font-medium">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        System Operational
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={Users}
                    trend={stats?.recentUsers}
                    trendLabel="this week"
                    href="/admin/users"
                    variant="blue"
                    delay={0}
                />
                <StatCard
                    title="Total Gurus"
                    value={stats?.totalGurus || 0}
                    icon={Star}
                    href="/admin/gurus"
                    variant="purple"
                    delay={100}
                />
                <StatCard
                    title="Total Reviews"
                    value={stats?.totalReviews || 0}
                    icon={MessageSquare}
                    trend={stats?.recentReviews}
                    trendLabel="this week"
                    href="/admin/reviews"
                    variant="default"
                    delay={200}
                />
                <StatCard
                    title="Pending Reports"
                    value={stats?.pendingReports || 0}
                    icon={Flag}
                    variant={stats?.pendingReports ? 'warning' : 'default'}
                    href="/admin/reports"
                    delay={300}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link
                            href="/admin/reports?status=pending"
                            className="group p-6 rounded-2xl border bg-card hover:bg-accent/50 transition-all duration-300 hover:shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 blur-3xl rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150" />
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                                    <Flag className="h-6 w-6" />
                                </div>
                                {(stats?.pendingReports || 0) > 0 && (
                                    <span className="px-2.5 py-1 rounded-full bg-orange-500 text-white text-xs font-bold shadow-sm animate-pulse">
                                        {stats?.pendingReports} Pending
                                    </span>
                                )}
                            </div>
                            <h3 className="font-semibold text-lg mb-1">Review Reports</h3>
                            <p className="text-sm text-muted-foreground">Manage and resolve reported content</p>
                        </Link>

                        <Link
                            href="/admin/users?banned=true"
                            className="group p-6 rounded-2xl border bg-card hover:bg-accent/50 transition-all duration-300 hover:shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-pink-500/10 blur-3xl rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150" />
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                                    <UserX className="h-6 w-6" />
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
                                    {stats?.bannedUsers || 0} Banned
                                </span>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">User Management</h3>
                            <p className="text-sm text-muted-foreground">View bans and user permissions</p>
                        </Link>

                        <Link
                            href="/admin/reviews?filter=flagged"
                            className="group p-6 rounded-2xl border bg-card hover:bg-accent/50 transition-all duration-300 hover:shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 blur-3xl rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150" />
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">Flagged Review</h3>
                            <p className="text-sm text-muted-foreground">Check automated content flags</p>
                        </Link>

                        <Link
                            href="/admin/reviews?filter=scam"
                            className="group p-6 rounded-2xl border bg-card hover:bg-accent/50 transition-all duration-300 hover:shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-violet-500/10 blur-3xl rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150" />
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                                    <Activity className="h-6 w-6" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">Scam Reports</h3>
                            <p className="text-sm text-muted-foreground">Investigate potential scam activity</p>
                        </Link>
                    </div>
                </div>

                {/* Right Column: Role Stats & Activity */}
                <div className="space-y-6">
                    {/* Role Distribution */}
                    <div className="p-6 rounded-2xl border bg-card shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Shield className="h-4 w-4 text-primary" />
                                Role Distribution
                            </h3>
                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                                {stats?.totalUsers} Total
                            </span>
                        </div>

                        <div className="space-y-6">
                            {roleDistribution && (
                                <>
                                    <RoleBar
                                        label="Administrators"
                                        count={roleDistribution.admin || 0}
                                        total={stats?.totalUsers || 0}
                                        color="bg-red-500"
                                    />
                                    <RoleBar
                                        label="Moderators"
                                        count={roleDistribution.moderator || 0}
                                        total={stats?.totalUsers || 0}
                                        color="bg-blue-500"
                                    />
                                    <RoleBar
                                        label="Standard Users"
                                        count={roleDistribution.user || 0}
                                        total={stats?.totalUsers || 0}
                                        color="bg-primary/50"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Compact Recent Activity - Placeholder for visual structure */}
                    <div className="p-6 rounded-2xl border bg-card shadow-sm">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            Recent Activity
                        </h3>
                        <div className="space-y-1">
                            {/* In a real app, this would map through actual recent events */}
                            <ActivityItem
                                icon={CheckCircle}
                                title="System Update"
                                desc="Dashboard updated successfully"
                                time="Just now"
                                color="bg-green-500/10 text-green-500"
                            />
                            <ActivityItem
                                icon={Users}
                                title="New User Registration"
                                desc="User #1293 joined the platform"
                                time="2m ago"
                                color="bg-blue-500/10 text-blue-500"
                            />
                            <ActivityItem
                                icon={MessageSquare}
                                title="New Review Posted"
                                desc="Review for Guru #45"
                                time="15m ago"
                                color="bg-purple-500/10 text-purple-500"
                            />
                        </div>
                        <button className="w-full mt-4 text-xs text-muted-foreground hover:text-primary transition-colors py-2 border border-dashed rounded-lg hover:bg-accent">
                            View All Activity
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
