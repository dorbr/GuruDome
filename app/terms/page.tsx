'use client';

import { useLanguage } from '../components/LanguageProvider';

export default function TermsPage() {
    const { t } = useLanguage();

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl text-foreground">
            <h1 className="text-3xl font-bold mb-6">{t.termsOfServiceTitle}</h1>
            <p className="text-muted-foreground mb-4">{t.effectiveDate}: {new Date().toLocaleDateString()}</p>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsAgreementTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t.termsAgreementText}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsUseTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t.termsUseText}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsIPTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t.termsIPText}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsUserContentTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t.termsUserContentText}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsLiabilityTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t.termsLiabilityText}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsChangesTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t.termsChangesText}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsContactTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t.termsContactText}
                    </p>
                </section>
            </div>
        </div>
    );
}
