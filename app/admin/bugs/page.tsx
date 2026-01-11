'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/components/LanguageProvider';
import { useAuth } from '@/app/components/AuthProvider';
import { Bug, CheckCircle, XCircle, Search, Laptop, Globe, User } from 'lucide-react';
// import { format } from 'date-fns'; -> Removing this

interface BugReport {
    _id: string;
    reporterId?: string;
    description: string;
    pageUrl?: string;
    userAgent?: string;
    screenshotUrl?: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    createdAt: string;
}

export default function BugReportsPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [reports, setReports] = useState<BugReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchReports();
        }
    }, [user]);

    const fetchReports = async () => {
        try {
            const res = await fetch('/api/admin/bugs', {
                headers: {
                    'x-firebase-uid': user?.uid || ''
                }
            });
            const data = await res.json();
            if (data.reports) {
                setReports(data.reports);
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (reportId: string, status: string) => {
        setUpdating(reportId);
        try {
            const res = await fetch('/api/admin/bugs', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-firebase-uid': user?.uid || ''
                },
                body: JSON.stringify({ reportId, status })
            });

            if (res.ok) {
                setReports(reports.map(r =>
                    r._id === reportId ? { ...r, status: status as any } : r
                ));
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bug className="h-6 w-6 text-primary" />
                        {t.admin.bugReports}
                    </h1>
                    <p className="text-muted-foreground">{t.admin.manageBugs}</p>
                </div>
            </div>

            {reports.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg border border-dashed">
                    <Bug className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <h3 className="text-lg font-medium">{t.admin.noBugsFound}</h3>
                </div>
            ) : (
                <div className="grid gap-4">
                    {reports.map((report) => (
                        <div
                            key={report._id}
                            className={`bg-card border rounded-lg p-4 transition-all ${report.status === 'resolved' ? 'opacity-60 bg-muted/30' : 'shadow-sm'
                                }`}
                        >
                            <div className="flex flex-col md:flex-row gap-4 justify-between">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${report.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            report.status === 'dismissed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
                                            {report.status}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(report.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    <p className="text-sm font-medium whitespace-pre-wrap">{report.description}</p>

                                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2">
                                        {report.pageUrl && (
                                            <div className="flex items-center gap-1 max-w-[200px] truncate" title={report.pageUrl}>
                                                <Globe className="h-3 w-3" />
                                                <a href={report.pageUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                                                    {report.pageUrl}
                                                </a>
                                            </div>
                                        )}
                                        {report.userAgent && (
                                            <div className="flex items-center gap-1 max-w-[200px] truncate" title={report.userAgent}>
                                                <Laptop className="h-3 w-3" />
                                                <span className="truncate">{report.userAgent}</span>
                                            </div>
                                        )}
                                        {report.reporterId && (
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                <span>{report.reporterId}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 pt-2 md:pt-0">
                                    {report.status !== 'resolved' && (
                                        <button
                                            onClick={() => updateStatus(report._id, 'resolved')}
                                            disabled={!!updating}
                                            className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 rounded-full transition-colors"
                                            title={t.admin.markResolved}
                                        >
                                            <CheckCircle className="h-5 w-5" />
                                        </button>
                                    )}
                                    {report.status !== 'dismissed' && (
                                        <button
                                            onClick={() => updateStatus(report._id, 'dismissed')}
                                            disabled={!!updating}
                                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-full transition-colors"
                                            title={t.admin.markDismissed}
                                        >
                                            <XCircle className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
