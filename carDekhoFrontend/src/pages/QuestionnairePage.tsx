import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Fuel, Car, Users, Route, Settings, Target, DollarSign, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/ui/Navbar'
import { getFilters } from '@/api/filters'
import { postRecommendation } from '@/api/recommendation'
import { useAppContext } from '@/context/AppContext'
import type { RecommendationRequest } from '@/types/api'
import { formatPrice } from '@/lib/utils'

// ── Icon Map ────────────────────────────────────────────────────────────────
const fuelIcons: Record<string, string> = {
  Petrol: '⛽', Diesel: '🛢️', Electric: '⚡', CNG: '🌿', Hybrid: '🔋',
}
const bodyIcons: Record<string, string> = {
  SUV: '🚙', Hatchback: '🚗', Sedan: '🚘', EV: '⚡', MUV: '🚐',
}
const transmissionIcons: Record<string, string> = {
  Manual: '🕹️', Automatic: '🤖', CVT: '♾️', DCT: '⚡',
}
const priorityIcons: Record<string, string> = {
  Safety: '🛡️', Mileage: '⛽', Performance: '🏎️', Comfort: '🛋️', Features: '✨',
}

// ── Slide animation ─────────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
}

// ── Option Card ─────────────────────────────────────────────────────────────
function OptionCard({
  value, icon, selected, onClick,
}: { value: string; icon?: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border text-sm font-medium transition-all duration-200 ${
        selected
          ? 'text-white border-brand-500 shadow-glow-sm'
          : 'text-slate-400 border-white/08 hover:border-white/20 hover:text-white'
      }`}
      style={{
        background: selected
          ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))'
          : 'rgba(255,255,255,0.03)',
      }}
    >
      {selected && (
        <motion.div
          layoutId="selected-indicator"
          className="absolute inset-0 rounded-2xl border-2 border-brand-500 pointer-events-none"
          initial={false}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />
      )}
      {icon && <span className="text-2xl">{icon}</span>}
      <span>{value}</span>
    </motion.button>
  )
}

// ── Questions config ─────────────────────────────────────────────────────────
type Question = {
  id: keyof RecommendationRequest
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
  type: 'budget' | 'options' | 'number' | 'slider'
  optionsKey?: 'fuelTypes' | 'bodyTypes' | 'transmissions' | 'priorities'
  iconMap?: Record<string, string>
  min?: number; max?: number; step?: number; unit?: string
}

const QUESTIONS: Question[] = [
  {
    id: 'budget', icon: DollarSign,
    title: "What's your budget?", subtitle: 'Slide to set your maximum car budget',
    type: 'budget', min: 300000, max: 5000000, step: 50000,
  },
  {
    id: 'fuelType', icon: Fuel,
    title: 'Preferred Fuel Type', subtitle: 'Choose the fuel type that suits your lifestyle',
    type: 'options', optionsKey: 'fuelTypes', iconMap: fuelIcons,
  },
  {
    id: 'bodyType', icon: Car,
    title: 'Body Type', subtitle: 'What kind of car are you looking for?',
    type: 'options', optionsKey: 'bodyTypes', iconMap: bodyIcons,
  },
  {
    id: 'familySize', icon: Users,
    title: 'Family Size', subtitle: 'How many people will typically ride together?',
    type: 'number', min: 1, max: 10, unit: 'people',
  },
  {
    id: 'dailyRunningKm', icon: Route,
    title: 'Daily Running', subtitle: 'How many kilometers do you drive daily?',
    type: 'slider', min: 0, max: 300, step: 10, unit: 'km/day',
  },
  {
    id: 'transmission', icon: Settings,
    title: 'Transmission Type', subtitle: 'Manual control or automatic convenience?',
    type: 'options', optionsKey: 'transmissions', iconMap: transmissionIcons,
  },
  {
    id: 'priority', icon: Target,
    title: 'Top Priority', subtitle: 'What matters most to you in a car?',
    type: 'options', optionsKey: 'priorities', iconMap: priorityIcons,
  },
]

// ── Main Component ──────────────────────────────────────────────────────────
export default function QuestionnairePage() {
  const navigate = useNavigate()
  const { setQuestionnaireAnswers, setRecommendationId, setRecommendationData } = useAppContext()

  const [step, setStep]       = useState(0)
  const [direction, setDir]   = useState(1)
  const [submitting, setSub]  = useState(false)
  const [answers, setAnswers] = useState<Partial<RecommendationRequest>>({
    budget: 1500000,
    familySize: 4,
    dailyRunningKm: 40,
  })

  const { data: filters, isLoading: filtersLoading } = useQuery({
    queryKey: ['filters'],
    queryFn: getFilters,
  })

  const q = QUESTIONS[step]
  const progress = ((step + 1) / QUESTIONS.length) * 100

  const currentValue = answers[q.id]

  const canProceed = (): boolean => {
    const v = answers[q.id]
    if (q.type === 'budget')  return typeof v === 'number' && (v as number) >= 100000
    if (q.type === 'options') return typeof v === 'string' && v.length > 0
    if (q.type === 'number')  return typeof v === 'number' && (v as number) >= (q.min || 1)
    if (q.type === 'slider')  return typeof v === 'number'
    return false
  }

  const setAnswer = (value: string | number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: value }))
  }

  const goNext = async () => {
    if (!canProceed()) { toast.error('Please select an option before continuing'); return }

    if (step < QUESTIONS.length - 1) {
      setDir(1)
      setStep((s) => s + 1)
    } else {
      // Submit
      const payload = answers as RecommendationRequest
      setSub(true)
      setQuestionnaireAnswers(payload)
      try {
        navigate('/loading', { state: { payload } })
      } catch {
        setSub(false)
        toast.error('Something went wrong. Please try again.')
      }
    }
  }

  const goPrev = () => {
    if (step > 0) { setDir(-1); setStep((s) => s - 1) }
  }

  const getOptions = (): string[] => {
    if (!filters || !q.optionsKey) return []
    return filters[q.optionsKey]
  }

  if (filtersLoading) {
    return (
      <div className="page-wrapper flex items-center justify-center min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading questionnaire...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper relative overflow-hidden min-h-screen flex flex-col">
      <Navbar />

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-indigo" style={{ width: 500, height: 500, top: -100, left: -100, opacity: 0.1 }} />
        <div className="orb orb-violet" style={{ width: 400, height: 400, bottom: -100, right: -100, opacity: 0.1 }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-16">
        <div className="w-full max-w-xl">

          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-slate-500 text-sm mb-1">Question {step + 1} of {QUESTIONS.length}</p>
            <h1 className="text-2xl font-bold text-white">Tell Us About Yourself</h1>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>

            {/* Step dots */}
            <div className="flex justify-between mt-3">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 mx-0.5 rounded-full transition-all duration-300"
                  style={{
                    background: i <= step
                      ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                      : 'rgba(255,255,255,0.06)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="glass rounded-3xl p-8 border border-white/08 shadow-card">
                {/* Question icon + title */}
                <div className="flex items-center gap-4 mb-8">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))' }}
                  >
                    <q.icon className="w-6 h-6 text-brand-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{q.title}</h2>
                    <p className="text-slate-400 text-sm">{q.subtitle}</p>
                  </div>
                </div>

                {/* ── Budget slider ── */}
                {q.type === 'budget' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <span className="text-4xl font-black gradient-text">
                        {formatPrice(answers.budget ?? 1500000)}
                      </span>
                      <p className="text-slate-500 text-sm mt-1">Maximum budget</p>
                    </div>
                    <input
                      type="range"
                      min={q.min} max={q.max} step={q.step}
                      value={answers.budget ?? 1500000}
                      onChange={(e) => setAnswer(Number(e.target.value))}
                      className="w-full h-2 rounded-full outline-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #6366f1 0%, #8b5cf6 ${
                          (((answers.budget ?? 1500000) - (q.min ?? 0)) / ((q.max ?? 1) - (q.min ?? 0))) * 100
                        }%, rgba(255,255,255,0.08) ${
                          (((answers.budget ?? 1500000) - (q.min ?? 0)) / ((q.max ?? 1) - (q.min ?? 0))) * 100
                        }%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{formatPrice(q.min ?? 0)}</span>
                      <span>{formatPrice(q.max ?? 0)}</span>
                    </div>

                    {/* Quick presets */}
                    <div className="flex flex-wrap gap-2">
                      {[500000, 1000000, 1500000, 2500000, 4000000].map((p) => (
                        <button
                          key={p}
                          onClick={() => setAnswer(p)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                            answers.budget === p
                              ? 'text-white border-brand-500 bg-brand-500/20'
                              : 'text-slate-400 border-white/08 hover:border-white/20'
                          }`}
                        >
                          {formatPrice(p)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Options grid ── */}
                {q.type === 'options' && (
                  <div className="grid grid-cols-2 gap-3">
                    {getOptions().map((opt) => (
                      <OptionCard
                        key={opt}
                        value={opt}
                        icon={q.iconMap?.[opt]}
                        selected={currentValue === opt}
                        onClick={() => setAnswer(opt)}
                      />
                    ))}
                  </div>
                )}

                {/* ── Number picker ── */}
                {q.type === 'number' && (
                  <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-6">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setAnswer(Math.max(q.min ?? 1, (answers[q.id] as number ?? q.min ?? 1) - 1))}
                        className="w-14 h-14 rounded-2xl text-2xl font-bold text-white transition-all glass-hover flex items-center justify-center border border-white/10"
                      >
                        −
                      </motion.button>
                      <div className="text-center">
                        <span className="text-6xl font-black gradient-text">
                          {answers[q.id] ?? q.min}
                        </span>
                        <p className="text-slate-400 text-sm mt-1">{q.unit}</p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setAnswer(Math.min(q.max ?? 10, (answers[q.id] as number ?? q.min ?? 1) + 1))}
                        className="w-14 h-14 rounded-2xl text-2xl font-bold text-white transition-all glass-hover flex items-center justify-center border border-white/10"
                      >
                        +
                      </motion.button>
                    </div>
                    <div className="flex gap-2">
                      {Array.from({ length: (q.max ?? 10) - (q.min ?? 1) + 1 }, (_, i) => i + (q.min ?? 1)).map((n) => (
                        <button
                          key={n}
                          onClick={() => setAnswer(n)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                            answers[q.id] === n
                              ? 'text-white border border-brand-500 bg-brand-500/20'
                              : 'text-slate-500 border border-white/06 hover:border-white/20'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Slider ── */}
                {q.type === 'slider' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <span className="text-4xl font-black gradient-text">
                        {answers[q.id] ?? q.min}
                      </span>
                      <span className="text-slate-400 text-lg ml-2">{q.unit}</span>
                    </div>
                    <input
                      type="range"
                      min={q.min} max={q.max} step={q.step}
                      value={answers[q.id] as number ?? q.min}
                      onChange={(e) => setAnswer(Number(e.target.value))}
                      className="w-full h-2 rounded-full outline-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #6366f1 0%, #8b5cf6 ${
                          (((answers[q.id] as number ?? q.min ?? 0) - (q.min ?? 0)) / ((q.max ?? 1) - (q.min ?? 0))) * 100
                        }%, rgba(255,255,255,0.08) ${
                          (((answers[q.id] as number ?? q.min ?? 0) - (q.min ?? 0)) / ((q.max ?? 1) - (q.min ?? 0))) * 100
                        }%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{q.min} {q.unit}</span>
                      <span>{q.max} {q.unit}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[0, 20, 40, 80, 120, 200].map((v) => (
                        <button key={v} onClick={() => setAnswer(v)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            answers[q.id] === v
                              ? 'text-white border-brand-500 bg-brand-500/20'
                              : 'text-slate-400 border-white/08 hover:border-white/20'
                          }`}>{v} km</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex gap-4 mt-6">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={goPrev}
              disabled={step === 0}
              className={`btn-ghost flex-1 justify-center py-3.5 ${step === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={goNext}
              disabled={submitting || !canProceed()}
              className={`btn-primary flex-1 justify-center py-3.5 ${!canProceed() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : step === QUESTIONS.length - 1 ? (
                <>Get My Recommendations</>
              ) : (
                <>Next <ChevronRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
