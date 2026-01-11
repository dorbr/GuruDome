'use client';

import { useLanguage } from '../components/LanguageProvider';

export default function PrivacyPage() {
    const { t } = useLanguage();

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl text-foreground">
            <h1 className="text-3xl font-bold mb-6">{t.privacyPolicyTitle}</h1>
            <p className="text-muted-foreground mb-4">{t.privacyLastUpdated} {new Date().toLocaleDateString()}</p>
            <p className="text-muted-foreground mb-8 whitespace-pre-line">{t.privacyIntro}</p>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.privacySection1Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.privacySection1Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.privacySection2Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.privacySection2Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.privacySection3Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.privacySection3Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.privacySection4Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.privacySection4Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.privacySection5Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.privacySection5Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.privacySection6Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.privacySection6Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.privacySection7Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.privacySection7Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.privacySection8Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.privacySection8Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.privacySection9Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.privacySection9Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.privacySection10Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.privacySection10Text}
                    </p>
                </section>
            </div>
        </div>
    );
}
