'use client';

import { useState, useEffect } from 'react';
import { X, LogIn } from 'lucide-react';
import { useAuth } from './AuthProvider';

export default function AuthModal() {
    const { signInWithGoogle, isLoginModalOpen, closeLoginModal } = useAuth();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {
        if (isLoginModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isLoginModalOpen]);

    const [error, setError] = useState<string | null>(null);

    // Clear error when modal opens/closes
    useEffect(() => {
        if (isLoginModalOpen) setError(null);
    }, [isLoginModalOpen]);

    const handleGoogleLogin = async () => {
        setIsLoggingIn(true);
        setError(null);
        try {
            await signInWithGoogle();
            closeLoginModal();
        } catch (error: any) {
            console.error("Login failed", error);
            // Handle specific Firebase errors
            if (error?.code === 'auth/popup-closed-by-user') {
                return; // Ignore
            }
            if (error?.code === 'auth/unauthorized-domain') {
                setError('This domain is not authorized for Google Login. Please contact support.');
            } else {
                setError(error.message || 'Failed to sign in. Please try again.');
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    // Google Logo SVG
    const GoogleIcon = () => (
        <svg className="h-5 w-5 mr-2" aria-hidden="true" viewBox="0 0 24 24">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </svg>
    );

    if (!isLoginModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-sm rounded-xl bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                <button
                    onClick={closeLoginModal}
                    className="absolute right-4 top-4 rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                </button>

                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome Back</h2>
                    <p className="text-sm text-muted-foreground">
                        Sign in to write reviews and track your favorite gurus.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoggingIn}
                        className="w-full inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoggingIn ? (
                            <span className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></span>
                        ) : (
                            <GoogleIcon />
                        )}
                        {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
                    </button>
                </div>
            </div>

            {/* Backdrop click handler */}
            <div className="fixed inset-0 -z-10" onClick={closeLoginModal} aria-hidden="true" />
        </div>
    );
}
