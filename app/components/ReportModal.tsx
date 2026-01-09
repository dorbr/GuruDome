'use client';

import { useState } from 'react';
import { X, Flag, CheckCircle, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useLanguage } from './LanguageProvider';

interface ReportModalProps {
    reviewId: string;
    isOpen: boolean;
    onClose: () => void;
}

type ReportReason = 'false_information' | 'offensive_content' | 'spam' | 'other';

export default function ReportModal({ reviewId, isOpen, onClose }: ReportModalProps) {
    const { t } = useLanguage();
    const [reason, setReason] = useState<ReportReason | ''>('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error' | 'already_reported'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const user = auth?.currentUser;
        if (!user || !reason) return;

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const res = await fetch(`/api/reviews/${reviewId}/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reporterId: user.uid,
                    reason,
                    description: description.trim() || undefined
                })
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.error === 'You have already reported this review') {
                    setSubmitState('already_reported');
                } else {
                    setSubmitState('error');
                    setErrorMessage(data.error || 'Something went wrong');
                }
                return;
            }

            setSubmitState('success');
        } catch {
            setSubmitState('error');
            setErrorMessage('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setReason('');
        setDescription('');
        setSubmitState('idle');
        setErrorMessage('');
        onClose();
    };

    const reasons: ReportReason[] = ['false_information', 'offensive_content', 'spam', 'other'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Success State */}
                {submitState === 'success' && (
                    <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">{t.reportSubmitted}</h3>
                        <p className="text-muted-foreground mb-6">{t.reportSubmittedDesc}</p>
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                        >
                            OK
                        </button>
                    </div>
                )}

                {/* Already Reported State */}
                {submitState === 'already_reported' && (
                    <div className="text-center py-8">
                        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">{t.alreadyReported}</h3>
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors mt-4"
                        >
                            OK
                        </button>
                    </div>
                )}

                {/* Error State */}
                {submitState === 'error' && (
                    <div className="text-center py-8">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">{t.somethingWentWrong}</h3>
                        <p className="text-muted-foreground mb-6">{errorMessage}</p>
                        <button
                            onClick={() => setSubmitState('idle')}
                            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Form State */}
                {submitState === 'idle' && (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                                <Flag className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold">{t.reportReview}</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Reason Select */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t.reportReason} *
                                </label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value as ReportReason)}
                                    required
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">{t.selectRating}</option>
                                    {reasons.map((r) => (
                                        <option key={r} value={r}>
                                            {t.reportReasons[r]}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Description Textarea */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t.reportDescription}
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t.reportDescriptionPlaceholder}
                                    rows={3}
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-3 rounded-lg border font-medium hover:bg-muted transition-colors"
                                >
                                    {t.cancelReport}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !reason}
                                    className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? '...' : t.submitReport}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
