'use client'

import { useState, useEffect } from 'react'
import { Server, Cpu, Wifi, Activity, Database, Shield } from 'lucide-react'

interface CyberLoaderProps {
  title?: string
  subtitle?: string
  showProgress?: boolean
  messages?: string[]
  className?: string
}

const CYBER_ICONS = [
  { Icon: Server, label: 'Server' },
  { Icon: Cpu, label: 'CPU' },
  { Icon: Database, label: 'Database' },
  { Icon: Shield, label: 'Security' },
  { Icon: Wifi, label: 'Network' },
  { Icon: Activity, label: 'Activity' }
]

const EMOJIS = ['🛰️', '📡', '🔄', '🧩', '⚡', '🔮', '💫', '🌐']

const DEFAULT_MESSAGES = [
  'เชื่อมต่อระบบรักษาความปลอดภัย...',
  'ตรวจสอบข้อมูลผู้ใช้งาน...',
  'โหลดข้อมูลส่วนบุคคล...',
  'เข้าสู่ระบบแดชบอร์ด...',
  'เตรียมพร้อมสำหรับคุณ...'
]

export default function CyberLoader({
  title = 'กำลังโหลด',
  subtitle = 'รอสักครู่ เรากำลังเตรียมทุกอย่างให้คุณ',
  showProgress = true,
  messages = DEFAULT_MESSAGES,
  className = ''
}: CyberLoaderProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [currentIconIndex, setCurrentIconIndex] = useState(0)
  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  // Rotate messages every 2 seconds
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length)
    }, 2000)

    return () => clearInterval(messageInterval)
  }, [messages.length])

  // Rotate icons every 1.5 seconds
  useEffect(() => {
    const iconInterval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % CYBER_ICONS.length)
    }, 1500)

    return () => clearInterval(iconInterval)
  }, [])

  // Rotate emojis every 3 seconds
  useEffect(() => {
    const emojiInterval = setInterval(() => {
      setCurrentEmojiIndex((prev) => (prev + 1) % EMOJIS.length)
    }, 3000)

    return () => clearInterval(emojiInterval)
  }, [])

  // Simulate progress
  useEffect(() => {
    if (!showProgress) return

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0
        return prev + Math.random() * 5
      })
    }, 200)

    return () => clearInterval(progressInterval)
  }, [showProgress])

  const CurrentIcon = CYBER_ICONS[currentIconIndex].Icon

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${className}`}>
      <div className="glass-card neon-border rounded-xl p-8 text-center cyber-loader-container">
        {/* Animated Icon Section */}
        <div className="cyber-icon-container mb-6">
          <div className="relative">
            <div className="cyber-icon-glow absolute inset-0">
              <CurrentIcon className="h-16 w-16 text-cyan-400 mx-auto animate-pulse" />
            </div>
            <CurrentIcon className="h-16 w-16 text-cyan-400 mx-auto cyber-icon-main" />
            
            {/* Rotating Loader */}
            <div className="absolute -inset-4 border-2 border-transparent border-t-cyan-400 border-r-purple-400 rounded-full animate-spin opacity-60"></div>
            <div className="absolute -inset-8 border border-transparent border-t-pink-400 border-l-blue-400 rounded-full animate-spin-reverse opacity-40"></div>
          </div>
          
          {/* Floating Emoji */}
          <div className="cyber-emoji absolute top-0 right-0 text-2xl animate-bounce">
            {EMOJIS[currentEmojiIndex]}
          </div>
        </div>

        {/* Title with Typewriter Effect */}
        <div className="mb-4">
          <h3 className="cyber-title gradient-text text-2xl font-bold mb-2">
            <span className="typewriter-text">{title}</span>
            <span className="cursor-blink">|</span>
          </h3>
          <p className="text-gray-400 text-sm cyber-subtitle">
            {subtitle}
          </p>
        </div>

        {/* Rotating Messages with Typewriter */}
        <div className="cyber-message-container mb-6">
          <div className="typewriter-message neon-text">
            <span className="cyber-prompt">SYSTEM:</span>
            <span className="typewriter-rotating ml-2">
              {messages[currentMessageIndex]}
            </span>
          </div>
        </div>

        {/* Neon Progress Bar */}
        {showProgress && (
          <div className="cyber-progress-container mb-4">
            <div className="neon-progress-bar">
              <div 
                className="neon-progress-fill"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-cyan-300 mt-2 font-mono">
              {Math.floor(progress)}% Complete
            </div>
          </div>
        )}

        {/* Status Indicators */}
        <div className="cyber-status-grid">
          <div className="cyber-status-item">
            <div className="status-dot status-active"></div>
            <span>Network</span>
          </div>
          <div className="cyber-status-item">
            <div className="status-dot status-processing"></div>
            <span>Security</span>
          </div>
          <div className="cyber-status-item">
            <div className="status-dot status-ready"></div>
            <span>Database</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Cyber Loader Styles */
        .cyber-loader-container {
          position: relative;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 255, 255, 0.3);
          box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.2),
            inset 0 0 20px rgba(0, 255, 255, 0.1);
        }

        .cyber-icon-container {
          position: relative;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cyber-icon-glow {
          filter: blur(8px);
          opacity: 0.6;
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .cyber-icon-main {
          position: relative;
          z-index: 2;
          animation: float 3s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.8));
        }

        .cyber-emoji {
          animation: float-emoji 4s ease-in-out infinite;
          filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
        }

        /* Typewriter Effects */
        .typewriter-text {
          overflow: hidden;
          border-right: 2px solid transparent;
          white-space: nowrap;
          animation: typing 2s steps(20) infinite;
        }

        .cursor-blink {
          animation: blink 1s infinite;
          color: #00ffff;
          text-shadow: 0 0 10px #00ffff;
        }

        .typewriter-rotating {
          overflow: hidden;
          white-space: nowrap;
          animation: typing-rotate 2s steps(30) infinite;
          color: #00ffff;
          font-family: 'Courier New', monospace;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
        }

        .cyber-prompt {
          color: #ff6b6b;
          font-weight: bold;
          text-shadow: 0 0 5px rgba(255, 107, 107, 0.8);
        }

        /* Neon Progress Bar */
        .neon-progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid rgba(0, 255, 255, 0.3);
          box-shadow: 
            0 0 10px rgba(0, 255, 255, 0.2),
            inset 0 0 10px rgba(0, 0, 0, 0.5);
        }

        .neon-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, 
            #00ffff 0%, 
            #ff00ff 50%, 
            #ffff00 100%);
          border-radius: 4px;
          transition: all 0.3s ease;
          animation: progress-glow 2s ease-in-out infinite;
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
        }

        /* Status Grid */
        .cyber-status-grid {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
        }

        .cyber-status-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.6);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-active {
          background: #00ff00;
          box-shadow: 0 0 10px #00ff00;
        }

        .status-processing {
          background: #ffff00;
          box-shadow: 0 0 10px #ffff00;
          animation: pulse 1s infinite;
        }

        .status-ready {
          background: #00ffff;
          box-shadow: 0 0 10px #00ffff;
        }

        /* Animations */
        @keyframes typing {
          0%, 100% { width: 0; }
          50% { width: 100%; }
        }

        @keyframes typing-rotate {
          0% { width: 0; }
          50% { width: 100%; }
          100% { width: 0; }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        @keyframes pulse-glow {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.6;
          }
          50% { 
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes float-emoji {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-15px) rotate(180deg); 
          }
        }

        @keyframes progress-glow {
          0%, 100% { 
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
          }
          50% { 
            box-shadow: 0 0 25px rgba(0, 255, 255, 1);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }

        .animate-spin-reverse {
          animation: spin-reverse 3s linear infinite;
        }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        /* Neon Text Effects */
        .neon-text {
          color: #00ffff;
          text-shadow: 
            0 0 5px rgba(0, 255, 255, 0.8),
            0 0 10px rgba(0, 255, 255, 0.6),
            0 0 15px rgba(0, 255, 255, 0.4);
        }

        .gradient-text {
          background: linear-gradient(45deg, #00ffff, #ff00ff, #ffff00);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 3s ease-in-out infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(90deg); }
        }
      `}</style>
    </div>
  )
} 