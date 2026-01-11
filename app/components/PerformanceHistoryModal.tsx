'use client';

import { useState } from 'react';
import { X, TrendingUp, ChevronRight } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import PerformanceChart from './PerformanceChart';

interface PerformanceHistoryModalProps {
    data: any[];
    className?: string; // Allow passing button styles
}

export default function PerformanceHistoryModal({ data, className }: PerformanceHistoryModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLanguage();

    const openModal = () => {
        setIsOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setIsOpen(false);
        document.body.style.overflow = 'unset';
    };

    return (
        <>
            <button
                onClick={openModal}
                className={`flex items-center justify-between w-full text-sm font-semibold text-primary hover:text-primary/80 transition-colors group ${className || ''}`}
            >
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>{t.history || 'Progress Over Time'}</span>
                </div>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-border"
                        role="dialog"
                        aria-modal="true"
                    >
                        <button
                            onClick={closeModal}
                            className="absolute right-4 top-4 rtl:right-auto rtl:left-4 rounded-full p-2 hover:bg-muted transition-colors"
                        >
                            <X className="h-5 w-5 opacity-70" />
                            <span className="sr-only">Close</span>
                        </button>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                {t.history || 'Progress Over Time'}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {t.historyDescription || 'Visualize how the guru\'s reputation has evolved based on user reviews.'}
                            </p>
                        </div>

                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                            <PerformanceChart data={data} />
                        </div>
                    </div>

                    {/* Backdrop click handler */}
                    <div className="fixed inset-0 -z-10" onClick={closeModal} aria-hidden="true" />
                </div>
            )}
        </>
    );
}
