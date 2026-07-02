import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
}

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'rounded-full border-transparent animate-spin',
        sizes[size],
        className
      )}
      style={{
        borderTopColor: '#6366f1',
        borderRightColor: 'rgba(99,102,241,0.3)',
        borderBottomColor: 'rgba(99,102,241,0.1)',
        borderLeftColor: 'rgba(99,102,241,0.3)',
      }}
    />
  )
}
