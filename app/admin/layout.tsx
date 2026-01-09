'use client';

import { useAuth } from '@/app/components/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    Star,
    MessageSquare,
    Flag,
    ChevronLeft,
    Shield
} from 'lucide-react';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/gurus', label: 'Gurus', icon: Star },
    { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
    { href: '/admin/reports', label: 'Reports', icon: Flag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, isModerator } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && (!user || !isModerator)) {
            router.push('/');
        }
    }, [user, loading, isModerator, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user || !isModerator) {
        // Wait for loading to complete before showing access denied
        // The role is fetched asynchronously, so we show a loading state until we know the actual role
        if (loading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            );
        }

        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-muted-foreground mb-4">You don&apos;t have permission to access this area.</p>
                    <Link href="/" className="text-primary hover:underline">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-card/30 hidden md:flex flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
                <div className="p-4 border-b h-16 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Admin Panel</span>
                </div>
                <nav className="p-4 space-y-1 overflow-y-auto flex-1">
                    {navItems.map((item) => {
                        const isActive = item.href === '/admin'
                            ? pathname === '/admin'
                            : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t">
                    <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Site</span>
                    </Link>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 h-16 border-t bg-card/90 backdrop-blur-sm flex items-center justify-around md:hidden z-50">
                {navItems.map((item) => {
                    const isActive = item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="text-[10px]">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 w-full overflow-hidden">
                {children}
            </main>
        </div>
    );
}
