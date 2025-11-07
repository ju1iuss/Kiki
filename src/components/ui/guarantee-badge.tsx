import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GuaranteeBadgeProps {
    className?: string
    text?: string
}

export function GuaranteeBadge({ className, text = "7-Day Money-Back Guarantee" }: GuaranteeBadgeProps) {
    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-black",
            className
        )}>
            <span className="font-medium">{text}</span>
            <Info className="h-3 w-3" />
        </div>
    )
}

