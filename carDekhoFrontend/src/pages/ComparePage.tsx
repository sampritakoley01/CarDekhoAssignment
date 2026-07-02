import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import {
  ArrowLeft, Trophy, Car, Fuel, Settings, Shield,
  ArrowUp, Package, Brain, Sparkles, CheckCircle2, XCircle
} from 'lucide-react'
import { postCompare } from '@/api/compare'
import { useAppContext } from '@/context/AppContext'
import { formatPrice } from '@/lib/utils'
import Navbar from '@/components/ui/Navbar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { CompareCarSummary } from '@/types/api'

interface CompareField {
  label: string
  key: keyof CompareCarSummary
  unit?: string
  icon: React.ComponentType<{ className?: string }>
  higherIsBetter: boolean
}

const FIELDS: CompareField[] = [
  { label: 'Price',             key: 'price',           icon: Car,       higherIsBetter: false, unit: '₹' },
  { label: 'Mileage',           key: 'mileage',         icon: Fuel,      higherIsBetter: true,  unit: 'kmpl' },
  { label: 'Engine',            key: 'engineCc',        icon: Settings,  higherIsBetter: true,  unit: 'cc' },
  { label: 'Safety Rating',     key: 'safetyRating',    icon: Shield,    higherIsBetter: true,  unit: '★' },
  { label: 'Ground Clearance',  key: 'groundClearance', icon: ArrowUp,   higherIsBetter: true,  unit: 'mm' },
  { label: 'Boot Space',        key: 'bootSpace',       icon: Package,   higherIsBetter: true,  unit: 'L' },
  { label: 'Airbags',           key: 'airbags',         icon: Shield,    higherIsBetter: true,  unit: '' },
]

function isBetter(val1: number | boolean, val2: number | boolean, higherIsBetter: boolean): 'c1' | 'c2' | 'tie' {
  if (typeof val1 === 'boolean') {
    if (val1 === val2) return 'tie'
    return val1 ? 'c1' : 'c2'
  }
  if (val1 === val2) return 'tie'
  return (val1 > val2) === higherIsBetter ? 'c1' : 'c2'
}

function formatFieldValue(key: keyof CompareCarSummary, value: number | boolean | string, unit?: string): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (key === 'price') return formatPrice(value as number)
  return `${value}${unit ? ` ${unit}` : ''}`
}

export default function ComparePage() {
  const navigate = useNavigate()
  const { selectedForCompare, recommendationData, clearCompare } = useAppContext()

  const { data, isLoading, mutate } = useMutation({
    mutationFn: postCompare,
  })

  useEffect(() => {
    if (selectedForCompare.length === 2) {
      mutate({ carIds: [selectedForCompare[0], selectedForCompare[1]] })
    }
  }, [])

  if (selectedForCompare.length < 2) {
    return (
      <div className="page-wrapper min-h-screen flex flex-col items-center justify-center gap-6 text-center px-6">
        <Navbar />
        <div className="glass rounded-3xl p-12 border border-white/08 max-w-md">
          <Car className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Select 2 Cars to Compare</h2>
          <p className="text-slate-400 text-sm mb-6">
            Go back to your recommendations and select 2 cars using the "Compare" button.
          </p>
          <button onClick={() => navigate('/recommendations')} className="btn-primary w-full justify-center">
            <ArrowLeft className="w-4 h-4" />
            Back to Recommendations
          </button>
        </div>
      </div>
    )
  }

  const car1Name = recommendationData?.recommendedCars.find((c) => c.carId === selectedForCompare[0])
  const car2Name = recommendationData?.recommendedCars.find((c) => c.carId === selectedForCompare[1])

  return (
    <div className="page-wrapper min-h-screen relative">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-indigo" style={{ width: 500, height: 500, top: -100, left: -150, opacity: 0.08 }} />
        <div className="orb orb-violet" style={{ width: 400, height: 400, bottom: 0, right: -100, opacity: 0.08 }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-16">

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/recommendations')}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recommendations
        </motion.button>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-black text-white mb-2">
            Side-by-Side <span className="gradient-text">Comparison</span>
          </h1>
          <p className="text-slate-400">
            {car1Name?.brand} {car1Name?.model} vs {car2Name?.brand} {car2Name?.model}
          </p>
        </motion.div>

        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-24">
            <LoadingSpinner size="lg" />
            <p className="text-slate-400 text-sm">Comparing cars...</p>
          </div>
        )}

        {data && (
          <>
            {/* Car headers */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Car 1 */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-5 border border-white/08 text-center"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-brand-400 mx-auto mb-3"
                  style={{ background: 'rgba(99,102,241,0.2)' }}>
                  {data.car1.brand[0]}
                </div>
                <p className="text-slate-400 text-xs uppercase tracking-wider">{data.car1.brand}</p>
                <p className="text-white font-bold text-lg">{data.car1.model}</p>
                <p className="text-slate-500 text-xs mt-0.5">{data.car1.variant}</p>
              </motion.div>

              {/* VS badge */}
              <div className="flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, delay: 0.2 }}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  VS
                </motion.div>
              </div>

              {/* Car 2 */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-5 border border-white/08 text-center"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-violet-500 mx-auto mb-3"
                  style={{ background: 'rgba(139,92,246,0.2)' }}>
                  {data.car2.brand[0]}
                </div>
                <p className="text-slate-400 text-xs uppercase tracking-wider">{data.car2.brand}</p>
                <p className="text-white font-bold text-lg">{data.car2.model}</p>
                <p className="text-slate-500 text-xs mt-0.5">{data.car2.variant}</p>
              </motion.div>
            </div>

            {/* Comparison rows */}
            <div className="glass rounded-2xl border border-white/08 overflow-hidden mb-6">
              {[...FIELDS, { label: 'ADAS', key: 'adas' as keyof CompareCarSummary, icon: Shield, higherIsBetter: true }].map((field, idx) => {
                const v1  = data.car1[field.key]
                const v2  = data.car2[field.key]
                const win = isBetter(v1 as number | boolean, v2 as number | boolean, field.higherIsBetter)

                return (
                  <motion.div
                    key={field.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className={`grid grid-cols-3 items-center px-5 py-4 ${
                      idx % 2 === 0 ? 'bg-white/02' : 'bg-transparent'
                    }`}
                  >
                    {/* Car 1 value */}
                    <div className={`text-sm font-semibold ${win === 'c1' ? 'text-emerald-400' : win === 'tie' ? 'text-white' : 'text-slate-500'}`}>
                      <span className="flex items-center gap-1.5">
                        {win === 'c1' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {win === 'c2' && <XCircle className="w-3.5 h-3.5 text-slate-700" />}
                        {formatFieldValue(field.key, v1, ('unit' in field ? field.unit : undefined))}
                      </span>
                    </div>

                    {/* Label */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <field.icon className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-400 text-xs">{field.label}</span>
                      </div>
                    </div>

                    {/* Car 2 value */}
                    <div className={`text-sm font-semibold text-right ${win === 'c2' ? 'text-emerald-400' : win === 'tie' ? 'text-white' : 'text-slate-500'}`}>
                      <span className="flex items-center justify-end gap-1.5">
                        {formatFieldValue(field.key, v2, ('unit' in field ? field.unit : undefined))}
                        {win === 'c2' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {win === 'c1' && <XCircle className="w-3.5 h-3.5 text-slate-700" />}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Winner card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-6 border mb-6 text-center relative overflow-hidden"
              style={{ borderColor: 'rgba(245,158,11,0.3)' }}
            >
              <div className="absolute inset-0 pointer-events-none opacity-5"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, #f59e0b, transparent 70%)' }} />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, delay: 0.6 }}
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
                style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(239,68,68,0.2))' }}
              >
                🏆
              </motion.div>
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-1">Winner</p>
              <h3 className="text-2xl font-black text-white">{data.winner}</h3>
            </motion.div>

            {/* AI Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass rounded-2xl p-6 border border-white/08"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.2)' }}>
                  <Brain className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">AI Summary</p>
                  <p className="text-slate-500 text-xs">Powered by Gemini</p>
                </div>
                <div className="ml-auto flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                  style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                  <Sparkles className="w-2.5 h-2.5" />
                  AI
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{data.aiSummary}</p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
