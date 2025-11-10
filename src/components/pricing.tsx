'use client'

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'

export default function Pricing() {
    const { t } = useLanguage()
    return (
        <div id="pricing" className="relative py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-balance text-3xl font-medium md:text-4xl lg:text-5xl" style={{ letterSpacing: '-0.05em' }}>{t('pricing.title')}</h2>
                </div>
                <div className="mt-8 md:mt-20">
                    <div className="bg-card relative border-2 shadow-2xl shadow-zinc-950/5">
                        <div className="grid items-center gap-12 divide-y divide-gray-300 dark:divide-gray-700 p-12 md:grid-cols-2 md:divide-x md:divide-y-0">
                            <div className="pb-12 text-center md:pb-0 md:pr-12">
                                <h3 className="text-2xl font-semibold">{t('pricing.perAccount')}</h3>
                                <p className="mt-2 text-lg">{t('pricing.scale')}</p>
                                <span className="mb-6 mt-12 inline-block text-6xl font-bold">
                                    <span className="text-4xl">€</span>{t('pricing.price').replace('€', '')}
                                </span>
                                <p className="text-muted-foreground text-sm">{t('pricing.perMonth')}</p>

                                <div className="flex justify-center mt-8">
                                <Button
                                    asChild
                                    size="lg"
                                    className="active:scale-95 transition-transform duration-150">
                                    <Link href="/apply">{t('pricing.cta')}</Link>
                                </Button>
                                </div>

                                <p className="text-muted-foreground mt-12 text-sm">{t('pricing.description')}</p>
                            </div>
                            <div className="relative">
                                <ul
                                    role="list"
                                    className="space-y-4">
                                    {[
                                        t('pricing.feature1'),
                                        t('pricing.feature2'),
                                        t('pricing.feature3'),
                                        t('pricing.feature4'),
                                        t('pricing.feature5'),
                                        t('pricing.feature6')
                                    ].map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-2">
                                            <Check className="size-3" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-muted-foreground mt-6 text-sm">{t('pricing.footer')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
