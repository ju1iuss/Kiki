'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import Link from 'next/link'

type FAQItem = {
    id: string
    icon: IconName
    question: string
    answer: string
}

export default function FAQsThree() {
    const faqItems: FAQItem[] = [
        {
            id: 'item-1',
            icon: 'user-check',
            question: 'How do you avoid getting accounts banned?',
            answer: 'We create accounts on real devices with real IPs, warm them up for weeks with human-like behavior, and deploy them across different locations. Our accounts behave exactly like real users—watching content, engaging naturally, and following platform guidelines.',
        },
        {
            id: 'item-2',
            icon: 'rocket',
            question: 'How fast can I start posting?',
            answer: 'Your accounts will be ready to deploy within 24 hours. However, for best results, we recommend letting us warm them up for 2-3 weeks before aggressive posting. This builds trust with platform algorithms and reduces the risk of flags.',
        },
        {
            id: 'item-3',
            icon: 'video',
            question: 'Do I need to create the videos myself?',
            answer: 'You can provide your own videos, or we can generate them for you using Tasy AI. Just tell us your niche and messaging, and we\'ll handle the content creation, posting, and engagement—completely hands-off.',
        },
        {
            id: 'item-4',
            icon: 'trending-up',
            question: 'What kind of results can I expect?',
            answer: 'Results vary by niche and content quality, but our clients typically see 10-50x more reach compared to single-account strategies. With 50+ accounts posting and engaging, you\'re essentially running a small media company on autopilot.',
        },
        {
            id: 'item-5',
            icon: 'shield',
            question: 'Is this safe and compliant?',
            answer: 'We operate in a grey area. Platforms don\'t explicitly allow automated accounts, but they can\'t detect ours because we use real devices, real behavior, and smart engagement patterns. We take precautions to minimize risk, but there\'s always a small chance of account loss.',
        },
    ]

    return (
        <section id="faq" className="bg-muted dark:bg-background py-20">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="flex flex-col gap-10 md:flex-row md:gap-16">
                    <div className="md:w-1/3">
                        <div className="sticky top-20">
                            <h2 className="mt-4 text-3xl font-bold">Frequently Asked Questions</h2>
                            <p className="text-muted-foreground mt-4">
                                Can't find what you're looking for? Contact our{' '}
                                <Link
                                    href="#"
                                    className="text-primary font-medium hover:underline">
                                    customer support team
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
