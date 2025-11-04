import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  iconClassName?: string
  textClassName?: string
  showText?: boolean
}

export function Logo({
  className,
  iconClassName,
  textClassName,
  showText = true
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Sparkles className={cn("w-5 h-5 text-primary", iconClassName)} />
      </div>
      {showText && (
        <span className={cn("font-bold text-foreground", textClassName)}>
          WeddingGuest
        </span>
      )}
    </div>
  )
}
