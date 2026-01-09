'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import { useLanguage } from '@/app/components/LanguageProvider';
import { useRouter } from 'next/navigation';
import { Star, Edit2, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import ReviewForm from '@/app/components/ReviewForm';

export default function MyReviewsPage() {
    const { user, loading } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);
    const [editingReview, setEditingReview] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    const fetchReviews = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/reviews?userId=${user.uid}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoadingReviews(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [user]);

    const handleDelete = async () => {
        if (!reviewToDelete || !user) return;
        try {
            const res = await fetch(`/api/reviews/${reviewToDelete}?userId=${user.uid}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setReviews(reviews.filter(r => r._id !== reviewToDelete));
                setIsDeleteModalOpen(false);
                setReviewToDelete(null);
            }
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    if (loading || isLoadingReviews) {
        return (
            <div className="container mx-auto px-4 py-8 mt-16 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-8 mt-16 min-h-screen">
            <h1 className="text-3xl font-bold mb-8">{t.myReviews || "My Reviews"}</h1>

            {reviews.length === 0 ? (
                <div className="text-center py-16 bg-muted/20 rounded-2xl">
                    <p className="text-muted-foreground text-lg">{t.noReviewsYet || "You haven't written any reviews yet."}</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reviews.map((review) => (
                        <div key={review._id} className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Guru Info */}
                                <div className="flex items-center md:items-start gap-4 md:w-1/4 min-w-[200px] pb-4 md:pb-0 md:border-r border-border/50">
                                    <div className="h-12 w-12 rounded-full overflow-hidden bg-muted relative shrink-0">
                                        {review.guruId?.profileImage ? (
                                            <Image
                                                src={review.guruId.profileImage}
                                                alt={review.guruId.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                                                {review.guruId?.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">{review.guruId?.name}</p>
                                        <div className="text-muted-foreground text-sm">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Review Content */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            {review.title && <h3 className="font-bold text-xl mb-2">{review.title}</h3>}
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="flex text-yellow-500">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-4 w-4 ${star <= review.rating ? 'fill-current' : 'text-muted-foreground/30'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="font-medium">{review.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingReview(review)}
                                                className="p-2 hover:bg-muted rounded-full transition-colors text-blue-600"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setReviewToDelete(review._id);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="p-2 hover:bg-muted rounded-full transition-colors text-red-600"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-foreground/80 leading-relaxed">{review.text}</p>

                                    {/* Badges */}
                                    <div className="flex gap-2 mt-4">
                                        {review.isPurchased && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-400">
                                                {t.purchasedProduct || "Verified Purchase"}
                                            </span>
                                        )}
                                        {review.isScam && (
                                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full dark:bg-red-900/30 dark:text-red-400">
                                                {t.scamReport || "Scam Report"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingReview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-background rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">{t.editReview || "Edit Review"}</h2>
                                <button
                                    onClick={() => setEditingReview(null)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <ReviewForm
                                guruId={editingReview.guruId?._id}
                                reviewId={editingReview._id}
                                initialData={editingReview}
                                onSuccess={() => {
                                    setEditingReview(null);
                                    fetchReviews();
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-background rounded-xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-4">{t.deleteReviewConfirmTitle || "Delete Review?"}</h3>
                        <p className="text-muted-foreground mb-6">
                            {t.deleteReviewConfirmText || "Are you sure you want to delete this review? This action cannot be undone."}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium"
                            >
                                {t.cancel || "Cancel"}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
                            >
                                {t.delete || "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
