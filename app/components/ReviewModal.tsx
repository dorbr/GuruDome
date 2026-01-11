'use client';

import { useState } from 'react';
import { X, PenLine, LogIn } from 'lucide-react';
import ReviewForm from './ReviewForm';
import { useAuth } from './AuthProvider';
import { useLanguage } from './LanguageProvider';

// Internal component to handle auth state for the form
function ProtectedReviewForm({ guruId, onSuccess }: { guruId: string; onSuccess: () => void }) {
    const { user, signInWithGoogle } = useAuth();
    const { language } = useLanguage();

    const authRequiredTitle = language === 'he' ? 'נדרש אימות' : 'Authentication Required';
    const authRequiredDesc = language === 'he'
        ? 'אנא התחבר עם גוגל כדי לכתוב ביקורת מאומתת. זה עוזר לנו למנוע ספאם וזיופים.'
        : 'Please sign in with Google to write a verified review. This helps us prevent spam and fakes.';
    const signInWithGoogleText = language === 'he' ? 'התחבר עם גוגל' : 'Sign in with Google';

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <LogIn className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{authRequiredTitle}</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        {authRequiredDesc}
                    </p>
                </div>
                <button
                    onClick={() => signInWithGoogle()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
                    </svg>
                    {signInWithGoogleText}
                </button>
            </div>
        );
    }

    return <ReviewForm guruId={guruId} onSuccess={onSuccess} />;
}

export default function ReviewModal({ guruId, className }: { guruId: string; className?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLanguage();

    const shareExperience = t.language === 'שפה'
        ? 'שתף את החוויה שלך עם הקהילה.'
        : 'Share your experience with the community.';

    const openModal = () => {
        setIsOpen(true);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setIsOpen(false);
        // Restore body scroll
        document.body.style.overflow = 'unset';
    };

    return (
        <>
            <button
                onClick={openModal}
                className={`inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className || 'w-full'}`}
            >
                <PenLine className="h-4 w-4" />
                {t.writeReview}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200"
                        role="dialog"
                        aria-modal="true"
                    >
                        <button
                            onClick={closeModal}
                            className="absolute right-4 top-4 rtl:right-auto rtl:left-4 rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </button>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold tracking-tight">{t.writeReview}</h2>
                            <p className="text-sm text-muted-foreground">
                                {shareExperience}
                            </p>
                        </div>

                        <ProtectedReviewForm guruId={guruId} onSuccess={closeModal} />
                    </div>

                    {/* Backdrop click handler */}
                    <div className="fixed inset-0 -z-10" onClick={closeModal} aria-hidden="true" />
                </div>
            )}
        </>
    );
}
