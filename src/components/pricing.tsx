import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'

export default function Pricing() {
    return (
        <div id="pricing" className="relative py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-balance text-3xl font-medium md:text-4xl lg:text-5xl" style={{ letterSpacing: '-0.05em' }}>Simple, Transparent Pricing</h2>
                </div>
                <div className="mt-8 md:mt-20">
                    <div className="bg-card relative border-2 shadow-2xl shadow-zinc-950/5">
                        <div className="grid items-center gap-12 divide-y divide-gray-300 dark:divide-gray-700 p-12 md:grid-cols-2 md:divide-x md:divide-y-0">
                            <div className="pb-12 text-center md:pb-0 md:pr-12">
                                <h3 className="text-2xl font-semibold">Per Account</h3>
                                <p className="mt-2 text-lg">Scale as you grow</p>
                                <span className="mb-6 mt-12 inline-block text-6xl font-bold">
                                    <span className="text-4xl">€</span>125
                                </span>
                                <p className="text-muted-foreground text-sm">/account/month</p>

                                <div className="flex justify-center mt-8">
                                <Button
                                    asChild
                                    size="lg"
                                    className="active:scale-95 transition-transform duration-150">
                                    <Link href="/apply">Want Access? Apply Now</Link>
                                </Button>
                                </div>

                                <p className="text-muted-foreground mt-12 text-sm">Start with 10 accounts, scale to 100+. Cancel anytime.</p>
                            </div>
                            <div className="relative">
                                <ul
                                    role="list"
                                    className="space-y-4">
                                    {[
                                        'Account creation & verification',
                                        'Automated content posting',
                                        'Human-like engagement',
                                        'Real device deployment',
                                        'Performance analytics',
                                        'Dedicated support'
                                    ].map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-2">
                                            <Check className="size-3" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-muted-foreground mt-6 text-sm">Join founders already hitting millions of views with our automated accounts.</p>
                                <div className="mt-12 flex flex-wrap items-center justify-between gap-6">
                                    <img
                                        className="h-5 w-fit dark:invert"
                                        src="https://html.tailus.io/blocks/customers/nvidia.svg"
                                        alt="Nvidia Logo"
                                        height="20"
                                        width="auto"
                                    />
                                    <img
                                        className="h-4 w-fit dark:invert"
                                        src="https://html.tailus.io/blocks/customers/column.svg"
                                        alt="Column Logo"
                                        height="16"
                                        width="auto"
                                    />
                                    <img
                                        className="h-4 w-fit dark:invert"
                                        src="https://html.tailus.io/blocks/customers/github.svg"
                                        alt="GitHub Logo"
                                        height="16"
                                        width="auto"
                                    />
                                    <img
                                        className="h-5 w-fit dark:invert"
                                        src="https://html.tailus.io/blocks/customers/nike.svg"
                                        alt="Nike Logo"
                                        height="20"
                                        width="auto"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
