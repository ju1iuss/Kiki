import Link from 'next/link'

export default function FooterSection() {
    return (
        <footer className="border-t bg-white py-8 dark:bg-transparent">
            <div className="mx-auto max-w-7xl px-6">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <span className="text-muted-foreground text-sm">
                        © {new Date().getFullYear()} Tasy AI
                    </span>
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                        <Link
                            href="https://tasy.ai"
                            className="text-muted-foreground hover:text-foreground transition-colors">
                            Privacy
                        </Link>
                        <Link
                            href="https://tasy.ai"
                            className="text-muted-foreground hover:text-foreground transition-colors">
                            Terms
                        </Link>
                        <Link
                            href="https://tasy.ai"
                            className="text-muted-foreground hover:text-foreground transition-colors">
                            Contact
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
