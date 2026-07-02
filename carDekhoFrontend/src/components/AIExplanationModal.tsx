import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { X, Sparkles, Brain } from 'lucide-react'
import { postAIExplanation } from '@/api/aiExplanation'
import { useAppContext } from '@/context/AppContext'

interface AIExplanationModalProps {
  recommendationId: string
  selectedCarId: string
  onClose: () => void
}

function TypewriterText({ text, speed = 20 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    setDisplayed('')
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-4 ml-0.5 bg-brand-400 align-middle"
        />
      )}
    </span>
  )
}

export default function AIExplanationModal({ recommendationId, selectedCarId, onClose }: AIExplanationModalProps) {
  const { recommendationData } = useAppContext()

  const car = recommendationData?.recommendedCars.find((c) => c.carId === selectedCarId)

  const { data, isLoading, mutate } = useMutation({
    mutationFn: postAIExplanation,
  })

  useEffect(() => {
    mutate({ recommendationId, selectedCarId })
  }, [recommendationId, selectedCarId])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-6"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden"
          style={{
            background: 'rgba(8,8,20,0.98)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 0 80px rgba(99,102,241,0.2)',
          }}
        >
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none opacity-10"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, #6366f1, transparent 70%)' }} />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-8 relative z-10">
            {/* AI Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <motion.div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.3))' }}
                  animate={{ boxShadow: ['0 0 0 0 rgba(99,102,241,0)', '0 0 0 10px rgba(99,102,241,0)', '0 0 0 0 rgba(99,102,241,0)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Brain className="w-7 h-7 text-brand-400" />
                </motion.div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#080814] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                </div>
              </div>
              <div>
                <p className="text-white font-semibold">Gemini AI</p>
                <p className="text-slate-400 text-xs">
                  {car ? `Explaining ${car.brand} ${car.model}` : 'AI Analysis'}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                <Sparkles className="w-3 h-3" />
                AI
              </div>
            </div>

            {/* Content */}
            <div className="glass rounded-2xl p-5 border border-white/06 min-h-[160px]">
              {isLoading ? (
                <div className="flex items-start gap-3">
                  <div className="flex gap-1 mt-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-brand-400"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                  <p className="text-slate-400 text-sm">Analyzing your recommendation...</p>
                </div>
              ) : data ? (
                <p className="text-slate-300 text-sm leading-relaxed">
                  <TypewriterText text={data.explanation} speed={15} />
                </p>
              ) : (
                <p className="text-slate-500 text-sm">Could not load explanation.</p>
              )}
            </div>

            {/* Match score if available */}
            {car && (
              <div className="flex items-center gap-3 mt-4 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)' }}>
                <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
                <p className="text-slate-400 text-xs">
                  Match Score: <span className="text-brand-400 font-bold">{car.matchScore}%</span> — {car.brand} {car.model}
                </p>
              </div>
            )}

            <button onClick={onClose} className="btn-ghost w-full justify-center mt-5 text-sm">
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
