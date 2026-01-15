'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { useLanguage } from '../components/LanguageProvider';

const CATEGORIES = [
    'Dropshipping',
    'Crypto/Forex',
    'Real Estate',
    'Marketing',
    'Fitness',
    'Lifestyle',
    'Beauty',
    'Stocks',
    'Other',
];

const CATEGORY_KEYS: Record<string, keyof typeof import('@/lib/i18n').en.categories> = {
    'Dropshipping': 'dropshipping',
    'Crypto/Forex': 'cryptoForex',
    'Real Estate': 'realEstate',
    'Marketing': 'marketing',
    'Fitness': 'fitness',
    'Lifestyle': 'lifestyle',
    'Beauty': 'beauty',
    'Stocks': 'stocks',
    'Other': 'other',
};

export default function AddGuruPage() {
    const router = useRouter();
    const { user, loading, openLoginModal } = useAuth();
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        socialUrl: '',
        category: '',
        bio: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [duplicateGuruId, setDuplicateGuruId] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setDuplicateGuruId(null);

        try {
            const res = await fetch('/api/gurus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 409 && data.existingGuruId) {
                    setDuplicateGuruId(data.existingGuruId);
                    throw new Error(t.guruExistsError);
                }
                if (res.status === 400 && data.error === "Could not capture Instagram username from this URL") {
                    throw new Error(t.invalidInstagramUrl);
                }
                throw new Error(data.error || 'Failed to add guru');
            }

            const newGuru = data;
            router.push(`/guru/${newGuru._id}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col">

                <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <div className="max-w-md space-y-6">
                        <h1 className="text-3xl font-bold tracking-tight">{t.loginRequired}</h1>
                        <p className="text-muted-foreground text-lg">
                            {t.loginRequiredSubtitle}
                        </p>
                        <div className="flex justify-center">
                            <button
                                onClick={openLoginModal}
                                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                            >
                                {t.login}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">


            <main className="flex-1 flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight">{t.addGuruTitle}</h1>
                        <p className="mt-2 text-muted-foreground">
                            {t.addGuruSubtitle}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-xl border bg-card p-8 shadow-sm">
                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                                {error === t.guruExistsError && duplicateGuruId ? (
                                    <span>
                                        {t.guruExistsError}{" "}
                                        <a href={`/guru/${duplicateGuruId}`} className="underline font-bold hover:text-destructive/80">
                                            {t.viewExistingGuru}
                                        </a>
                                    </span>
                                ) : (
                                    error
                                )}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium">{t.guruName}</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder={t.guruNamePlaceholder}
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="socialUrl" className="block text-sm font-medium">{t.socialUrl}</label>
                                <input
                                    id="socialUrl"
                                    name="socialUrl"
                                    type="url"
                                    required
                                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder={t.socialUrlPlaceholder}
                                    value={formData.socialUrl}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-sm font-medium">{t.category}</label>
                                <select
                                    id="category"
                                    name="category"
                                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="">{t.selectCategory}</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {t.categories[CATEGORY_KEYS[cat]]}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium">{t.bioOptional}</label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder={t.shortDescription}
                                    value={formData.bio}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                        >
                            {isSubmitting ? t.adding : t.addGuru}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
