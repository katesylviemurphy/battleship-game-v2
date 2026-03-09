import { useState, useCallback, useEffect } from 'react'
import './App.css'

type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk'
type Board = CellState[][]
type Ship = { name: string; size: number; color: string }
type PlacedShip = { ship: Ship; cells: [number, number][] }
type Orientation = 'horizontal' | 'vertical'
type GamePhase = 'placement' | 'playing' | 'gameOver'

const BOARD_SIZE = 10
const ROWS = 'ABCDEFGHIJ'.split('')
const COLS = Array.from({ length: 10 }, (_, i) => i + 1)

const SHIPS: Ship[] = [
  { name: 'Carrier', size: 5, color: '#6366f1' },
  { name: 'Battleship', size: 4, color: '#8b5cf6' },
  { name: 'Cruiser', size: 3, color: '#a855f7' },
  { name: 'Submarine', size: 3, color: '#d946ef' },
  { name: 'Destroyer', size: 2, color: '#ec4899' },
]

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => 'empty' as CellState)
  )
}

function canPlaceShip(board: Board, row: number, col: number, size: number, orientation: Orientation): boolean {
  for (let i = 0; i < size; i++) {
    const r = orientation === 'vertical' ? row + i : row
    const c = orientation === 'horizontal' ? col + i : col
    if (r >= BOARD_SIZE || c >= BOARD_SIZE) return false
    if (board[r][c] !== 'empty') return false
  }
  return true
}

function placeShipOnBoard(board: Board, row: number, col: number, size: number, orientation: Orientation): { board: Board; cells: [number, number][] } {
  const newBoard = board.map(r => [...r])
  const cells: [number, number][] = []
  for (let i = 0; i < size; i++) {
    const r = orientation === 'vertical' ? row + i : row
    const c = orientation === 'horizontal' ? col + i : col
    newBoard[r][c] = 'ship'
    cells.push([r, c])
  }
  return { board: newBoard, cells }
}

function randomPlacement(): { board: Board; ships: PlacedShip[] } {
  let board = createEmptyBoard()
  const ships: PlacedShip[] = []
  for (const ship of SHIPS) {
    let placed = false
    while (!placed) {
      const orientation: Orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical'
      const row = Math.floor(Math.random() * BOARD_SIZE)
      const col = Math.floor(Math.random() * BOARD_SIZE)
      if (canPlaceShip(board, row, col, ship.size, orientation)) {
        const result = placeShipOnBoard(board, row, col, ship.size, orientation)
        board = result.board
        ships.push({ ship, cells: result.cells })
        placed = true
      }
    }
  }
  return { board, ships }
}

function isShipSunk(shipCells: [number, number][], displayBoard: Board): boolean {
  return shipCells.every(([r, c]) => displayBoard[r][c] === 'hit' || displayBoard[r][c] === 'sunk')
}

function markSunk(board: Board, cells: [number, number][]): Board {
  const newBoard = board.map(r => [...r])
  for (const [r, c] of cells) { newBoard[r][c] = 'sunk' }
  return newBoard
}

function allShipsSunk(ships: PlacedShip[], displayBoard: Board): boolean {
  return ships.every(ps => isShipSunk(ps.cells, displayBoard))
}

type AiState = { mode: 'hunt' | 'target'; hits: [number, number][]; queue: [number, number][]; tried: Set<string> }

function createAiState(): AiState {
  return { mode: 'hunt', hits: [], queue: [], tried: new Set() }
}

function cellKey(r: number, c: number): string { return r + ',' + c }

function getAdjacentCells(r: number, c: number): [number, number][] {
  return ([[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]] as [number, number][]).filter(([rr, cc]) => rr >= 0 && rr < BOARD_SIZE && cc >= 0 && cc < BOARD_SIZE)
}

function aiChooseTarget(ai: AiState): [number, number] {
  while (ai.queue.length > 0) {
    const target = ai.queue.shift()!
    if (!ai.tried.has(cellKey(target[0], target[1]))) return target
  }
  ai.mode = 'hunt'
  const candidates: [number, number][] = []
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if ((r + c) % 2 === 0 && !ai.tried.has(cellKey(r, c))) candidates.push([r, c])
    }
  }
  if (candidates.length === 0) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!ai.tried.has(cellKey(r, c))) candidates.push([r, c])
      }
    }
  }
  return candidates[Math.floor(Math.random() * candidates.length)]
}

function aiProcessResult(ai: AiState, r: number, c: number, wasHit: boolean, wasSunk: boolean): AiState {
  const newAi: AiState = { ...ai, hits: [...ai.hits], queue: [...ai.queue], tried: new Set(ai.tried) }
  newAi.tried.add(cellKey(r, c))
  if (wasHit) {
    newAi.hits.push([r, c])
    if (wasSunk) {
      newAi.mode = newAi.queue.length > 0 ? 'target' : 'hunt'
    } else {
      newAi.mode = 'target'
      for (const cell of getAdjacentCells(r, c)) {
        if (!newAi.tried.has(cellKey(cell[0], cell[1]))) newAi.queue.push(cell)
      }
    }
  }
  return newAi
}

function Cell({ state, isPlayerBoard, onClick, isPreview, isInvalid, shipColor }: {
  state: CellState; isPlayerBoard: boolean; onClick?: () => void; isPreview?: boolean; isInvalid?: boolean; shipColor?: string
}) {
  let bg = 'bg-sky-900/40'
  let content = ''
  let border = 'border-sky-700/30'
  const cursor = onClick ? 'cursor-crosshair' : 'cursor-default'
  let extra = ''

  if (state === 'ship' && isPlayerBoard) { bg = ''; border = 'border-sky-600/50' }
  else if (state === 'hit') { bg = 'bg-red-500/80'; content = '\u{1F4A5}'; border = 'border-red-400/60'; extra = 'animate-pulse' }
  else if (state === 'sunk') { bg = 'bg-red-700/90'; content = '\u{1F525}'; border = 'border-red-500/60' }
  else if (state === 'miss') { bg = 'bg-sky-800/60'; content = '\u2022'; border = 'border-sky-600/40' }

  if (isPreview && !isInvalid) { bg = 'bg-indigo-500/50'; border = 'border-indigo-400/60' }
  else if (isPreview && isInvalid) { bg = 'bg-red-500/40'; border = 'border-red-400/60' }

  return (
    <div onClick={onClick}
      className={'w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border ' + border + ' ' + bg + ' ' + cursor + ' ' + extra + ' text-sm transition-all duration-150 hover:brightness-125 rounded-sm relative'}
      style={state === 'ship' && isPlayerBoard && shipColor ? { backgroundColor: shipColor + '99' } : undefined}>
      {content}
    </div>
  )
}

function BoardGrid({ board, isPlayerBoard, onCellClick, previewCells, invalidPreview, placedShips, label, onCellHover, onMouseLeave }: {
  board: Board; isPlayerBoard: boolean; onCellClick?: (r: number, c: number) => void; previewCells?: [number, number][]
  invalidPreview?: boolean; placedShips?: PlacedShip[]; label: string; onCellHover?: (r: number, c: number) => void; onMouseLeave?: () => void
}) {
  const previewSet = new Set((previewCells || []).map(([r, c]) => cellKey(r, c)))
  function getShipColor(r: number, c: number): string | undefined {
    if (!placedShips) return undefined
    for (const ps of placedShips) { if (ps.cells.some(([cr, cc]) => cr === r && cc === c)) return ps.ship.color }
    return undefined
  }
  return (
    <div className="flex flex-col items-center" onMouseLeave={onMouseLeave}>
      <h2 className="text-lg font-bold text-sky-200 mb-3 tracking-wider uppercase">{label}</h2>
      <div className="inline-block">
        <div className="flex">
          <div className="w-8 h-8 sm:w-9 sm:h-9" />
          {COLS.map(c => (<div key={c} className="w-10 h-8 sm:w-11 sm:h-9 flex items-center justify-center text-xs font-semibold text-sky-400">{c}</div>))}
        </div>
        {board.map((row, ri) => (
          <div key={ri} className="flex">
            <div className="w-8 h-10 sm:w-9 sm:h-11 flex items-center justify-center text-xs font-semibold text-sky-400">{ROWS[ri]}</div>
            {row.map((cell, ci) => (
              <div key={ci} onMouseEnter={() => onCellHover?.(ri, ci)}>
                <Cell state={cell} isPlayerBoard={isPlayerBoard} onClick={onCellClick ? () => onCellClick(ri, ci) : undefined}
                  isPreview={previewSet.has(cellKey(ri, ci))} isInvalid={invalidPreview} shipColor={isPlayerBoard ? getShipColor(ri, ci) : undefined} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function ShipList({ ships, placedShips, currentShipIndex, sunkTracker }: {
  ships: Ship[]; placedShips: PlacedShip[]; currentShipIndex?: number; sunkTracker?: boolean[]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {ships.map((ship, i) => {
        const isPlaced = placedShips.length > i
        const isCurrent = currentShipIndex === i
        const isSunk = sunkTracker ? sunkTracker[i] : false
        return (
          <div key={ship.name} className={'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ' +
            (isCurrent ? 'bg-sky-800/60 ring-1 ring-sky-400' : isSunk ? 'bg-red-900/40 opacity-60' : isPlaced ? 'bg-sky-900/30 opacity-70' : 'bg-sky-900/20 opacity-50')}>
            <div className="flex gap-0.5">
              {Array.from({ length: ship.size }).map((_, j) => (
                <div key={j} className={'w-4 h-4 rounded-sm ' + (isSunk ? 'bg-red-600' : '')} style={!isSunk ? { backgroundColor: ship.color } : undefined} />
              ))}
            </div>
            <span className={'text-sm font-medium ' + (isSunk ? 'text-red-400 line-through' : 'text-sky-300')}>{ship.name}</span>
          </div>
        )
      })}
    </div>
  )
}

function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('placement')
  const [playerBoard, setPlayerBoard] = useState<Board>(createEmptyBoard)
  const [playerShips, setPlayerShips] = useState<PlacedShip[]>([])
  const [enemyBoard, setEnemyBoard] = useState<Board>(createEmptyBoard)
  const [enemyDisplayBoard, setEnemyDisplayBoard] = useState<Board>(createEmptyBoard)
  const [enemyShips, setEnemyShips] = useState<PlacedShip[]>([])
  const [playerDisplayBoard, setPlayerDisplayBoard] = useState<Board>(createEmptyBoard)
  const [currentShipIndex, setCurrentShipIndex] = useState(0)
  const [orientation, setOrientation] = useState<Orientation>('horizontal')
  const [hoverCell, setHoverCell] = useState<[number, number] | null>(null)
  const [aiState, setAiState] = useState<AiState>(createAiState)
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null)
  const [message, setMessage] = useState('Place your ships! Click to place, R to rotate.')
  const [playerSunkTracker, setPlayerSunkTracker] = useState<boolean[]>(SHIPS.map(() => false))
  const [enemySunkTracker, setEnemySunkTracker] = useState<boolean[]>(SHIPS.map(() => false))
  const [playerShots, setPlayerShots] = useState(0)
  const [playerHits, setPlayerHits] = useState(0)
  const [aiShots, setAiShots] = useState(0)
  const [aiHits, setAiHits] = useState(0)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'r' || e.key === 'R') setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal') }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const getPreviewCells = useCallback((): [number, number][] => {
    if (gamePhase !== 'placement' || !hoverCell || currentShipIndex >= SHIPS.length) return []
    const [r, c] = hoverCell
    const ship = SHIPS[currentShipIndex]
    const cells: [number, number][] = []
    for (let i = 0; i < ship.size; i++) {
      const rr = orientation === 'vertical' ? r + i : r
      const cc = orientation === 'horizontal' ? c + i : c
      if (rr < BOARD_SIZE && cc < BOARD_SIZE) cells.push([rr, cc])
    }
    return cells
  }, [gamePhase, hoverCell, currentShipIndex, orientation])

  const previewCells = getPreviewCells()
  const isPreviewInvalid = gamePhase === 'placement' && hoverCell && currentShipIndex < SHIPS.length
    ? !canPlaceShip(playerBoard, hoverCell[0], hoverCell[1], SHIPS[currentShipIndex].size, orientation) : false

  const handlePlacementClick = useCallback((r: number, c: number) => {
    if (gamePhase !== 'placement' || currentShipIndex >= SHIPS.length) return
    const ship = SHIPS[currentShipIndex]
    if (!canPlaceShip(playerBoard, r, c, ship.size, orientation)) return
    const result = placeShipOnBoard(playerBoard, r, c, ship.size, orientation)
    setPlayerBoard(result.board)
    setPlayerDisplayBoard(result.board.map(row => [...row]))
    setPlayerShips(prev => [...prev, { ship, cells: result.cells }])
    if (currentShipIndex + 1 >= SHIPS.length) {
      const enemy = randomPlacement()
      setEnemyBoard(enemy.board)
      setEnemyShips(enemy.ships)
      setGamePhase('playing')
      setMessage('All ships deployed! Fire at the enemy fleet!')
    } else {
      setCurrentShipIndex(currentShipIndex + 1)
      setMessage('Place your ' + SHIPS[currentShipIndex + 1].name + ' (' + SHIPS[currentShipIndex + 1].size + ' cells). Press R to rotate.')
    }
  }, [gamePhase, currentShipIndex, playerBoard, orientation])

  const handleRandomPlacement = useCallback(() => {
    const result = randomPlacement()
    setPlayerBoard(result.board)
    setPlayerDisplayBoard(result.board.map(row => [...row]))
    setPlayerShips(result.ships)
    setCurrentShipIndex(SHIPS.length)
    const enemy = randomPlacement()
    setEnemyBoard(enemy.board)
    setEnemyShips(enemy.ships)
    setGamePhase('playing')
    setMessage('All ships deployed! Fire at the enemy fleet!')
  }, [])

  const handlePlayerFire = useCallback((r: number, c: number) => {
    if (gamePhase !== 'playing' || !isPlayerTurn) return
    if (enemyDisplayBoard[r][c] !== 'empty') return
    setPlayerShots(s => s + 1)
    const newDisplay = enemyDisplayBoard.map(row => [...row])
    if (enemyBoard[r][c] === 'ship') {
      newDisplay[r][c] = 'hit'
      setPlayerHits(h => h + 1)
      const newSunkTracker = [...enemySunkTracker]
      let sunkName = ''
      for (let i = 0; i < enemyShips.length; i++) {
        if (!newSunkTracker[i] && isShipSunk(enemyShips[i].cells, newDisplay)) {
          newSunkTracker[i] = true
          const marked = markSunk(newDisplay, enemyShips[i].cells)
          for (let rr = 0; rr < BOARD_SIZE; rr++) for (let cc = 0; cc < BOARD_SIZE; cc++) newDisplay[rr][cc] = marked[rr][cc]
          sunkName = enemyShips[i].ship.name
        }
      }
      setEnemySunkTracker(newSunkTracker)
      setEnemyDisplayBoard(newDisplay)
      if (allShipsSunk(enemyShips, newDisplay)) { setWinner('player'); setGamePhase('gameOver'); setMessage('Victory! You sank the entire enemy fleet!'); return }
      setMessage(sunkName ? 'Direct hit! You sank their ' + sunkName + '!' : 'Hit! Nice shot!')
    } else {
      newDisplay[r][c] = 'miss'
      setEnemyDisplayBoard(newDisplay)
      setMessage('Miss! Enemy is taking aim...')
    }
    setIsPlayerTurn(false)
  }, [gamePhase, isPlayerTurn, enemyDisplayBoard, enemyBoard, enemyShips, enemySunkTracker])

  useEffect(() => {
    if (gamePhase !== 'playing' || isPlayerTurn) return
    const timeout = setTimeout(() => {
      const [r, c] = aiChooseTarget(aiState)
      setAiShots(s => s + 1)
      const newDisplay = playerDisplayBoard.map(row => [...row])
      let wasHit = false, wasSunk = false
      if (playerBoard[r][c] === 'ship') {
        newDisplay[r][c] = 'hit'; wasHit = true; setAiHits(h => h + 1)
        const newSunkTracker = [...playerSunkTracker]
        let sunkName = ''
        for (let i = 0; i < playerShips.length; i++) {
          if (!newSunkTracker[i] && isShipSunk(playerShips[i].cells, newDisplay)) {
            newSunkTracker[i] = true; wasSunk = true
            const marked = markSunk(newDisplay, playerShips[i].cells)
            for (let rr = 0; rr < BOARD_SIZE; rr++) for (let cc = 0; cc < BOARD_SIZE; cc++) newDisplay[rr][cc] = marked[rr][cc]
            sunkName = playerShips[i].ship.name
          }
        }
        setPlayerSunkTracker(newSunkTracker)
        setPlayerDisplayBoard(newDisplay)
        if (allShipsSunk(playerShips, newDisplay)) { setWinner('ai'); setGamePhase('gameOver'); setMessage('Defeat! The enemy sank your entire fleet!'); return }
        setMessage(sunkName ? 'Enemy sank your ' + sunkName + '! Your turn - fire back!' : 'Enemy hit one of your ships! Your turn!')
      } else {
        newDisplay[r][c] = 'miss'; setPlayerDisplayBoard(newDisplay); setMessage("Enemy missed! It's your turn!")
      }
      setAiState(aiProcessResult(aiState, r, c, wasHit, wasSunk))
      setIsPlayerTurn(true)
    }, 800)
    return () => clearTimeout(timeout)
  }, [gamePhase, isPlayerTurn, aiState, playerBoard, playerDisplayBoard, playerShips, playerSunkTracker])

  const handleNewGame = () => {
    setGamePhase('placement'); setPlayerBoard(createEmptyBoard()); setPlayerShips([]); setEnemyBoard(createEmptyBoard())
    setEnemyDisplayBoard(createEmptyBoard()); setEnemyShips([]); setPlayerDisplayBoard(createEmptyBoard())
    setCurrentShipIndex(0); setOrientation('horizontal'); setHoverCell(null); setAiState(createAiState())
    setIsPlayerTurn(true); setWinner(null); setMessage('Place your ships! Click to place, R to rotate.')
    setPlayerSunkTracker(SHIPS.map(() => false)); setEnemySunkTracker(SHIPS.map(() => false))
    setPlayerShots(0); setPlayerHits(0); setAiShots(0); setAiHits(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white">
      <header className="py-4 px-6 border-b border-sky-800/40 bg-slate-900/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{'\u{1F6A2}'}</span>
            <h1 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-sky-300 to-indigo-400 bg-clip-text text-transparent">BATTLESHIP</h1>
          </div>
          <div className="flex items-center gap-4">
            {gamePhase === 'placement' && (
              <button onClick={handleRandomPlacement} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition-colors">Random Placement</button>
            )}
            <button onClick={handleNewGame} className="px-4 py-2 bg-sky-700 hover:bg-sky-600 rounded-lg text-sm font-semibold transition-colors">New Game</button>
          </div>
        </div>
      </header>

      <div className="py-3 px-6 bg-sky-900/30 border-b border-sky-800/30">
        <div className="max-w-7xl mx-auto">
          <p className={'text-center text-lg font-semibold ' + (winner === 'player' ? 'text-emerald-400' : winner === 'ai' ? 'text-red-400' : 'text-sky-200')}>{message}</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {gamePhase === 'placement' ? (
          <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
            <BoardGrid board={playerBoard} isPlayerBoard={true} onCellClick={handlePlacementClick}
              onCellHover={(r, c) => setHoverCell([r, c])} onMouseLeave={() => setHoverCell(null)}
              previewCells={previewCells} invalidPreview={isPreviewInvalid} placedShips={playerShips} label="Your Fleet" />
            <div className="flex flex-col gap-4">
              <h3 className="text-sky-300 font-semibold text-sm uppercase tracking-wider">Ships to Place</h3>
              <ShipList ships={SHIPS} placedShips={playerShips} currentShipIndex={currentShipIndex} />
              <div className="mt-4 p-3 bg-sky-900/30 rounded-lg border border-sky-800/40">
                <p className="text-sky-400 text-sm">
                  <span className="font-semibold">Orientation:</span>{' '}
                  {orientation === 'horizontal' ? '\u27A1\uFE0F Horizontal' : '\u2B07\uFE0F Vertical'}
                </p>
                <p className="text-sky-500 text-xs mt-1">Press <kbd className="px-1.5 py-0.5 bg-sky-800 rounded text-sky-300 text-xs">R</kbd> to rotate</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {gamePhase === 'gameOver' && (
              <div className="flex gap-8 p-4 bg-sky-900/30 rounded-xl border border-sky-800/40">
                <div className="text-center">
                  <p className="text-sky-400 text-xs uppercase tracking-wider">Your Shots</p>
                  <p className="text-2xl font-bold text-sky-200">{playerShots}</p>
                  <p className="text-sky-500 text-xs">{playerShots > 0 ? Math.round((playerHits / playerShots) * 100) + '% accuracy' : ''}</p>
                </div>
                <div className="text-center">
                  <p className="text-sky-400 text-xs uppercase tracking-wider">Enemy Shots</p>
                  <p className="text-2xl font-bold text-sky-200">{aiShots}</p>
                  <p className="text-sky-500 text-xs">{aiShots > 0 ? Math.round((aiHits / aiShots) * 100) + '% accuracy' : ''}</p>
                </div>
              </div>
            )}
            <div className="flex flex-col xl:flex-row items-start justify-center gap-8">
              <div className="flex flex-col items-center gap-3">
                <BoardGrid board={enemyDisplayBoard} isPlayerBoard={false}
                  onCellClick={gamePhase === 'playing' && isPlayerTurn ? handlePlayerFire : undefined} label="Enemy Waters" />
                <div className="mt-2">
                  <h3 className="text-sky-400 font-semibold text-xs uppercase tracking-wider mb-2 text-center">Enemy Fleet</h3>
                  <ShipList ships={SHIPS} placedShips={enemyShips} sunkTracker={enemySunkTracker} />
                </div>
              </div>
              <div className="flex flex-col items-center gap-3">
                <BoardGrid board={playerDisplayBoard} isPlayerBoard={true} placedShips={playerShips} label="Your Fleet" />
                <div className="mt-2">
                  <h3 className="text-sky-400 font-semibold text-xs uppercase tracking-wider mb-2 text-center">Your Fleet</h3>
                  <ShipList ships={SHIPS} placedShips={playerShips} sunkTracker={playerSunkTracker} />
                </div>
              </div>
            </div>
            {gamePhase === 'playing' && (
              <div className={'px-6 py-2 rounded-full text-sm font-bold ' + (isPlayerTurn ? 'bg-emerald-600/60 text-emerald-200' : 'bg-amber-600/60 text-amber-200')}>
                {isPlayerTurn ? '\u{1F3AF} YOUR TURN - Click on enemy waters to fire!' : '\u23F3 Enemy is firing...'}
              </div>
            )}
            {gamePhase === 'gameOver' && (
              <button onClick={handleNewGame} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-lg font-bold transition-colors shadow-lg shadow-indigo-500/20">Play Again</button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
