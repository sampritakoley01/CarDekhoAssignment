import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GitCompare, X } from 'lucide-react'
import { useAppContext } from '@/context/AppContext'

export default function CompareBar() {
  const navigate = useNavigate()
  const { selectedForCompare, clearCompare, recommendationData } = useAppContext()

  if (selectedForCompare.length === 0) return null

  const cars = recommendationData?.recommendedCars.filter((c) =>
    selectedForCompare.includes(c.carId)
  ) ?? []

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 px-4"
      >
        <div
          className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-white/10 shadow-glow"
          style={{
            background: 'rgba(8,8,20,0.95)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 0 40px rgba(99,102,241,0.3)',
          }}
        >
          {/* Selected cars */}
          <div className="flex items-center gap-3">
            {cars.map((car) => (
              <div key={car.carId} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-brand-400"
                  style={{ background: 'rgba(99,102,241,0.2)' }}>
                  {car.brand[0]}
                </div>
                <div className="hidden sm:block">
                  <p className="text-white text-xs font-medium">{car.brand}</p>
                  <p className="text-slate-500 text-[10px]">{car.model}</p>
                </div>
              </div>
            ))}
            {selectedForCompare.length === 1 && (
              <div className="w-8 h-8 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-slate-600 text-xs">
                ?
              </div>
            )}
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {selectedForCompare.length === 2 ? (
              <button
                onClick={() => navigate('/compare')}
                className="btn-primary text-xs px-4 py-2"
              >
                <GitCompare className="w-3.5 h-3.5" />
                Compare Now
              </button>
            ) : (
              <p className="text-slate-400 text-xs">Select 1 more car</p>
            )}
            <button
              onClick={clearCompare}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
