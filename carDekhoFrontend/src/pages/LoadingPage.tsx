import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { postRecommendation } from '@/api/recommendation'
import { useAppContext } from '@/context/AppContext'
import type { RecommendationRequest } from '@/types/api'

const STEPS = [
  'Analyzing your preferences...',
  'Finding matching cars...',
  'Comparing specifications...',
  'Calculating match scores...',
  'Asking AI for personalized explanations...',
]

export default function LoadingPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { setRecommendationId, setRecommendationData } = useAppContext()

  const [completedSteps, setCompleted] = useState<number[]>([])
  const [currentStep,    setCurrent]   = useState(0)
  const [progress,       setProgress]  = useState(0)
  const [dots,           setDots]      = useState('')

  const payload = (location.state as { payload: RecommendationRequest } | null)?.payload

  // Typing dots animation
  useEffect(() => {
    const t = setInterval(() => setDots((d) => d.length >= 3 ? '' : d + '.'), 400)
    return () => clearInterval(t)
  }, [])

  // Advance steps visually
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setCurrent(i)
        setProgress(((i + 1) / STEPS.length) * 85)
      }, i * 800))
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  // API call
  useEffect(() => {
    if (!payload) { navigate('/questionnaire'); return }

    const call = async () => {
      try {
        const data = await postRecommendation(payload)
        // Mark all done
        setCompleted(STEPS.map((_, i) => i))
        setProgress(100)
        setRecommendationId(data.recommendationId)
        setRecommendationData(data)
        setTimeout(() => navigate('/recommendations'), 800)
      } catch (err) {
        toast.error((err as Error).message || 'Failed to get recommendations')
        navigate('/questionnaire')
      }
    }
    call()
  }, []) // eslint-disable-line

  // Mark step as completed when progress passes it
  useEffect(() => {
    const idx = Math.floor((progress / 100) * STEPS.length) - 1
    if (idx >= 0) {
      setCompleted((prev) => {
        const next = [...prev]
        for (let i = 0; i <= idx; i++) if (!next.includes(i)) next.push(i)
        return next
      })
    }
  }, [progress])

  return (
    <div
      className="page-wrapper min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #050508 0%, #0a0a14 100%)' }}
    >
      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#8b5cf6' : '#06b6d4',
            opacity: 0.4,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: Math.random() * 3 + 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Background orbs */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(60px)',
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 w-full max-w-md text-center">

        {/* AI Brain animation */}
        <div className="relative mx-auto mb-10 w-32 h-32">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-brand-500/30"
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Middle ring */}
          <motion.div
            className="absolute inset-3 rounded-full border border-violet-500/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          {/* Inner spinning arc */}
          <motion.div
            className="absolute inset-5 rounded-full"
            style={{
              border: '2px solid transparent',
              borderTopColor: '#6366f1',
              borderRightColor: '#8b5cf6',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          {/* Center icon */}
          <div
            className="absolute inset-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))' }}
          >
            <span className="text-2xl">🧠</span>
          </div>
        </div>

        {/* Title */}
        <motion.h1
          className="text-2xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Analyzing your preferences{dots}
        </motion.h1>
        <p className="text-slate-400 text-sm mb-10">
          Our AI is finding the perfect cars for you
        </p>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Processing</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Checklist steps */}
        <div className="glass rounded-2xl p-6 border border-white/08 text-left space-y-4">
          {STEPS.map((step, i) => {
            const isDone    = completedSteps.includes(i)
            const isCurrent = currentStep === i && !isDone

            return (
              <AnimatePresence key={i}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                    {isDone ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </motion.div>
                    ) : isCurrent ? (
                      <motion.div
                        className="w-4 h-4 rounded-full border-2 border-brand-500"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/10" />
                    )}
                  </div>
                  <span
                    className={`text-sm transition-all ${
                      isDone    ? 'text-emerald-400 line-through opacity-60' :
                      isCurrent ? 'text-white font-medium' :
                                  'text-slate-600'
                    }`}
                  >
                    {step}
                  </span>
                </motion.div>
              </AnimatePresence>
            )
          })}
        </div>
      </div>
    </div>
  )
}
