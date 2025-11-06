import { UserPlus, Rocket, ThumbsUp, Smartphone, BarChart3, RefreshCw } from 'lucide-react'

export default function Features() {
    return (
        <section id="features" className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-normal lg:text-5xl" style={{ letterSpacing: '-0.05em' }}>Everything Runs on Autopilot</h2>
                    <p>Stop paying $5K/month per social media manager. Our automated accounts do it all—and they never sleep.</p>
                </div>

                <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <UserPlus className="size-4" />
                            <h3 className="text-sm font-medium">We Create The Accounts</h3>
                        </div>
                        <p className="text-sm">Pre-verified, aged, niche-specific accounts ready to deploy in 24h.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <RefreshCw className="size-4" />
                            <h3 className="text-sm font-medium">We Warm Them Up</h3>
                        </div>
                        <p className="text-sm">Weeks of human-like activity. Trusted by platform algorithms.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Rocket className="size-4" />

                            <h3 className="text-sm font-medium">We Post Your Content</h3>
                        </div>
                        <p className="text-sm">Smart scheduling across all accounts. Platform-optimized formats.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <ThumbsUp className="size-4" />

                            <h3 className="text-sm font-medium">We Engage For You</h3>
                        </div>
                        <p className="text-sm">Automated liking, commenting, sharing. Behavior patterns that look 100% human.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Smartphone className="size-4" />

                            <h3 className="text-sm font-medium">Real Device Deployment</h3>
                        </div>
                        <p className="text-sm">Physical phones, not cloud VMs. Real IPs, real locations.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="size-4" />

                            <h3 className="text-sm font-medium">Performance Analytics</h3>
                        </div>
                        <p className="text-sm">Track what works. Optimize automatically.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
