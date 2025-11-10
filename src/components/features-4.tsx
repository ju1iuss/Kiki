'use client'

import { UserPlus, Rocket, ThumbsUp, Smartphone, BarChart3, RefreshCw } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

export default function Features() {
    const { t } = useLanguage()
    return (
        <section id="features" className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-normal lg:text-5xl" style={{ letterSpacing: '-0.05em' }}>{t('features.title')}</h2>
                </div>

                <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <UserPlus className="size-4" />
                            <h3 className="text-sm font-medium">{t('features.createAccounts')}</h3>
                        </div>
                        <p className="text-sm">{t('features.createAccountsDesc')}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <RefreshCw className="size-4" />
                            <h3 className="text-sm font-medium">{t('features.warmUp')}</h3>
                        </div>
                        <p className="text-sm">{t('features.warmUpDesc')}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Rocket className="size-4" />

                            <h3 className="text-sm font-medium">{t('features.postContent')}</h3>
                        </div>
                        <p className="text-sm">{t('features.postContentDesc')}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <ThumbsUp className="size-4" />

                            <h3 className="text-sm font-medium">{t('features.engage')}</h3>
                        </div>
                        <p className="text-sm">{t('features.engageDesc')}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Smartphone className="size-4" />

                            <h3 className="text-sm font-medium">{t('features.realDevices')}</h3>
                        </div>
                        <p className="text-sm">{t('features.realDevicesDesc')}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="size-4" />

                            <h3 className="text-sm font-medium">{t('features.analytics')}</h3>
                        </div>
                        <p className="text-sm">{t('features.analyticsDesc')}</p>
                    </div>
                </div>

                <div className="relative z-10 mx-auto max-w-xl text-center">
                    <p>{t('features.footer')}</p>
                </div>
            </div>
        </section>
    )
}
