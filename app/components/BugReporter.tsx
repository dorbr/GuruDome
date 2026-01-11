'use client';

import { useState, useRef, useEffect } from 'react';
import { Bug, X, Send, AlertCircle, CheckCircle, Camera } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useLanguage } from './LanguageProvider';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function BugReporter() {
    const [isOpen, setIsOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
    const [isHovered, setIsHovered] = useState(false);

    // Auth & Navigation
    const { user } = useAuth();
    const pathname = usePathname();
    const { t } = useLanguage();

    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (isOpen) setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;

        setIsSubmitting(true);
        setSubmitState('idle');

        try {
            const res = await fetch('/api/bug-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reporterId: user?.uid,
                    description: description.trim(),
                    pageUrl: window.location.href,
                    userAgent: navigator.userAgent
                })
            });

            if (!res.ok) throw new Error('Failed to submit');

            setSubmitState('success');
            setDescription('');

            // Close after 2 seconds
            setTimeout(() => {
                setIsOpen(false);
                setSubmitState('idle');
            }, 2000);

        } catch (error) {
            setSubmitState('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsHovered(true);
        // Auto hide after 1.5 seconds even if still hovering
        timerRef.current = setTimeout(() => {
            setIsHovered(false);
        }, 1500);
    };

    const handleMouseLeave = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsHovered(false);
    };

    return (
        <div ref={containerRef} className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end">

            {/* Modal / Popover */}
            {isOpen && (
                <div className="mb-4 w-[300px] md:w-[350px] bg-card border border-border shadow-xl rounded-xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
                    <div className="p-4 bg-muted border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bug className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold text-sm">{t.reportBug}</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-full hover:bg-muted transition-colors"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>

                    <div className="p-4">
                        {submitState === 'success' ? (
                            <div className="flex flex-col items-center justify-center py-6 text-center animate-in zoom-in-50">
                                <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                                <h4 className="font-semibold text-foreground">{t.bugReported}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{t.bugReportedDesc}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <textarea
                                    className="w-full min-h-[100px] p-3 rounded-lg bg-background border border-input text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/70"
                                    placeholder={t.bugDescription}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    autoFocus
                                    disabled={isSubmitting}
                                />

                                {submitState === 'error' && (
                                    <div className="flex items-center gap-2 mt-2 text-xs text-red-500">
                                        <AlertCircle className="h-3 w-3" />
                                        <span>{t.somethingWentWrong}</span>
                                    </div>
                                )}

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={!description.trim() || isSubmitting}
                                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span>{t.submitBug}</span>
                                                <Send className="h-3 w-3" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={cn(
                    "flex items-center justify-center bg-card hover:bg-card/90 text-foreground border border-border shadow-lg transition-all duration-300 group",
                    isOpen ? "h-12 w-12 rounded-full rotate-90" : "h-12 rounded-full px-4 gap-2"
                )}
                aria-label={t.reportBug}
            >
                {isOpen ? (
                    <X className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                ) : (
                    <>
                        <Bug className="h-5 w-5 text-primary" />
                        <span className={cn(
                            "font-medium text-sm transition-all duration-300 overflow-hidden whitespace-nowrap",
                            isHovered ? "max-w-[100px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"
                        )}>
                            {t.reportBug}
                        </span>
                    </>
                )}
            </button>
        </div>
    );
}
