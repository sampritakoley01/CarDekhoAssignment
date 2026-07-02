import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  X, Car, Fuel, Settings, Users, Shield, Star,
  Zap, Gauge, ArrowUp, Package, Sun, Eye,
  Navigation, MonitorSmartphone, CircleCheck, CircleX
} from 'lucide-react'
import { getCarById } from '@/api/cars'
import { formatPrice, getImageUrl } from '@/lib/utils'

interface CarDetailsDrawerProps {
  carId: string | null
  onClose: () => void
}

function SpecCard({ label, value, icon: Icon, unit }: {
  label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; unit?: string
}) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <div className="flex items-center gap-1.5 text-slate-500">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-white font-semibold text-sm">
        {value}{unit && <span className="text-slate-400 text-xs ml-1">{unit}</span>}
      </p>
    </div>
  )
}

function FeatureChip({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
      active
        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
        : 'text-slate-600 border-white/06 bg-white/02'
    }`}>
      {active ? <CircleCheck className="w-3.5 h-3.5" /> : <CircleX className="w-3.5 h-3.5" />}
      {label}
    </div>
  )
}

export default function CarDetailsDrawer({ carId, onClose }: CarDetailsDrawerProps) {
  const { data: car, isLoading } = useQuery({
    queryKey: ['car', carId],
    queryFn: () => getCarById(carId!),
    enabled: !!carId,
  })

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    if (carId) document.body.style.overflow = 'hidden'
    else       document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [carId])

  return (
    <AnimatePresence>
      {carId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg overflow-y-auto"
            style={{
              background: 'rgba(8,8,18,0.97)',
              backdropFilter: 'blur(24px)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <X className="w-5 h-5" />
            </button>

            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
                  <p className="text-slate-400 text-sm">Loading details...</p>
                </div>
              </div>
            ) : car ? (
              <>
                {/* Hero Image */}
                <div className="relative h-64 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <img
                    src={getImageUrl(car.imageUrl)}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080812] via-transparent to-transparent" />

                  {/* Car name overlay */}
                  <div className="absolute bottom-4 left-6 right-16">
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{car.brand}</p>
                    <h2 className="text-2xl font-black text-white">{car.model}</h2>
                    <p className="text-slate-400 text-sm">{car.varient}</p>
                  </div>
                </div>

                <div className="p-6 space-y-7">
                  {/* Price + Rating */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Ex-showroom Price</p>
                      <p className="text-3xl font-black gradient-text">{formatPrice(car.price)}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(car.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
                          />
                        ))}
                      </div>
                      <p className="text-white font-semibold">{car.rating}/5</p>
                      <p className="text-slate-500 text-xs">Customer Rating</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {[car.bodyType, car.fuelType, car.transmission].map((tag) => (
                      <span key={tag} className="px-3 py-1.5 rounded-lg text-xs font-medium glass border border-white/08 text-slate-300">
                        {tag}
                      </span>
                    ))}
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium glass border border-white/08 text-slate-300">
                      <Users className="w-3 h-3 inline mr-1" />{car.seatingCapacity} Seater
                    </span>
                  </div>

                  {/* Performance specs */}
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-brand-400" />
                      Performance
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <SpecCard label="Engine"         value={car.engineCc}      icon={Settings} unit="cc" />
                      <SpecCard label="Mileage"         value={car.mileage}       icon={Fuel}     unit="kmpl" />
                      <SpecCard label="Power"           value={car.powerBhp}      icon={Zap}      unit="bhp" />
                      <SpecCard label="Torque"          value={car.torqueNm}      icon={Gauge}    unit="Nm" />
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                      <Car className="w-4 h-4 text-brand-400" />
                      Dimensions
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <SpecCard label="Ground Clearance" value={car.groundClearance} icon={ArrowUp}  unit="mm" />
                      <SpecCard label="Boot Space"        value={car.bootSpace}       icon={Package}  unit="L" />
                    </div>
                  </div>

                  {/* Safety */}
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      Safety
                    </h3>
                    {/* Safety rating progress */}
                    <div className="glass rounded-xl p-4 border border-white/06 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs">NCAP Safety Rating</span>
                        <span className="text-emerald-400 font-bold">{car.safetyRating}/5 ★</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg, #10b981, #059669)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(car.safetyRating / 5) * 100}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <SpecCard label="Airbags" value={car.airbags} icon={Shield} unit="bags" />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <FeatureChip label="ABS"  active={car.abs} />
                      <FeatureChip label="ESC"  active={car.esc} />
                      <FeatureChip label="ADAS" active={car.adas} />
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-brand-400" />
                      Comfort & Features
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <FeatureChip label="Sunroof"       active={car.sunroof} />
                      <FeatureChip label="Cruise Control" active={car.cruiseControl} />
                      <FeatureChip label="Touch Screen"  active={car.touchScreen} />
                      <FeatureChip label="Alloy Wheels"  active={car.alloyWheel} />
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
