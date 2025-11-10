'use client'

import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/language-context'

interface GuaranteeBadgeProps {
    className?: string
    text?: string
}

export function GuaranteeBadge({ className, text }: GuaranteeBadgeProps) {
    const { t } = useLanguage()
    const displayText = text || t('hero.guarantee')
    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-black",
            className
        )}>
            <span className="font-medium">{displayText}</span>
            <Info className="h-3 w-3" />
        </div>
    )
}

