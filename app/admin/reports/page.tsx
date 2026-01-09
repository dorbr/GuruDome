'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import { useSearchParams } from 'next/navigation';
import {
    ChevronLeft,
    ChevronRight,
    Flag,
    Check,
    X,
    Trash2,
    MessageSquare,
    AlertTriangle,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface Report {
    _id: string;
    reviewId: {
        _id: string;
        title?: string;
        text?: string;
        rating: number;
        userId: string;
        guruId: {
            _id: string;
            name: string;
            profileImage?: string;
        };
    };
    reporterId: string;
    reason: string;
    description?: string;
    status: 'pending' | 'reviewed' | 'dismissed' | 'removed';
    createdAt: string;
    reporter?: {
        displayName?: string;
        email: string;
    };
    reviewAuthor?: {
        displayName?: string;
        email: string;
    };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

const reasonLabels: Record<string, string> = {
    false_information: 'False Information',
    offensive_content: 'Offensive Content',
    spam: 'Spam',
    other: 'Other',
};

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    reviewed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    dismissed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    removed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminReportsPage() {
    const { user: currentUser } = useAuth();
    const searchParams = useSearchParams();

    const [reports, setReports] = useState<Report[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'pending');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchReports = async (page = 1) => {
        if (!currentUser) return;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                status: statusFilter,
            });

            const response = await fetch(`/api/admin/reports?${params}`, {
                headers: { 'x-firebase-uid': currentUser.uid },
            });

            if (!response.ok) throw new Error('Failed to fetch reports');

            const data = await response.json();
            setReports(data.reports);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [currentUser, statusFilter]);

    const handleAction = async (reportId: string, action: string) => {
        if (!currentUser) return;

        setActionLoading(reportId);
        try {
            const response = await fetch('/api/admin/reports', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-firebase-uid': currentUser.uid,
                },
                body: JSON.stringify({ reportId, action }),
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data.error || 'Action failed');
                return;
            }

            fetchReports(pagination?.page || 1);
        } catch (error) {
            console.error('Error performing action:', error);
            alert('Failed to perform action');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Reports</h1>
                <p className="text-muted-foreground">Handle reported reviews</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="dismissed">Dismissed</option>
                    <option value="removed">Removed</option>
                    <option value="all">All</option>
                </select>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{pagination?.total || 0} reports total</span>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
                    ))
                ) : reports.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-xl">
                        <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No {statusFilter !== 'all' ? statusFilter : ''} reports found</p>
                    </div>
                ) : (
                    reports.map((report) => (
                        <div key={report._id} className="border rounded-xl p-4 bg-card">
                            <div className="flex gap-4">
                                {/* Guru Avatar */}
                                <div className="flex-shrink-0">
                                    {report.reviewId?.guruId && (
                                        <Link href={`/guru/${report.reviewId.guruId._id}`} className="block">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                                {report.reviewId.guruId.profileImage ? (
                                                    <img src={report.reviewId.guruId.profileImage} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-sm font-bold text-primary">
                                                        {report.reviewId.guruId.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    )}
                                </div>

                                {/* Report Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[report.status]}`}>
                                                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                                </span>
                                                <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full">
                                                    {reasonLabels[report.reason] || report.reason}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Reported by: {report.reporter?.displayName || report.reporter?.email || 'Unknown'}
                                            </p>
                                        </div>
                                        <span className="text-xs text-muted-foreground flex-shrink-0">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Reported Review */}
                                    {report.reviewId && (
                                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">Reported Review</span>
                                                <Link
                                                    href={`/guru/${report.reviewId.guruId._id}`}
                                                    className="text-xs text-primary hover:underline ml-auto"
                                                >
                                                    on {report.reviewId.guruId.name}
                                                </Link>
                                            </div>
                                            {report.reviewId.title && (
                                                <p className="font-medium text-sm">{report.reviewId.title}</p>
                                            )}
                                            {report.reviewId.text && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                    {report.reviewId.text}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-2">
                                                By: {report.reviewAuthor?.displayName || report.reviewAuthor?.email || 'Unknown'}
                                            </p>
                                        </div>
                                    )}

                                    {/* Report Description */}
                                    {report.description && (
                                        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/10 rounded border border-yellow-200 dark:border-yellow-800">
                                            <p className="text-sm">&quot;{report.description}&quot;</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {report.status === 'pending' && (
                                        <div className="flex items-center gap-2 mt-4">
                                            <button
                                                onClick={() => handleAction(report._id, 'dismiss')}
                                                disabled={actionLoading === report._id}
                                                className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                                            >
                                                <X className="h-4 w-4" />
                                                Dismiss
                                            </button>
                                            <button
                                                onClick={() => handleAction(report._id, 'reviewed')}
                                                disabled={actionLoading === report._id}
                                                className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                                            >
                                                <Check className="h-4 w-4" />
                                                Mark Reviewed
                                            </button>
                                            <button
                                                onClick={() => handleAction(report._id, 'removeReview')}
                                                disabled={actionLoading === report._id}
                                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Remove Review
                                            </button>
                                            {actionLoading === report._id && (
                                                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchReports(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="p-2 border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-sm">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <button
                            onClick={() => fetchReports(pagination.page + 1)}
                            disabled={pagination.page >= pagination.pages}
                            className="p-2 border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
