import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { Send, ArrowLeft, Brain, Sparkles, Car } from 'lucide-react'
import { postChat } from '@/api/chat'
import { useAppContext } from '@/context/AppContext'
import Navbar from '@/components/ui/Navbar'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

const SUGGESTED_QUESTIONS = [
  'Which car has the best mileage?',
  'Is the top recommendation good for highway trips?',
  'Which car is safest for family use?',
  'Compare the top 2 cars for me',
  'What are the pros and cons of the #1 recommendation?',
]

function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1"
        style={{
          background: isUser
            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
            : 'rgba(99,102,241,0.2)',
        }}
      >
        {isUser ? (
          <span className="text-white text-xs font-bold">U</span>
        ) : (
          <Brain className="w-4 h-4 text-brand-400" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'text-white rounded-tr-sm'
            : 'text-slate-200 rounded-tl-sm border border-white/06'
        }`}
        style={{
          background: isUser
            ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
            : 'rgba(255,255,255,0.04)',
        }}
      >
        {msg.content}
        <p className={`text-[10px] mt-1.5 ${isUser ? 'text-indigo-200/50' : 'text-slate-600'}`}>
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(99,102,241,0.2)' }}>
        <Brain className="w-4 h-4 text-brand-400" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-white/06"
        style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-brand-400"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const navigate    = useNavigate()
  const bottomRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const { recommendationId, recommendationData } = useAppContext()

  const [messages,   setMessages]  = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: recommendationId
        ? `Hello! I'm your AI car advisor. I have access to your recommendation session (${recommendationId}). Ask me anything about your recommended cars, compare options, or get detailed advice!`
        : 'Hello! I can help answer questions about cars. Please complete the questionnaire first to get personalized recommendations.',
      timestamp: new Date(),
    }
  ])
  const [input,     setInput]    = useState('')
  const [isTyping,  setIsTyping] = useState(false)

  const { mutate: sendMessage } = useMutation({
    mutationFn: postChat,
    onMutate: () => setIsTyping(true),
    onSuccess: (data) => {
      setIsTyping(false)
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: data.reply,
        timestamp: new Date(),
      }])
    },
    onError: (err) => {
      setIsTyping(false)
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: `Sorry, I encountered an error: ${(err as Error).message}`,
        timestamp: new Date(),
      }])
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    if (!recommendationId) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: 'Please complete the questionnaire first to start a chat session.',
        timestamp: new Date(),
      }])
      return
    }

    // Add user message
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }])
    setInput('')

    // Send to API
    sendMessage({ recommendationId, message: text })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestion = (q: string) => {
    setInput(q)
    inputRef.current?.focus()
  }

  return (
    <div className="page-wrapper min-h-screen flex flex-col relative">
      <Navbar />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-indigo" style={{ width: 400, height: 400, bottom: 0, left: -100, opacity: 0.07 }} />
        <div className="orb orb-violet" style={{ width: 300, height: 300, top: 100, right: -50, opacity: 0.07 }} />
      </div>

      <div className="relative z-10 flex flex-col h-screen max-w-3xl mx-auto w-full px-4 pt-20">

        {/* Chat header */}
        <div className="flex items-center gap-4 py-4 border-b border-white/06">
          <button
            onClick={() => navigate('/recommendations')}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.3))' }}>
                <Brain className="w-5 h-5 text-brand-400" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#050508]" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">AI Car Advisor</p>
              <p className="text-emerald-400 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Online
              </p>
            </div>
          </div>

          {recommendationId && (
            <div className="ml-auto flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg text-xs glass border border-white/08 text-slate-400 font-mono hidden sm:block">
                {recommendationId}
              </div>
              <button
                onClick={() => navigate('/recommendations')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white border border-white/08 hover:border-white/20 transition-all"
              >
                <Car className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">My Cars</span>
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-6 space-y-5">
          {messages.map((msg) => <ChatBubble key={msg.id} msg={msg} />)}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        {messages.length === 1 && recommendationData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-3"
          >
            <p className="text-slate-500 text-xs mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Suggested questions
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestion(q)}
                  className="px-3 py-2 rounded-xl text-xs glass border border-white/08 text-slate-400 hover:text-white hover:border-white/20 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Input area */}
        <div className="py-4 border-t border-white/06">
          <div
            className="flex items-end gap-3 rounded-2xl p-3 border border-white/10 transition-all focus-within:border-brand-500/50"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your car recommendations..."
              rows={1}
              className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 outline-none resize-none max-h-32 py-1"
              style={{ lineHeight: '1.5' }}
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={!input.trim()}
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                input.trim()
                  ? 'text-white cursor-pointer'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
              style={{
                background: input.trim()
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(255,255,255,0.05)',
              }}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
          <p className="text-slate-600 text-xs mt-2 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
