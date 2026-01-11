'use client';

import { useLanguage } from '../components/LanguageProvider';

export default function CommunityGuidelinesPage() {
    const { t } = useLanguage();

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl text-foreground">
            <h1 className="text-3xl font-bold mb-6">{t.communityGuidelinesTitle}</h1>
            <p className="text-muted-foreground mb-4">{t.communityLastUpdated} {new Date().toLocaleDateString()}</p>
            <p className="text-muted-foreground mb-8 text-lg">{t.communityIntro}</p>

            <div className="space-y-8">
                {/* Allowed */}
                <section className="bg-green-50 dark:bg-green-900/10 p-6 rounded-xl border border-green-100 dark:border-green-900/30">
                    <h2 className="text-xl font-bold mb-4 text-green-700 dark:text-green-400">{t.communityAllowedTitle}</h2>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                        {t.communityAllowedList}
                    </p>
                </section>

                {/* Not Allowed */}
                <section className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-100 dark:border-red-900/30">
                    <h2 className="text-xl font-bold mb-4 text-red-700 dark:text-red-400">{t.communityNotAllowedTitle}</h2>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                        {t.communityNotAllowedList}
                    </p>
                </section>

                {/* Write Safer Reviews */}
                <section className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-400">{t.communitySafeReviewsTitle}</h2>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                        {t.communitySafeReviewsList}
                    </p>
                </section>

                <div className="pt-4 border-t border-border">
                    <p className="text-muted-foreground font-medium mb-4">{t.communityViolations}</p>
                    <p className="text-muted-foreground">{t.communityReport}</p>
                </div>
            </div>
        </div>
    );
}
