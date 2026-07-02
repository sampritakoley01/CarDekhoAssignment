import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface MatchScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
}

export default function MatchScoreRing({ score, size = 80, strokeWidth = 6 }: MatchScoreRingProps) {
  const [animated, setAnimated] = useState(0)
  const radius      = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset       = circumference - (animated / 100) * circumference

  const color = score >= 85 ? '#10b981' : score >= 70 ? '#6366f1' : '#f59e0b'

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 200)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg
        width={size} height={size}
        className="absolute"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2} cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2} cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      {/* Score text */}
      <div className="text-center">
        <motion.span
          className="text-base font-bold block"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-slate-500 text-[10px] leading-none">%</span>
      </div>
    </div>
  )
}
