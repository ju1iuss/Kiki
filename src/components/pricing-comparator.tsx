'use client'

import { Button } from '@/components/ui/button'
import { X, Check } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'

export default function PricingComparator() {
    const { t } = useLanguage()
    
    const tableData = [
    {
        feature: t('comparator.accountCreation'),
        diy: false,
        freelancer: false,
        tasy: true,
    },
    {
        feature: t('comparator.automatedPosting'),
        diy: false,
        freelancer: false,
        tasy: true,
    },
    {
        feature: t('comparator.humanLikeEngagement'),
        diy: false,
        freelancer: '~50 actions/day',
        tasy: true,
    },
    {
        feature: t('comparator.realDeviceDeployment'),
        diy: false,
        freelancer: false,
        tasy: true,
    },
    {
        feature: t('comparator.scale'),
        diy: false,
        freelancer: false,
        tasy: true,
    },
    {
        feature: t('comparator.performanceAnalytics'),
        diy: t('comparator.basic'),
        freelancer: t('comparator.manualReports'),
        tasy: t('comparator.realTimeDashboard'),
    },
    {
        feature: t('comparator.monthlyCost'),
        diy: t('comparator.yourTime'),
        freelancer: '$5K+ per account',
        tasy: t('comparator.perAccount'),
    },
    {
        feature: t('comparator.timeRequired'),
        diy: t('comparator.hoursPerWeek'),
        freelancer: t('comparator.weeklyManagement'),
        tasy: t('comparator.zeroHours'),
    },
]
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-medium mb-4" style={{ letterSpacing: '-0.05em' }}>{t('comparator.title')}</h2>
                    <p className="text-muted-foreground">{t('comparator.subtitle')}</p>
                </div>
                <div className="w-full overflow-auto lg:overflow-visible">
                    <table className="w-[200vw] border-separate border-spacing-x-3 md:w-full dark:[--color-muted:var(--color-zinc-900)]">
                        <thead className="bg-background sticky top-0">
                            <tr className="*:py-4 *:text-left *:font-medium">
                                <th className="lg:w-2/5"></th>
                                <th className="space-y-3">
                                    <span className="block text-sm">{t('comparator.diy')}</span>
                                </th>
                                <th className="space-y-3">
                                    <span className="block text-sm">{t('comparator.freelancer')}</span>
                                </th>
                                <th className="bg-[#ED5A0B]/10 dark:bg-[#ED5A0B]/20 rounded-t-(--radius) space-y-3 px-4 relative">
                                    <div className="flex items-center gap-2 justify-start">
                                        <span className="block text-sm font-bold">{t('comparator.tasy')}</span>
                                        <div className="bg-[#ED5A0B] text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                                            {t('comparator.bestChoice')}
                                        </div>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-caption text-sm">
                            {tableData.map((row, index) => (
                                <tr
                                    key={index}
                                    className="*:border-b *:py-3">
                                    <td className="text-muted-foreground font-medium">{row.feature}</td>
                                    <td>
                                        {row.diy === true ? (
                                            <Check className="size-4 text-green-600" />
                                        ) : row.diy === false ? (
                                            <X className="size-4 text-red-600" />
                                        ) : (
                                            <span className="text-sm">{row.diy}</span>
                                        )}
                                    </td>
                                    <td>
                                        {row.freelancer === true ? (
                                            <Check className="size-4 text-green-600" />
                                        ) : row.freelancer === false ? (
                                            <X className="size-4 text-red-600" />
                                        ) : (
                                            <span className="text-sm">{row.freelancer}</span>
                                        )}
                                    </td>
                                    <td className="bg-[#ED5A0B]/10 dark:bg-[#ED5A0B]/20 border-none px-4">
                                        <div className="-mb-3 border-b py-3">
                                            {row.tasy === true ? (
                                                <Check className="size-5 text-[#ED5A0B] font-bold" />
                                            ) : row.tasy === false ? (
                                                <X className="size-5 text-red-600" />
                                            ) : (
                                                <span className="text-sm font-semibold">{row.tasy}</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            <tr className="*:py-6">
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="bg-[#ED5A0B]/10 dark:bg-[#ED5A0B]/20 rounded-b-(--radius) border-none px-4"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}
