'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GuaranteeBadge } from '@/components/ui/guarantee-badge'
import Image from 'next/image'
import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { HeroHeader } from './header'
import { useLanguage } from '@/contexts/language-context'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export default function HeroSection() {
    const { t } = useLanguage()

    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <div
                    aria-hidden
                    className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block">
                    <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-20 md:pt-32 pb-12 md:pb-20">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: 'spring' as const,
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            }}
                            className="mask-b-from-35% mask-b-to-90% absolute inset-0 top-56 -z-20 lg:top-32">
                            <Image
                                src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120"
                                alt="background"
                                className="hidden size-full dark:block"
                                width="3276"
                                height="4095"
                            />
                        </AnimatedGroup>

                        <div
                            aria-hidden
                            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
                        />

                        {/* Background SVG */}
                        <div
                            className="absolute left-1/2 -translate-x-1/2 -z-[5] w-full"
                            style={{ top: '340px', maxWidth: '900px' }}>
                            <AnimatedGroup
                                variants={{
                                    container: {
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.05,
                                                delayChildren: 1.0,
                                            },
                                        },
                                    },
                                    item: {
                                        hidden: {
                                            opacity: 0,
                                            filter: 'blur(12px)',
                                            y: 12,
                                        },
                                        visible: {
                                            opacity: 1,
                                            filter: 'blur(0px)',
                                            y: 0,
                                            transition: {
                                                type: 'spring' as const,
                                                bounce: 0.3,
                                                duration: 2.5,
                                            },
                                        },
                                    },
                                }}>
                                <div aria-hidden>
                                    <Image
                                        src="/bg.svg"
                                        alt="background gradient"
                                        className="hidden md:block w-full h-auto opacity-95"
                                        width="1194"
                                        height="436"
                                    />
                                </div>
                            </AnimatedGroup>
                        </div>

                        <div className="mx-auto max-w-7xl px-8 md:px-12">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        href="#link"
                                        className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-3 rounded-full border p-1 pl-4 pr-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <div className="flex -space-x-2">
                                            <img 
                                                src="https://i.pravatar.cc/150?img=12" 
                                                alt="User" 
                                                className="w-7 h-7 rounded-full border-2 border-background"
                                            />
                                            <img 
                                                src="https://i.pravatar.cc/150?img=33" 
                                                alt="User" 
                                                className="w-7 h-7 rounded-full border-2 border-background"
                                            />
                                            <img 
                                                src="https://i.pravatar.cc/150?img=47" 
                                                alt="User" 
                                                className="w-7 h-7 rounded-full border-2 border-background"
                                            />
                                            <img 
                                                src="https://i.pravatar.cc/150?img=52" 
                                                alt="User" 
                                                className="w-7 h-7 rounded-full border-2 border-background"
                                            />
                                            <img 
                                                src="https://i.pravatar.cc/150?img=68" 
                                                alt="User" 
                                                className="w-7 h-7 rounded-full border-2 border-background"
                                            />
                                        </div>
                                        <span className="text-foreground text-sm">{t('apply.rolledOut')}</span>

                                            
                                    </Link>
                                </AnimatedGroup>

                                <TextEffect
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    as="h1"
                                    className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-medium md:text-6xl lg:mt-10 xl:text-7xl"
                                    style={{ letterSpacing: '-0.05em' }}>
                                    {t('hero.title')}
                                </TextEffect>
                                <TextEffect
                                    per="line"
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    delay={0.5}
                                    as="p"
                                    className="mx-auto mt-5 max-w-3xl text-balance text-lg md:text-xl">
                                    {t('hero.subtitle')}
                                </TextEffect>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-8 flex flex-col items-center justify-center gap-3">
                                    <div className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="rounded-xl px-6 text-base active:scale-95 transition-transform duration-150 group">
                                            <Link href="/apply">
                                                <span className="text-nowrap">{t('hero.cta')}</span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="2"
                                                    stroke="currentColor"
                                                    className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                                    />
                                                </svg>
                                            </Link>
                                        </Button>
                                    </div>
                                    <div className="animate-in fade-in duration-500 delay-200">
                                        <GuaranteeBadge />
                                    </div>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="mask-b-from-55% relative -mr-56 mt-6 overflow-hidden px-2 sm:mr-0 sm:mt-8 md:mt-12">
                                <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border-4 shadow-lg shadow-[#ED5A0B]/20" style={{ borderColor: '#ED5A0B', backgroundColor: 'rgba(237, 90, 11, 0.1)' }}>
                                    {/* Black placeholder */}
                                    <div className="absolute inset-0 bg-black z-10" />
                                    <Image
                                        className="bg-background relative w-full h-auto object-contain opacity-0 transition-opacity duration-700"
                                        src="/hero.png"
                                        alt={t('hero.dashboardAlt')}
                                        width="3104"
                                        height="1992"
                                        onLoad={(e) => {
                                            e.currentTarget.classList.remove('opacity-0');
                                            e.currentTarget.classList.add('opacity-100');
                                            const placeholder = e.currentTarget.previousElementSibling as HTMLElement;
                                            if (placeholder) {
                                                placeholder.style.opacity = '0';
                                                placeholder.style.transition = 'opacity 0.5s';
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
            </main>
        </>
    )
}
