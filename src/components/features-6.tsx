import { Upload, Sparkles, Zap, Video } from 'lucide-react'
import Image from 'next/image'

export default function FeaturesSection() {
    return (
        <section id="solution" className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl space-y-12 px-6">
                <div className="relative z-10 grid items-center gap-4 md:grid-cols-2 md:gap-12">
                    <h2 className="text-4xl font-semibold" style={{ letterSpacing: '-0.05em' }}>Content Creation Built In</h2>
                    <p className="max-w-sm sm:ml-auto">Upload or generate your content in bulk in less than a couple of minutes. No more manual posting across multiple accounts.</p>
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
                            <h3 className="text-sm font-medium">Bulk Upload</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">Upload multiple videos at once and distribute them across all your accounts.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4" />
                            <h3 className="text-sm font-medium">AI Generation</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">Generate content ideas and captions powered by AI in seconds.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4" />
                            <h3 className="text-sm font-medium">Lightning Fast</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">Create and schedule content for all accounts in under 2 minutes.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Video className="size-4" />

                            <h3 className="text-sm font-medium">Smart Distribution</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">Automatically distribute content across accounts with optimal timing.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
