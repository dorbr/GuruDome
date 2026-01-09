'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import { useSearchParams } from 'next/navigation';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Star,
    MessageSquare,
    Trash2,
    Edit,
    ExternalLink,
    MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';

interface Guru {
    _id: string;
    name: string;
    instagramUrl: string;
    profileImage?: string;
    category?: string;
    ratingStats: {
        averageRating: number;
        totalReviews: number;
    };
    createdAt: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export default function AdminGurusPage() {
    const { user: currentUser, isAdmin } = useAuth();
    const searchParams = useSearchParams();

    const [gurus, setGurus] = useState<Guru[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'createdAt');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const categories = [
        'dropshipping',
        'cryptoForex',
        'realEstate',
        'marketing',
        'fitness',
        'lifestyle',
        'other'
    ];

    const fetchGurus = async (page = 1) => {
        if (!currentUser) return;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                sort: sortBy,
            });
            if (search) params.set('search', search);
            if (categoryFilter) params.set('category', categoryFilter);

            const response = await fetch(`/api/admin/gurus?${params}`, {
                headers: { 'x-firebase-uid': currentUser.uid },
            });

            if (!response.ok) throw new Error('Failed to fetch gurus');

            const data = await response.json();
            setGurus(data.gurus);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching gurus:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGurus();
    }, [currentUser, categoryFilter, sortBy]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchGurus(1);
    };

    const handleDelete = async (guruId: string, guruName: string) => {
        if (!currentUser || !isAdmin) return;

        const confirmed = confirm(`Are you sure you want to delete "${guruName}"? This will also delete all associated reviews. This action cannot be undone.`);
        if (!confirmed) return;

        setActionLoading(guruId);
        try {
            const response = await fetch(`/api/admin/gurus?id=${guruId}`, {
                method: 'DELETE',
                headers: { 'x-firebase-uid': currentUser.uid },
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data.error || 'Failed to delete guru');
                return;
            }

            fetchGurus(pagination?.page || 1);
        } catch (error) {
            console.error('Error deleting guru:', error);
            alert('Failed to delete guru');
        } finally {
            setActionLoading(null);
            setOpenDropdown(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Gurus</h1>
                <p className="text-muted-foreground">Manage guru profiles</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or Instagram..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </form>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="createdAt">Newest</option>
                    <option value="name">Name A-Z</option>
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviews</option>
                </select>
            </div>

            {/* Gurus Grid/Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
                    ))
                ) : gurus.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No gurus found
                    </div>
                ) : (
                    gurus.map((guru) => (
                        <div key={guru._id} className="border rounded-xl bg-card overflow-hidden hover:shadow-lg transition-shadow relative">
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {guru.profileImage ? (
                                            <img src={guru.profileImage} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-lg font-bold text-primary">
                                                {guru.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold truncate">{guru.name}</h3>
                                        <p className="text-sm text-muted-foreground truncate">{guru.instagramUrl}</p>
                                        {guru.category && (
                                            <span className="inline-block text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full mt-1">
                                                {guru.category}
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={() => setOpenDropdown(openDropdown === guru._id ? null : guru._id)}
                                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                                            disabled={actionLoading === guru._id}
                                        >
                                            {actionLoading === guru._id ? (
                                                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <MoreHorizontal className="h-4 w-4" />
                                            )}
                                        </button>

                                        {openDropdown === guru._id && (
                                            <div className="absolute right-0 top-full mt-1 w-48 bg-card border rounded-lg shadow-lg z-10 py-1">
                                                <Link
                                                    href={`/guru/${guru._id}`}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    View Profile
                                                </Link>
                                                <Link
                                                    href={`/admin/reviews?guruId=${guru._id}`}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                    View Reviews
                                                </Link>
                                                {isAdmin && (
                                                    <>
                                                        <div className="border-t my-1" />
                                                        <button
                                                            onClick={() => handleDelete(guru._id, guru.name)}
                                                            className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 text-red-500"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete Guru
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span className="font-medium">{guru.ratingStats.averageRating.toFixed(1)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <MessageSquare className="h-4 w-4" />
                                        <span className="text-sm">{guru.ratingStats.totalReviews} reviews</span>
                                    </div>
                                    <div className="ml-auto text-xs text-muted-foreground">
                                        {new Date(guru.createdAt).toLocaleDateString()}
                                    </div>
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
                            onClick={() => fetchGurus(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="p-2 border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-sm">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <button
                            onClick={() => fetchGurus(pagination.page + 1)}
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
