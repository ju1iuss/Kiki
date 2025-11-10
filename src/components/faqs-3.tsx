'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'

type FAQItem = {
    id: string
    icon: IconName
    question: string
    answer: string
}

export default function FAQsThree() {
    const { t } = useLanguage()
    
    const faqItems: FAQItem[] = [
        {
            id: 'item-1',
            icon: 'user-check',
            question: t('faq.q1'),
            answer: t('faq.a1'),
        },
        {
            id: 'item-2',
            icon: 'rocket',
            question: t('faq.q2'),
            answer: t('faq.a2'),
        },
        {
            id: 'item-3',
            icon: 'video',
            question: t('faq.q3'),
            answer: t('faq.a3'),
        },
        {
            id: 'item-4',
            icon: 'trending-up',
            question: t('faq.q4'),
            answer: t('faq.a4'),
        },
        {
            id: 'item-5',
            icon: 'shield',
            question: t('faq.q5'),
            answer: t('faq.a5'),
        },
    ]

    return (
        <section id="faq" className="bg-muted dark:bg-background py-20">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="flex flex-col gap-10 md:flex-row md:gap-16">
                    <div className="md:w-1/3">
                        <div className="sticky top-20">
                            <h2 className="mt-4 text-3xl font-bold">{t('faq.title')}</h2>
                            <p className="text-muted-foreground mt-4">
                                {t('faq.subtitle')}{' '}
                                <Link
                                    href="#"
                                    className="text-primary font-medium hover:underline">
                                    {t('faq.contact')}
                                </Link>
                            </p>
                        </div>
                    </div>
                    <div className="md:w-2/3">
                        <Accordion
                            type="single"
                            collapsible
                            className="w-full space-y-2">
                            {faqItems.map((item) => (
                                <AccordionItem
                                    key={item.id}
                                    value={item.id}
                                    className="bg-background shadow-xs border-2 border-gray-300 dark:border-gray-700 px-4 last:border-b">
                                    <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-6">
                                                <DynamicIcon
                                                    name={item.icon}
                                                    className="m-auto size-4"
                                                />
                                            </div>
                                            <span className="text-base">{item.question}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-5">
                                        <div className="px-9">
                                            <p className="text-base">{item.answer}</p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </section>
    )
}
