'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import tarotCardsData from '../../data/tarot-cards.json'
import spreadsData from '../../data/spreads.json'
import SpreadLayout from '../../components/SpreadLayout'

interface TarotCard {
  id: string | number
  name: string
  englishName: string
  suit: string
  uprightKeywords: string[]
  reversedKeywords: string[]
}

interface DrawnCard {
  card: TarotCard
  isReversed: boolean
  position: {
    id: number
    name: string
    description: string
  }
}

interface Spread {
  id: string
  name: string
  englishName: string
  description: string
  cardCount: number
  positions: Array<{
    id: number
    name: string
    description: string
  }>
}

export default function DrawPage() {
  const [question, setQuestion] = useState('')
  const [spread, setSpread] = useState<Spread | null>(null)
  const [, setAllCards] = useState<TarotCard[]>([])
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([])
  const [drawingPositionId, setDrawingPositionId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    // 从 sessionStorage 获取问题和牌阵
    const savedQuestion = sessionStorage.getItem('tarot_question')
    const savedSpreadId = sessionStorage.getItem('tarot_spread')
    
    if (!savedQuestion || !savedSpreadId) {
      router.push('/')
      return
    }

    // 使用 setTimeout 避免同步 setState
    setTimeout(() => {
      setQuestion(savedQuestion)
      
      // 找到对应的牌阵
      const selectedSpread = spreadsData.spreads.find(s => s.id === savedSpreadId)
      if (!selectedSpread) {
        router.push('/')
        return
      }
      setSpread(selectedSpread)

      // 准备所有塔罗牌数据
      const cards: TarotCard[] = []
      
      // 添加大阿尔卡那
      tarotCardsData.majorArcana.forEach(card => {
        cards.push({
          id: card.id,
          name: card.name,
          englishName: card.englishName,
          suit: card.suit,
          uprightKeywords: card.uprightKeywords,
          reversedKeywords: card.reversedKeywords
        })
      })

      // 添加小阿尔卡那
      Object.entries(tarotCardsData.minorArcana).forEach(([, suitCards]) => {
        suitCards.forEach(card => {
          cards.push({
            id: card.id,
            name: card.name,
            englishName: card.englishName,
            suit: card.suit,
            uprightKeywords: card.uprightKeywords,
            reversedKeywords: card.reversedKeywords
          })
        })
      })

      setAllCards(cards)
      
      // 洗牌 - Fisher-Yates 算法
      const shuffled = [...cards]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      setShuffledDeck(shuffled)
    }, 0)
  }, [router])

  const drawCardAtPosition = (positionId: number) => {
    if (!spread || isDrawing || currentCardIndex >= spread.cardCount) return
    
    // 检查该位置是否已经抽过牌
    const alreadyDrawn = drawnCards.some(card => card.position.id === positionId)
    if (alreadyDrawn) return

    setIsDrawing(true)
    setDrawingPositionId(positionId)

    // 模拟抽牌动画延迟
    setTimeout(() => {
      const card = shuffledDeck[currentCardIndex]
      const isReversed = Math.random() < 0.5 // 50% 概率逆位
      const position = spread.positions.find(p => p.id === positionId)!

      const drawnCard: DrawnCard = {
        card,
        isReversed,
        position
      }

      setDrawnCards(prev => [...prev, drawnCard])
      setCurrentCardIndex(prev => prev + 1)
      setIsDrawing(false)
      setDrawingPositionId(null)
    }, 1000)
  }

  // 获取指定位置的已抽牌
  const getCardAtPosition = (positionId: number): DrawnCard | null => {
    return drawnCards.find(card => card.position.id === positionId) || null
  }

  // 检查位置是否可以抽牌
  const canDrawAtPosition = (positionId: number): boolean => {
    return !getCardAtPosition(positionId) && !isDrawing
  }

  const handleAnalyze = () => {
    // 保存抽牌结果到 sessionStorage
    sessionStorage.setItem('tarot_drawn_cards', JSON.stringify(drawnCards))
    router.push('/analysis')
  }

  if (!spread) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    )
  }

  const isComplete = drawnCards.length === spread.cardCount

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">🔮 抽牌中</h1>
            <p className="text-gray-300 mb-4">您的问题：{question}</p>
            <p className="text-purple-300">牌阵：{spread.name} ({spread.cardCount} 张牌)</p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-center items-center mb-4">
              <div className="text-white text-lg">
                进度：{drawnCards.length} / {spread.cardCount}
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(drawnCards.length / spread.cardCount) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* 抽牌指引 */}
          {!isComplete && (
            <div className="text-center mb-8">
              <div className="text-white">
                <div className="text-lg font-medium mb-2">
                  {isDrawing ? '正在抽牌...' : '点击下方位置进行抽牌'}
                </div>
                <p className="text-gray-300 text-sm">
                  请按照牌阵布局，点击相应位置抽取塔罗牌
                </p>
              </div>
            </div>
          )}

          {/* 牌阵布局 */}
          <div className="mb-8">
            <SpreadLayout
              spreadId={spread.id}
              positions={spread.positions}
              drawnCards={drawnCards}
              onPositionClick={drawCardAtPosition}
              canDrawAtPosition={canDrawAtPosition}
              isDrawing={isDrawing}
              drawingPositionId={drawingPositionId}
            />
          </div>

          {/* Complete Button */}
          {isComplete && (
            <div className="text-center">
              <button
                onClick={handleAnalyze}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                ✨ 开始分析
              </button>
            </div>
          )}

          {/* Back Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/')}
              className="text-gray-300 hover:text-white transition-colors duration-200 underline"
            >
              ← 返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
