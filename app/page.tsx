'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import spreadsData from '../data/spreads.json'

interface Spread {
  id: string
  name: string
  englishName: string
  description: string
  cardCount: number
}

export default function Home() {
  const [question, setQuestion] = useState('')
  const [selectedSpread, setSelectedSpread] = useState<string>('')
  const [showApiWarning, setShowApiWarning] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 检查是否已配置 API
    const checkApiConfig = () => {
      const apiKey = localStorage.getItem('tarot_api_key')
      const baseUrl = localStorage.getItem('tarot_api_base_url')
      
      if (!apiKey || !baseUrl) {
        setShowApiWarning(true)
      }
    }
    
    checkApiConfig()
  }, [])

  const handleStartReading = () => {
    if (!question.trim()) {
      alert('请输入您的问题')
      return
    }
    
    if (!selectedSpread) {
      alert('请选择一个牌阵')
      return
    }

    // 检查 API 配置
    const apiKey = localStorage.getItem('tarot_api_key')
    const baseUrl = localStorage.getItem('tarot_api_base_url')
    
    if (!apiKey || !baseUrl) {
      alert('请先在设置页面配置您的 API')
      router.push('/settings')
      return
    }

    // 保存问题和牌阵到 sessionStorage
    sessionStorage.setItem('tarot_question', question)
    sessionStorage.setItem('tarot_spread', selectedSpread)
    
    // 跳转到抽牌页面
    router.push('/draw')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🔮 TarotWhisper
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            探索内心的智慧，聆听塔罗的低语。输入您的问题，选择牌阵，让古老的智慧为您指引方向。
          </p>
        </div>

        {/* API Warning */}
        {showApiWarning && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⚠️</span>
                  <div>
                    <h3 className="text-yellow-300 font-medium">需要配置 API</h3>
                    <p className="text-yellow-200 text-sm">
                      请先配置您的 OpenAI 兼容 API 以开始占卜
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/settings')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  前往设置
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
            
            {/* Question Input */}
            <div className="mb-8">
              <label htmlFor="question" className="block text-lg font-medium text-white mb-4">
                💭 您的问题
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="请输入您想要占卜的问题，例如：我最近的感情运势如何？我是否应该在今年内换工作？"
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-400 mt-2">
                💡 提示：问题越具体，占卜结果越准确。避免过于宽泛的问题。
              </p>
            </div>

            {/* Spread Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-white mb-4">🃏 选择牌阵</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spreadsData.spreads.map((spread: Spread) => (
                  <div
                    key={spread.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedSpread === spread.id
                        ? 'border-purple-400 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedSpread(spread.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium">{spread.name}</h3>
                      <span className="text-purple-300 text-sm bg-purple-500/20 px-2 py-1 rounded">
                        {spread.cardCount} 张牌
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{spread.englishName}</p>
                    <p className="text-gray-400 text-sm">{spread.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={handleStartReading}
                disabled={!question.trim() || !selectedSpread}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
              >
                ✨ 开始占卜
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/settings')}
              className="text-gray-300 hover:text-white transition-colors duration-200 underline"
            >
              ⚙️ API 设置
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
