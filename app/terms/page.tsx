'use client';

import { useLanguage } from '../components/LanguageProvider';

export default function TermsPage() {
    const { t } = useLanguage();

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl text-foreground">
            <h1 className="text-3xl font-bold mb-6">{t.termsOfServiceTitle}</h1>
            <p className="text-muted-foreground mb-4">{t.termsLastUpdated} {new Date().toLocaleDateString()}</p>
            <p className="text-muted-foreground mb-8 leading-relaxed whitespace-pre-line">
                {t.termsIntro}
            </p>

            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsSection1Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.termsSection1Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsSection2Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.termsSection2Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsSection3Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.termsSection3Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsSection4Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.termsSection4Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsSection5Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.termsSection5Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsSection6Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.termsSection6Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsSection7Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.termsSection7Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsSection8Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.termsSection8Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsSection9Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.termsSection9Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsSection10Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.termsSection10Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsSection11Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.termsSection11Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsSection12Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.termsSection12Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsSection13Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.termsSection13Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsSection14Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.termsSection14Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsSection15Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.termsSection15Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsSection16Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.termsSection16Text}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.termsSection17Title}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.termsSection17Text}
                    </p>
                </section>
            </div>
        </div>
    );
}
