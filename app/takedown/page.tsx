'use client';

import { useLanguage } from '../components/LanguageProvider';

export default function TakedownPage() {
    const { t } = useLanguage();

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl text-foreground">
            <h1 className="text-3xl font-bold mb-6">{t.takedownPolicy.title}</h1>
            <p className="text-muted-foreground mb-4">{t.takedownPolicy.lastUpdated} {new Date().toLocaleDateString()}</p>
            <p className="text-muted-foreground mb-8 leading-relaxed whitespace-pre-line">
                {t.takedownPolicy.intro}
            </p>

            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.takedownPolicy.howToSubmitTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.takedownPolicy.howToSubmitText}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.takedownPolicy.processTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.takedownPolicy.processList}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">{t.takedownPolicy.counterNoticeTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.takedownPolicy.counterNoticeText}
                    </p>
                </section>
            </div>
        </div>
    );
}
