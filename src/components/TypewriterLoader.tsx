'use client'

import { useState, useEffect } from 'react'
import { Terminal, Database, Wifi, Activity } from 'lucide-react'

interface TypewriterLoaderProps {
  isLoading: boolean
  messages?: string[]
}

export default function TypewriterLoader({ 
  isLoading, 
  messages = [
    "กำลังเชื่อมต่อฐานข้อมูล...",
    "กำลังโหลดข้อมูลข่าวสารล่าสุด..."
  ] 
}: TypewriterLoaderProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      setCurrentMessageIndex(0)
      setDisplayedText("")
      return
    }

    const currentMessage = messages[currentMessageIndex]
    let charIndex = 0

    const typeMessage = () => {
      if (charIndex < currentMessage.length) {
        setDisplayedText(currentMessage.slice(0, charIndex + 1))
        charIndex++
        setTimeout(typeMessage, 50) // ความเร็วในการพิมพ์
      } else {
        // เมื่อพิมพ์ข้อความเสร็จแล้ว รอแล้วไปข้อความถัดไป
        setTimeout(() => {
          if (currentMessageIndex < messages.length - 1) {
            setCurrentMessageIndex(prev => prev + 1)
            setDisplayedText("")
          }
        }, 1500)
      }
    }

    const timer = setTimeout(typeMessage, 500)
    return () => clearTimeout(timer)
  }, [currentMessageIndex, isLoading, messages])

  // Cursor blinking effect
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)
    return () => clearInterval(cursorTimer)
  }, [])

  if (!isLoading) return null

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Terminal Header */}
        <div className="bg-slate-900/90 border border-cyan-400/30 rounded-t-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2 text-cyan-300">
              <Terminal className="h-4 w-4" />
              <span className="text-sm font-mono">Crypto News Terminal v3.0</span>
            </div>
          </div>

          {/* Cyber Terminal Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-slate-800 border-2 border-cyan-400/50 rounded-full p-6">
                <Database className="h-12 w-12 text-cyan-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Typewriter Text */}
          <div className="font-mono text-center mb-6">
            <div className="text-lg text-white min-h-[1.5rem] flex items-center justify-center">
              <span 
                className="typing-text"
                style={{
                  textShadow: '0 0 10px rgba(34, 211, 238, 0.5), 0 0 20px rgba(34, 211, 238, 0.3)',
                }}
              >
                {displayedText}
              </span>
              <span 
                className={`ml-1 text-cyan-400 ${showCursor ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  textShadow: '0 0 10px rgba(34, 211, 238, 0.8)',
                }}
              >
                ▋
              </span>
            </div>
          </div>

          {/* System Status Indicators */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <Wifi className="h-3 w-3 animate-pulse" />
              <span>Connection: Active</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <Activity className="h-3 w-3 animate-pulse" />
              <span>Status: Processing</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400">
              <Database className="h-3 w-3 animate-pulse" />
              <span>Database: Online</span>
            </div>
            <div className="flex items-center gap-2 text-orange-400">
              <Terminal className="h-3 w-3 animate-pulse" />
              <span>AI Engine: Ready</span>
            </div>
          </div>
        </div>

        {/* Neon Gradient Progress Bar */}
        <div className="bg-slate-900/90 border-x border-b border-cyan-400/30 rounded-b-lg p-6 backdrop-blur-sm">
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-gradient-x"
              style={{
                backgroundSize: '200% 200%',
                animation: 'gradient-x 2s ease infinite',
                boxShadow: '0 0 10px rgba(34, 211, 238, 0.5), 0 0 20px rgba(168, 85, 247, 0.3)',
              }}
            ></div>
          </div>
          
          {/* Progress Info */}
          <div className="mt-4 text-center">
            <div className="text-slate-400 text-sm">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <span>Loading articles from database...</span>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .typing-text {
          overflow: hidden;
          white-space: nowrap;
        }

        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }

        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        .animate-gradient-x {
          animation: gradient-x 2s ease infinite;
        }
      `}</style>
    </div>
  )
} 