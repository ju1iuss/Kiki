'use client'

import { Upload, Sparkles, Zap, Video } from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/contexts/language-context'

export default function FeaturesSection() {
    const { t } = useLanguage()
    return (
        <section id="solution" className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl space-y-12 px-6">
                <div className="relative z-10 grid items-center gap-4 md:grid-cols-2 md:gap-12">
                    <h2 className="text-4xl font-semibold" style={{ letterSpacing: '-0.05em' }}>{t('content.title')}</h2>
                    <p className="max-w-sm sm:ml-auto">{t('content.subtitle')}</p>
                </div>
                <div className="px-3 pt-3 md:-mx-8">
                    <div className="aspect-88/36 mask-b-from-75% mask-b-to-95% relative rounded-xl overflow-hidden">
                        <Image
                            src="/content.png"
                            className="absolute inset-0 z-10 rounded-xl"
                            alt="content creation dashboard"
                            width={2797}
                            height={1137}
                        />
                        <Image
                            src="/content.png"
                            className="hidden dark:block rounded-xl"
                            alt="content creation dashboard dark"
                            width={2797}
                            height={1137}
                        />
                        <Image
                            src="/content.png"
                            className="dark:hidden rounded-xl"
                            alt="content creation dashboard light"
                            width={2797}
                            height={1137}
                        />
                    </div>
                </div>
                <div className="relative mx-auto grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Upload className="size-4" />
                            <h3 className="text-sm font-medium">{t('content.bulkUpload')}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">{t('content.bulkUploadDesc')}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4" />
                            <h3 className="text-sm font-medium">{t('content.aiGeneration')}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">{t('content.aiGenerationDesc')}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4" />
                            <h3 className="text-sm font-medium">{t('content.lightningFast')}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">{t('content.lightningFastDesc')}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Video className="size-4" />

                            <h3 className="text-sm font-medium">{t('content.smartDistribution')}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">{t('content.smartDistributionDesc')}</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
