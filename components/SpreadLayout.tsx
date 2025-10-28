import FlipCard from './FlipCard'

interface Position {
  id: number
  name: string
  description: string
}

interface DrawnCard {
  card: {
    id: string | number
    name: string
    englishName: string
  }
  isReversed: boolean
  position: Position
}

interface SpreadLayoutProps {
  spreadId: string
  positions: Position[]
  drawnCards: DrawnCard[]
  onPositionClick: (positionId: number) => void
  canDrawAtPosition: (positionId: number) => boolean
  isDrawing: boolean
  drawingPositionId: number | null
}

export default function SpreadLayout({
  spreadId,
  positions,
  drawnCards,
  onPositionClick,
  canDrawAtPosition,
  drawingPositionId
}: SpreadLayoutProps) {
  const getCardAtPosition = (positionId: number): DrawnCard | null => {
    return drawnCards.find(card => card.position.id === positionId) || null
  }

  const renderPosition = (position: Position, className: string = '') => {
    const drawnCard = getCardAtPosition(position.id)
    const canDraw = canDrawAtPosition(position.id)
    const isCurrentlyDrawing = drawingPositionId === position.id

    return (
      <div key={position.id} className={`relative ${className}`}>
        {/* 位置标签 */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-purple-600/80 text-white text-xs px-3 py-1 rounded whitespace-nowrap">
            {position.name}
          </div>
        </div>

        {/* 卡牌位置 - 调大尺寸 */}
        <div 
          className={`w-32 h-48 border-2 border-dashed border-purple-400/50 rounded-lg flex items-center justify-center transition-all duration-300 ${
            canDraw ? 'cursor-pointer hover:border-purple-400 hover:bg-purple-500/10' : ''
          } ${isCurrentlyDrawing ? 'border-purple-400 bg-purple-500/20 animate-pulse' : ''}`}
          onClick={() => canDraw && onPositionClick(position.id)}
        >
          {drawnCard ? (
            <FlipCard
              cardId={drawnCard.card.id}
              cardName="" // 不在卡牌组件内显示名称
              englishName=""
              isReversed={drawnCard.isReversed}
              autoFlip={true}
              flipDelay={500}
              className="w-full h-full"
            />
          ) : (
            <div className="text-center text-purple-300">
              {isCurrentlyDrawing ? (
                <div className="text-sm">抽牌中...</div>
              ) : canDraw ? (
                <div className="text-sm">点击抽牌</div>
              ) : (
                <div className="text-sm opacity-50">等待</div>
              )}
            </div>
          )}
        </div>

        {/* 只显示已抽牌的牌名，不显示位置描述 */}
        {drawnCard && (
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-36">
            <div className="text-center">
              <div className="text-white font-medium text-sm mb-1">{drawnCard.card.name}</div>
              <div className="text-gray-400 text-xs">{drawnCard.card.englishName}</div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 根据不同牌阵返回不同布局
  switch (spreadId) {
    case 'single_card':
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          {renderPosition(positions[0])}
        </div>
      )

    case 'three_card_time':
    case 'three_card_mind_body_spirit':
      return (
        <div className="flex justify-center items-center gap-12 min-h-[400px]">
          {positions.map((position, index) => 
            renderPosition(position, index === 1 ? 'mt-6' : '')
          )}
        </div>
      )

    case 'celtic_cross':
      return (
        <div className="min-h-[900px] max-w-7xl mx-auto px-4 py-8">
          {/* 重新设计的凯尔特十字：每张牌都有独立空间，增大间距 */}
          <div className="grid grid-cols-7 gap-10 max-w-6xl mx-auto">
            
            {/* 第一行：上方牌 */}
            <div className="col-start-4 col-span-1 flex justify-center">
              {renderPosition(positions[4])} {/* 可能的未来 */}
            </div>
            
            {/* 第二行：左侧牌 + 挑战牌 + 中心牌 + 近期未来牌 */}
            <div className="col-start-2 col-span-1 flex justify-center">
              {renderPosition(positions[3])} {/* 过去影响 */}
            </div>
            
            <div className="col-start-3 col-span-1 flex justify-center">
              {renderPosition(positions[1])} {/* 挑战/障碍 */}
            </div>
            
            <div className="col-start-4 col-span-1 flex justify-center">
              {renderPosition(positions[0])} {/* 现状 */}
            </div>
            
            <div className="col-start-5 col-span-1 flex justify-center">
              {renderPosition(positions[5])} {/* 近期未来 */}
            </div>
            
            {/* 第三行：下方牌 */}
            <div className="col-start-4 col-span-1 flex justify-center">
              {renderPosition(positions[2])} {/* 基础/根源 */}
            </div>
            
            {/* 右侧竖列 - 增大间距 */}
            <div className="col-start-7 row-start-1 row-span-4 flex flex-col justify-center gap-12 ml-8">
              {renderPosition(positions[6])} {/* 你的态度 */}
              {renderPosition(positions[7])} {/* 外部影响 */}
              {renderPosition(positions[8])} {/* 希望与恐惧 */}
              {renderPosition(positions[9])} {/* 最终结果 */}
            </div>
            
          </div>
        </div>
      )

    default:
      return (
        <div className="grid grid-cols-3 gap-8 justify-items-center min-h-[300px]">
          {positions.map((position) => renderPosition(position))}
        </div>
      )
  }
}
