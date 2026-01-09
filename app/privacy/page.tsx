'use client';

import { useLanguage } from '../components/LanguageProvider';

export default function PrivacyPage() {
    const { t } = useLanguage();

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl text-foreground">
            <h1 className="text-3xl font-bold mb-6">{t.privacyPolicyTitle}</h1>
            <p className="text-muted-foreground mb-4">{t.effectiveDate}: {new Date().toLocaleDateString()}</p>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.privacyIntroTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t.privacyIntroText}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.privacyCollectTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t.privacyCollectText}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.privacyUseTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t.privacyUseText}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.privacyCookiesTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t.privacyCookiesText}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.privacySecurityTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t.privacySecurityText}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.privacyRightsTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t.privacyRightsText}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.privacyContactTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t.privacyContactText}
                    </p>
                </section>
            </div>
        </div>
    );
}
