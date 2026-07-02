import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, GitCompare, Sparkles, ChevronRight, MessageSquare, Car } from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import MatchScoreRing from '@/components/MatchScoreRing'
import CarDetailsDrawer from '@/components/CarDetailsDrawer'
import AIExplanationModal from '@/components/AIExplanationModal'
import CompareBar from '@/components/CompareBar'
import Navbar from '@/components/ui/Navbar'
import { formatPrice, getImageUrl } from '@/lib/utils'
import type { RecommendedCar } from '@/types/api'

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: 'easeOut' },
  }),
}

interface CarCardProps {
  car: RecommendedCar
  rank: number
  onViewDetails: (id: string) => void
  onExplain: (id: string) => void
  isSelectedForCompare: boolean
  onToggleCompare: (id: string) => void
  compareDisabled: boolean
}

function CarCard({ car, rank, onViewDetails, onExplain, isSelectedForCompare, onToggleCompare, compareDisabled }: CarCardProps) {
  const [imgErr, setImgErr] = useState(false)

  return (
    <motion.div
      variants={cardVariants}
      custom={rank}
      whileHover={{ y: -4 }}
      className="glass rounded-3xl overflow-hidden border border-white/08 shadow-card transition-shadow hover:shadow-card-hover group"
    >
      {/* Image section */}
      <div className="relative h-48 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        {/* Rank badge */}
        <div className="absolute top-4 left-4 z-10">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
            style={{ background: rank === 1 ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            #{rank}
          </div>
        </div>

        {/* Match score */}
        <div className="absolute top-4 right-4 z-10 glass rounded-2xl p-2 border border-white/08">
          <MatchScoreRing score={car.matchScore} size={64} strokeWidth={5} />
        </div>

        {imgErr ? (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-16 h-16 text-slate-700" />
          </div>
        ) : (
          <img
            src={getImageUrl(`/images/${car.brand.toLowerCase()}_${car.model.toLowerCase().replace(/\s+/g, '_')}.jpg`)}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgErr(true)}
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Car name */}
        <div className="mb-3">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-0.5">{car.brand}</p>
          <h3 className="text-xl font-bold text-white">{car.model}</h3>
          <p className="text-slate-500 text-sm">{car.variant}</p>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-slate-500 text-xs mb-0.5">Price</p>
            <p className="text-2xl font-black gradient-text">{formatPrice(car.price)}</p>
          </div>
        </div>

        {/* AI Explanation snippet */}
        <div className="glass rounded-xl p-3 border border-white/06 mb-5">
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
            <Sparkles className="w-3 h-3 inline mr-1 text-brand-400" />
            {car.aiExplanation}
          </p>
        </div>

        {/* Compare toggle */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => onToggleCompare(car.carId)}
            disabled={compareDisabled && !isSelectedForCompare}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
              isSelectedForCompare
                ? 'text-white border-brand-500 bg-brand-500/20'
                : compareDisabled
                ? 'text-slate-600 border-white/05 cursor-not-allowed'
                : 'text-slate-400 border-white/08 hover:border-white/20 hover:text-white'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            {isSelectedForCompare ? 'Selected' : 'Compare'}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(car.carId)}
            className="btn-ghost flex-1 justify-center text-xs py-2.5"
          >
            <Eye className="w-3.5 h-3.5" />
            View Details
          </button>
          <button
            onClick={() => onExplain(car.carId)}
            className="btn-primary flex-1 justify-center text-xs py-2.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Why This Car?
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function RecommendationPage() {
  const navigate = useNavigate()
  const { recommendationData, recommendationId, selectedForCompare, toggleCompare, clearCompare } = useAppContext()

  const [drawerCarId,  setDrawerCarId]  = useState<string | null>(null)
  const [explainCarId, setExplainCarId] = useState<string | null>(null)

  if (!recommendationData) {
    return (
      <div className="page-wrapper min-h-screen flex flex-col items-center justify-center gap-6 text-center px-6">
        <Navbar />
        <div className="glass rounded-3xl p-12 border border-white/08 max-w-md">
          <Car className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">No Recommendations Yet</h2>
          <p className="text-slate-400 text-sm mb-6">Complete the questionnaire to get your personalized AI car recommendations.</p>
          <button onClick={() => navigate('/questionnaire')} className="btn-primary w-full justify-center">
            <Sparkles className="w-4 h-4" />
            Start Questionnaire
          </button>
        </div>
      </div>
    )
  }

  const cars = recommendationData.recommendedCars

  return (
    <div className="page-wrapper relative min-h-screen">
      <Navbar />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-indigo" style={{ width: 500, height: 500, top: -100, right: -100, opacity: 0.08 }} />
        <div className="orb orb-violet" style={{ width: 400, height: 400, bottom: 0, left: -100, opacity: 0.08 }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-32">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-xs text-slate-300 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            AI Analysis Complete
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Your Top <span className="gradient-text">{cars.length} Matches</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Ranked by AI match score based on your preferences. Session ID:{' '}
            <span className="text-brand-400 font-mono text-xs">{recommendationId}</span>
          </p>
        </motion.div>

        {/* Compare hint */}
        {selectedForCompare.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <span className="text-slate-400 text-sm">
              {selectedForCompare.length === 2
                ? 'Ready to compare!'
                : 'Select one more car to compare'}
            </span>
            {selectedForCompare.length === 2 && (
              <button
                onClick={() => navigate('/compare')}
                className="btn-primary text-xs px-4 py-2"
              >
                <GitCompare className="w-3.5 h-3.5" />
                Compare Now
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        )}

        {/* Cards grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {cars.map((car, i) => (
            <CarCard
              key={car.carId}
              car={car}
              rank={i + 1}
              onViewDetails={setDrawerCarId}
              onExplain={setExplainCarId}
              isSelectedForCompare={selectedForCompare.includes(car.carId)}
              onToggleCompare={toggleCompare}
              compareDisabled={selectedForCompare.length >= 2}
            />
          ))}
        </motion.div>

        {/* Chat CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="glass rounded-3xl p-8 border border-white/08 max-w-lg mx-auto">
            <MessageSquare className="w-10 h-10 text-brand-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Have Questions?</h3>
            <p className="text-slate-400 text-sm mb-5">
              Chat with our AI assistant about your recommendations, ask follow-up questions, or explore car details.
            </p>
            <button onClick={() => navigate('/chat')} className="btn-primary mx-auto">
              <MessageSquare className="w-4 h-4" />
              Open AI Chat
            </button>
          </div>
        </motion.div>
      </div>

      {/* Drawers & Modals */}
      <CarDetailsDrawer
        carId={drawerCarId}
        onClose={() => setDrawerCarId(null)}
      />

      {recommendationId && explainCarId && (
        <AIExplanationModal
          recommendationId={recommendationId}
          selectedCarId={explainCarId}
          onClose={() => setExplainCarId(null)}
        />
      )}

      {/* Compare floating bar */}
      <CompareBar />
    </div>
  )
}
