'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Shield,
    Ban,
    CheckCircle,
    AlertTriangle,
    MoreHorizontal
} from 'lucide-react';

interface User {
    _id: string;
    firebaseUid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role: 'user' | 'moderator' | 'admin';
    isBanned: boolean;
    bannedReason?: string;
    createdAt: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export default function AdminUsersPage() {
    const { user: currentUser, isAdmin } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '');
    const [bannedFilter, setBannedFilter] = useState(searchParams.get('banned') || '');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left?: number; right?: number } | null>(null);

    const fetchUsers = async (page = 1) => {
        if (!currentUser) return;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
            });
            if (search) params.set('search', search);
            if (roleFilter) params.set('role', roleFilter);
            if (bannedFilter) params.set('banned', bannedFilter);

            const response = await fetch(`/api/admin/users?${params}`, {
                headers: { 'x-firebase-uid': currentUser.uid },
            });

            if (!response.ok) throw new Error('Failed to fetch users');

            const data = await response.json();
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentUser, roleFilter, bannedFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers(1);
    };

    const handleAction = async (userId: string, action: string, role?: string, reason?: string) => {
        if (!currentUser) return;

        setActionLoading(userId);
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-firebase-uid': currentUser.uid,
                },
                body: JSON.stringify({ userId, action, role, reason }),
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data.error || 'Action failed');
                return;
            }

            // Refresh users list
            fetchUsers(pagination?.page || 1);
        } catch (error) {
            console.error('Error performing action:', error);
            alert('Failed to perform action');
        } finally {
            setActionLoading(null);
            setOpenDropdown(null);
        }
    };

    const getRoleBadge = (role: string) => {
        const colors = {
            admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            moderator: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            user: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        };
        return colors[role as keyof typeof colors] || colors.user;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Users</h1>
                <p className="text-muted-foreground">Manage user accounts and roles</p>
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
                            placeholder="Search by email or name..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </form>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="">All Roles</option>
                    <option value="user">Users</option>
                    <option value="moderator">Moderators</option>
                    <option value="admin">Admins</option>
                </select>
                <select
                    value={bannedFilter}
                    onChange={(e) => setBannedFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="">All Status</option>
                    <option value="false">Active</option>
                    <option value="true">Banned</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Role</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Joined</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="px-4 py-4">
                                            <div className="h-8 bg-muted animate-pulse rounded" />
                                        </td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                                    {user.photoURL ? (
                                                        <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-bold text-primary">
                                                            {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="font-medium truncate max-w-[150px]">
                                                    {user.displayName || 'No name'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-[200px]">
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getRoleBadge(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.isBanned ? (
                                                <div className="flex items-center gap-1 text-red-500">
                                                    <Ban className="h-4 w-4" />
                                                    <span className="text-xs">Banned</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-green-500">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-xs">Active</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={(e) => {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        const dropdownWidth = 200; // w-48 is 12rem (192px), adding buffer

                                                        // Check if there's enough space on the left to align right
                                                        // If rect.right is less than dropdown width, we might clip left if we align right
                                                        if (rect.right < dropdownWidth) {
                                                            setDropdownPosition({
                                                                top: rect.bottom,
                                                                left: rect.left
                                                            });
                                                        } else {
                                                            setDropdownPosition({
                                                                top: rect.bottom,
                                                                right: window.innerWidth - rect.right
                                                            });
                                                        }
                                                        setOpenDropdown(openDropdown === user._id ? null : user._id);
                                                    }}
                                                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                                                    disabled={actionLoading === user._id}
                                                >
                                                    {actionLoading === user._id ? (
                                                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
                        <p className="text-sm text-muted-foreground">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchUsers(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="p-2 border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-sm">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => fetchUsers(pagination.page + 1)}
                                disabled={pagination.page >= pagination.pages}
                                className="p-2 border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Action Menu */}
            {openDropdown && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenDropdown(null)}
                    />
                    <div
                        className="fixed z-50 bg-card border rounded-lg shadow-lg py-1 w-48 animate-in fade-in zoom-in-95 duration-200"
                        style={{
                            top: dropdownPosition?.top ? dropdownPosition.top + 4 : 0,
                            right: dropdownPosition?.right,
                            left: dropdownPosition?.left,
                        }}
                    >
                        {(() => {
                            const user = users.find(u => u._id === openDropdown);
                            if (!user) return null;

                            return (
                                <>
                                    {isAdmin && (
                                        <>
                                            <button
                                                onClick={() => handleAction(user._id, 'changeRole', 'user')}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                                            >
                                                <Shield className="h-4 w-4" />
                                                Set as User
                                            </button>
                                            <button
                                                onClick={() => handleAction(user._id, 'changeRole', 'moderator')}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                                            >
                                                <Shield className="h-4 w-4 text-blue-500" />
                                                Set as Moderator
                                            </button>
                                            <button
                                                onClick={() => handleAction(user._id, 'changeRole', 'admin')}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                                            >
                                                <Shield className="h-4 w-4 text-red-500" />
                                                Set as Admin
                                            </button>
                                            <div className="border-t my-1" />
                                        </>
                                    )}
                                    {user.isBanned ? (
                                        <button
                                            onClick={() => handleAction(user._id, 'unban')}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 text-green-600"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Unban User
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                const reason = prompt('Reason for ban:');
                                                if (reason !== null) {
                                                    handleAction(user._id, 'ban', undefined, reason);
                                                }
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 text-red-500"
                                        >
                                            <Ban className="h-4 w-4" />
                                            Ban User
                                        </button>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </>
            )}
        </div>
    );
}
