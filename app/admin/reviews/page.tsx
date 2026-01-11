'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import { useSearchParams } from 'next/navigation';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Star,
    Eye,
    EyeOff,
    Trash2,
    AlertTriangle,
    Flag,
    MoreHorizontal,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface Review {
    _id: string;
    userId: string;
    guruId: {
        _id: string;
        name: string;
        profileImage?: string;
    };
    title?: string;
    rating: number;
    text?: string;
    isScam: boolean;
    isHidden: boolean;
    reportCount: number;
    createdAt: string;
    user?: {
        displayName?: string;
        email: string;
        photoURL?: string;
    };
    aiAnalysis?: {
        isFake: boolean;
        confidence: number;
        reasoning: string;
    };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export default function AdminReviewsPage() {
    const { user: currentUser, isAdmin } = useAuth();
    const searchParams = useSearchParams();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState(searchParams.get('filter') || 'all');
    const [guruId, setGuruId] = useState(searchParams.get('guruId') || '');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchReviews = async (page = 1) => {
        if (!currentUser) return;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                filter: filterType,
            });
            if (guruId) params.set('guruId', guruId);

            const response = await fetch(`/api/admin/reviews?${params}`, {
                headers: { 'x-firebase-uid': currentUser.uid },
            });

            if (!response.ok) throw new Error('Failed to fetch reviews');

            const data = await response.json();
            setReviews(data.reviews);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [currentUser, filterType, guruId]);

    const handleAction = async (reviewId: string, action: string) => {
        if (!currentUser) return;

        setActionLoading(reviewId);
        try {
            const response = await fetch('/api/admin/reviews', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-firebase-uid': currentUser.uid,
                },
                body: JSON.stringify({ reviewId, action }),
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data.error || 'Action failed');
                return;
            }

            fetchReviews(pagination?.page || 1);
        } catch (error) {
            console.error('Error performing action:', error);
            alert('Failed to perform action');
        } finally {
            setActionLoading(null);
            setOpenDropdown(null);
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!currentUser || !isAdmin) return;

        const confirmed = confirm('Are you sure you want to permanently delete this review? This action cannot be undone.');
        if (!confirmed) return;

        setActionLoading(reviewId);
        try {
            const response = await fetch(`/api/admin/reviews?id=${reviewId}`, {
                method: 'DELETE',
                headers: { 'x-firebase-uid': currentUser.uid },
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data.error || 'Failed to delete review');
                return;
            }

            fetchReviews(pagination?.page || 1);
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review');
        } finally {
            setActionLoading(null);
            setOpenDropdown(null);
        }
    };

    const renderStars = (rating: number) => (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-3 w-3 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                        }`}
                />
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Reviews</h1>
                <p className="text-muted-foreground">Moderate and manage reviews</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="all">All Reviews</option>
                    <option value="flagged">Flagged (Reported)</option>
                    <option value="hidden">Hidden</option>
                    <option value="scam">Scam Reports</option>
                    <option value="ai_fake">AI Flagged (Potential Fake)</option>
                </select>
                {guruId && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                        <span className="text-sm">Filtering by guru</span>
                        <button
                            onClick={() => setGuruId('')}
                            className="text-xs text-primary hover:underline"
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{pagination?.total || 0} reviews total</span>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                    ))
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-xl">
                        No reviews found
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review._id}
                            className={`border rounded-xl p-4 bg-card relative ${review.isHidden ? 'opacity-60' : ''
                                } ${review.isScam ? 'border-red-500/50' : ''}`}
                        >
                            {/* Status Badges */}
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                {review.isHidden && (
                                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center gap-1">
                                        <EyeOff className="h-3 w-3" />
                                        Hidden
                                    </span>
                                )}
                                {review.isScam && (
                                    <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        Scam Report
                                    </span>
                                )}
                                {review.reportCount > 0 && (
                                    <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full flex items-center gap-1">
                                        <Flag className="h-3 w-3" />
                                        {review.reportCount} reports
                                    </span>
                                )}
                                {review.aiAnalysis?.isFake && (
                                    <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center gap-1" title={review.aiAnalysis.reasoning}>
                                        <span>🤖</span>
                                        AI Flagged ({review.aiAnalysis.confidence}%)
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-4">
                                {/* Guru Info */}
                                <div className="flex-shrink-0">
                                    <Link href={`/guru/${review.guruId._id}`} className="block">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                            {review.guruId.profileImage ? (
                                                <img src={review.guruId.profileImage} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-bold text-primary">
                                                    {review.guruId.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                </div>

                                {/* Review Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <Link
                                                href={`/guru/${review.guruId._id}`}
                                                className="font-medium hover:text-primary transition-colors"
                                            >
                                                {review.guruId.name}
                                            </Link>
                                            <div className="flex items-center gap-2 mt-1">
                                                {renderStars(review.rating)}
                                                <span className="text-xs text-muted-foreground">
                                                    by {review.user?.displayName || review.user?.email || 'Unknown User'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {review.title && (
                                        <h4 className="font-medium mt-2">{review.title}</h4>
                                    )}
                                    {review.text && (
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                                            {review.text}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0 relative">
                                    <button
                                        onClick={() => setOpenDropdown(openDropdown === review._id ? null : review._id)}
                                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                                        disabled={actionLoading === review._id}
                                    >
                                        {actionLoading === review._id ? (
                                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <MoreHorizontal className="h-4 w-4" />
                                        )}
                                    </button>

                                    {openDropdown === review._id && (
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-card border rounded-lg shadow-lg z-10 py-1">
                                            <Link
                                                href={`/guru/${review.guruId._id}`}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                View Guru
                                            </Link>
                                            {review.isHidden ? (
                                                <button
                                                    onClick={() => handleAction(review._id, 'show')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Show Review
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleAction(review._id, 'hide')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                                                >
                                                    <EyeOff className="h-4 w-4" />
                                                    Hide Review
                                                </button>
                                            )}
                                            {review.reportCount > 0 && (
                                                <button
                                                    onClick={() => handleAction(review._id, 'clearReports')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                                                >
                                                    <Flag className="h-4 w-4" />
                                                    Clear Reports
                                                </button>
                                            )}
                                            {isAdmin && (
                                                <>
                                                    <div className="border-t my-1" />
                                                    <button
                                                        onClick={() => handleDelete(review._id)}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 text-red-500"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete Permanently
                                                    </button>
                                                </>
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
                            onClick={() => fetchReviews(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="p-2 border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-sm">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <button
                            onClick={() => fetchReviews(pagination.page + 1)}
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
