import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Sparkles, Shield, Zap, BarChart3, ArrowRight,
  Brain, Star, Users, Car, CheckCircle2, ChevronRight
} from 'lucide-react'
import Navbar from '@/components/ui/Navbar'

// ── Animation variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' },
  }),
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

// ── Sub-components ──────────────────────────────────────────────────────────
function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      className="text-center"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
        style={{ background: 'rgba(99,102,241,0.15)' }}>
        <Icon className="w-6 h-6 text-brand-400" />
      </div>
      <motion.div
        className="text-4xl font-bold gradient-text mb-1"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {value}
      </motion.div>
      <p className="text-slate-400 text-sm">{label}</p>
    </motion.div>
  )
}

function FeatureCard({
  icon: Icon, title, desc, color, delay,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string; desc: string; color: string; delay: number
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      className="card glass-hover group cursor-default"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
        style={{ background: color }}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  )
}

function StepCard({ step, title, desc, delay }: { step: number; title: string; desc: string; delay: number }) {
  return (
    <motion.div variants={fadeUp} custom={delay} className="relative flex gap-5">
      <div className="flex flex-col items-center">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 z-10"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          {step}
        </div>
        {step < 4 && <div className="w-px flex-1 mt-2" style={{ background: 'rgba(99,102,241,0.2)' }} />}
      </div>
      <div className="pb-8">
        <h4 className="text-white font-semibold mb-1">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const featuresRef = useRef(null)
  const stepsRef = useRef(null)
  const statsRef = useRef(null)

  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' })
  const stepsInView    = useInView(stepsRef,    { once: true, margin: '-100px' })
  const statsInView    = useInView(statsRef,    { once: true, margin: '-100px' })

  return (
    <div className="page-wrapper relative overflow-hidden">
      <Navbar />

      {/* ── Background Orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="orb orb-indigo"
          style={{ width: 600, height: 600, top: -100, left: -100 }}
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="orb orb-violet"
          style={{ width: 500, height: 500, top: 200, right: -150 }}
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="orb orb-cyan"
          style={{ width: 400, height: 400, bottom: 100, left: '30%' }}
          animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-xs text-slate-300 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            AI-Powered Car Recommendations
            <ChevronRight className="w-3 h-3 text-slate-500" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight"
          >
            Find Your
            <br />
            <span className="gradient-text">Perfect Car</span>
            <br />
            with AI
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Answer 7 simple questions and our AI engine analyzes 50+ cars to find
            your ideal match — with personalized explanations, side-by-side comparisons,
            and an intelligent chat assistant.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              id="hero-cta-btn"
              onClick={() => navigate('/questionnaire')}
              className="btn-primary text-base px-8 py-4 rounded-2xl"
            >
              <Sparkles className="w-5 h-5" />
              Find My Perfect Car
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              className="btn-ghost text-base px-8 py-4 rounded-2xl"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              How it works
            </button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={fadeUp}
            custom={4}
            className="flex flex-wrap gap-6 justify-center items-center mt-12 text-slate-500 text-xs"
          >
            {['No signup required', '50+ cars analyzed', 'Gemini AI powered', '100% free'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating car illustration */}
        <motion.div
          className="mt-16 relative max-w-2xl mx-auto w-full"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="glass rounded-3xl p-8 border border-white/08 shadow-card relative overflow-hidden">
            {/* Glow */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, #6366f1, transparent 70%)' }} />

            {/* Mock recommendation preview */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.2)' }}>
                  <Brain className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">AI Analysis Complete</p>
                  <p className="text-slate-500 text-xs">5 cars matched your preferences</p>
                </div>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400"
                style={{ background: 'rgba(16,185,129,0.1)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </div>
            </div>

            <div className="space-y-3">
              {[
                { car: 'Tata Nexon XZA Plus', score: 94, price: '₹14.5 L' },
                { car: 'Hyundai Creta SX(O)', score: 89, price: '₹18.9 L' },
                { car: 'Kia Seltos GTX Plus', score: 82, price: '₹20.0 L' },
              ].map((item, i) => (
                <motion.div
                  key={item.car}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.15 }}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-brand-400"
                      style={{ background: 'rgba(99,102,241,0.15)' }}>
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{item.car}</p>
                      <p className="text-slate-500 text-xs">{item.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-brand-400 font-bold text-sm">{item.score}%</p>
                      <p className="text-slate-600 text-xs">match</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section ref={featuresRef} className="relative px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            animate={featuresInView ? 'visible' : 'hidden'}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Why Choose Us
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold text-white mb-4">
              Intelligence Meets <span className="gradient-text">Simplicity</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-400 max-w-xl mx-auto">
              We combine cutting-edge AI with deep automotive knowledge to deliver recommendations that actually make sense for your life.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={featuresInView ? 'visible' : 'hidden'}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Brain,
                title: 'Gemini AI Engine',
                desc: 'Powered by Google\'s Gemini AI to generate personalized, context-aware car recommendations with detailed explanations.',
                color: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(139,92,246,0.8))',
                delay: 0,
              },
              {
                icon: Shield,
                title: '5-Star Safety Priority',
                desc: 'Safety ratings are a first-class citizen in our recommendation algorithm. Never compromise on what matters most.',
                color: 'linear-gradient(135deg, rgba(16,185,129,0.8), rgba(6,182,212,0.8))',
                delay: 1,
              },
              {
                icon: BarChart3,
                title: 'Smart Comparison',
                desc: 'Compare any two cars side-by-side with AI-generated summaries highlighting what each car does better.',
                color: 'linear-gradient(135deg, rgba(245,158,11,0.8), rgba(239,68,68,0.6))',
                delay: 2,
              },
              {
                icon: Zap,
                title: 'Instant Results',
                desc: 'Our scoring engine processes 50+ cars against your preferences in seconds, returning your top 5 matches.',
                color: 'linear-gradient(135deg, rgba(6,182,212,0.8), rgba(99,102,241,0.8))',
                delay: 3,
              },
              {
                icon: Star,
                title: 'Match Score',
                desc: 'Each recommendation comes with an AI-calculated match score so you always know exactly how well a car fits you.',
                color: 'linear-gradient(135deg, rgba(139,92,246,0.8), rgba(236,72,153,0.6))',
                delay: 4,
              },
              {
                icon: Users,
                title: 'AI Chat Assistant',
                desc: 'Ask follow-up questions about your recommendations in natural language. Get intelligent, contextual answers instantly.',
                color: 'linear-gradient(135deg, rgba(239,68,68,0.6), rgba(245,158,11,0.8))',
                delay: 5,
              },
            ].map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="how-it-works" ref={stepsRef} className="relative px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            animate={stepsInView ? 'visible' : 'hidden'}
            variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <motion.p variants={fadeUp} className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">
                How It Works
              </motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold text-white mb-4">
                4 Steps to Your <span className="gradient-text">Dream Car</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-slate-400 mb-12">
                Our streamlined process gets you from questions to recommendations in under 2 minutes.
              </motion.p>

              <div>
                {[
                  { step: 1, title: 'Answer 7 Questions', desc: 'Tell us your budget, fuel preference, body type, family size, and more.' },
                  { step: 2, title: 'AI Analyzes Your Profile', desc: 'Our Gemini-powered engine scores every car in our database against your preferences.' },
                  { step: 3, title: 'Get Top 5 Matches', desc: 'Receive your personalized recommendations with match scores and AI explanations.' },
                  { step: 4, title: 'Explore & Decide', desc: 'View specs, compare cars, and chat with our AI assistant for confident decision-making.' },
                ].map((s) => <StepCard key={s.step} {...s} delay={s.step} />)}
              </div>
            </div>

            {/* Right illustration */}
            <motion.div
              variants={fadeUp}
              custom={2}
              className="hidden lg:block"
            >
              <div className="glass rounded-3xl p-8 border border-white/08 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 70% 30%, #8b5cf6, transparent 60%)' }} />

                {/* Questionnaire preview */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400 text-xs">Step 2 of 7</span>
                    <span className="text-brand-400 text-xs font-medium">29% complete</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/05 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                      initial={{ width: 0 }}
                      animate={stepsInView ? { width: '29%' } : { width: 0 }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>

                <h4 className="text-white font-semibold mb-5">What fuel type do you prefer?</h4>
                <div className="grid grid-cols-2 gap-3">
                  {['Petrol', 'Diesel', 'Electric', 'Hybrid'].map((fuel, i) => (
                    <div
                      key={fuel}
                      className={`p-4 rounded-xl border text-sm font-medium text-center cursor-pointer transition-all ${
                        i === 0
                          ? 'text-white border-brand-500 bg-brand-500/20'
                          : 'text-slate-400 border-white/08 bg-white/03'
                      }`}
                    >
                      {fuel}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <button className="btn-ghost flex-1 justify-center text-xs py-2.5">Previous</button>
                  <button className="btn-primary flex-1 justify-center text-xs py-2.5">Next</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="relative px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-12 border border-white/08 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-5"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)' }} />

            <motion.div
              initial="hidden"
              animate={statsInView ? 'visible' : 'hidden'}
              variants={stagger}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              <StatCard value="50+" label="Cars Analyzed"    icon={Car} />
              <StatCard value="99%" label="Accuracy Rate"    icon={Brain} />
              <StatCard value="5★"  label="Safety Coverage"  icon={Shield} />
              <StatCard value="<2m" label="Time to Results"  icon={Zap} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="relative px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Find Your <span className="gradient-text">Perfect Match?</span>
          </h2>
          <p className="text-slate-400 mb-8">
            No signup. No credit card. Just intelligent recommendations in minutes.
          </p>
          <button
            onClick={() => navigate('/questionnaire')}
            className="btn-primary text-lg px-10 py-4 rounded-2xl"
          >
            <Sparkles className="w-5 h-5" />
            Get Started — It's Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="relative px-6 py-10 border-t border-white/05">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Car className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm">acr<span className="gradient-text">dekho</span></span>
          </div>
          <p className="text-slate-600 text-xs">
            © 2026 acrdekho. AI-powered car recommendations for India.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Powered by</span>
            <span className="text-slate-400 font-medium">Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
