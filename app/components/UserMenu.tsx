'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { LogOut, User as UserIcon, LogIn, Settings, Shield, Star } from 'lucide-react';
import Link from 'next/link';

export default function UserMenu() {
    const { user, loading, logout, openLoginModal, isModerator, userRole } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (loading) {
        return <div className="h-9 w-20 bg-muted/20 animate-pulse rounded-lg"></div>;
    }
    if (!user) {
        return (
            <div className="flex items-center gap-4">
                <button
                    onClick={openLoginModal}
                    className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2"
                >
                    <LogIn className="h-4 w-4" />
                    Login
                </button>
            </div>
        );
    }

    const getRoleBadgeColor = () => {
        switch (userRole) {
            case 'admin':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'moderator':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="rounded-full transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border/50">
                    {user.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={user.displayName || 'User'}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="text-sm font-bold text-primary">
                            {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-card p-2 shadow-lg animate-in fade-in zoom-in-95 duration-200 z-50">
                    <div className="px-2 py-1.5 text-sm font-semibold border-b mb-1 flex items-center justify-between">
                        <span>My Account</span>
                        {userRole !== 'user' && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getRoleBadgeColor()}`}>
                                {userRole}
                            </span>
                        )}
                    </div>
                    <div className="px-2 py-1.5 text-xs text-muted-foreground truncate mb-1">
                        {user.email}
                    </div>

                    {isModerator && (
                        <Link
                            href="/admin"
                            onClick={() => setIsDropdownOpen(false)}
                            className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                        >
                            <Shield className="h-4 w-4" />
                            Admin Panel
                        </Link>
                    )}

                    <Link
                        href="/my-reviews"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                    >
                        <Star className="h-4 w-4" />
                        My Reviews
                    </Link>

                    <button
                        onClick={() => {
                            logout();
                            setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Log out
                    </button>
                </div>
            )}
        </div>
    );
}

