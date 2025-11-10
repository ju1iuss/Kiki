'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'

export default function FooterSection() {
    const { t } = useLanguage()
    return (
        <footer className="border-t bg-white py-8 dark:bg-transparent">
            <div className="mx-auto max-w-7xl px-6">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <span className="text-muted-foreground text-sm">
                        © {new Date().getFullYear()} {t('footer.copyright')}
                    </span>
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                        <Link
                            href="https://tasy.ai"
                            className="text-muted-foreground hover:text-foreground transition-colors">
                            {t('footer.privacy')}
                        </Link>
                        <Link
                            href="https://tasy.ai"
                            className="text-muted-foreground hover:text-foreground transition-colors">
                            {t('footer.terms')}
                        </Link>
                        <Link
                            href="https://tasy.ai"
                            className="text-muted-foreground hover:text-foreground transition-colors">
                            {t('footer.contact')}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
