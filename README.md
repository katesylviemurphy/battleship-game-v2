# Battleship Command Center

A modern, polished Battleship web game built as an interview-quality portfolio piece. Features a sleek command-center UI, three AI difficulty modes, and a strategic Sonar Scan ability.

![Built with React + TypeScript + Tailwind](https://img.shields.io/badge/React-TypeScript-blue) ![Vite](https://img.shields.io/badge/Vite-purple)

## How to Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Architecture Overview

```
src/
├── types/
│   └── game.ts          # All TypeScript interfaces, types, and constants
├── logic/
│   ├── board.ts         # Board creation, ship placement, attack resolution
│   └── ai.ts            # AI targeting strategies (Easy/Medium/Hard)
├── hooks/
│   └── useGame.ts       # Game state management via useReducer
├── components/
│   ├── Board.tsx         # 10x10 grid with coordinate labels
│   ├── Cell.tsx          # Individual cell with state-based rendering
│   ├── GameStatus.tsx    # Turn indicator and game messages
│   ├── ShipTracker.tsx   # Fleet status (remaining/sunk ships)
│   ├── DifficultySelector.tsx  # AI difficulty toggle
│   ├── SonarButton.tsx   # Sonar scan ability control
│   └── Header.tsx        # App header with restart button
├── App.tsx               # Main layout composing all components
├── main.tsx              # Entry point
└── index.css             # Tailwind config, custom theme, animations
```

### Key Architectural Decisions

**Separation of concerns**: Game logic lives entirely in `logic/` — pure functions with no React dependencies. The UI layer in `components/` is purely presentational. State management sits in `hooks/useGame.ts` using `useReducer`, which provides a clean action-based interface between the two.

**useReducer over useState**: The game has interconnected state (boards, ships, turns, sonar) where a single action can update multiple pieces. `useReducer` keeps these transitions atomic and predictable — each action type maps to one clear state transformation.

**Memoized cells**: The `Cell` component uses `React.memo` to prevent re-rendering all 200 cells on every state change. Only cells whose props actually change will re-render.

**Type-driven design**: Every game concept (ships, cells, coordinates, game phases) has an explicit TypeScript type. This makes the code self-documenting and catches bugs at compile time.

## Main Product Decisions

### Sonar Scan (Strategic Ability)
The player gets **2 sonar scans per game** that reveal whether any ship segment exists in a 3×3 area. This adds a strategic layer without breaking game balance:
- Limited uses force careful timing
- Reveals presence, not exact position — still requires deduction
- Visual feedback (sonar log, revealed cells) makes it feel tactical

### AI Difficulty Modes
Three distinct AI strategies, each understandable and explainable:

| Mode | Strategy | Behavior |
|------|----------|----------|
| **Easy** | Random | Fires at random unattacked cells |
| **Medium** | Hunt & Target | Random search until a hit, then systematically checks adjacent cells |
| **Hard** | Probability Density | Calculates where remaining ships could fit, targets highest-probability cells. Heavily weights cells adjacent to existing hits |

### Visual Design
A dark naval/command-center theme using a custom color palette (navy, ocean, sonar green, hit red). The design aims to feel professional and premium without being cheesy — think military UI, not cartoon boats.

## How the AI Works

### Easy Mode
Pure random targeting — picks any unattacked cell with equal probability. Simple but fair for casual play.

### Medium Mode (Hunt & Target)
Maintains a state machine with two modes:
1. **Search mode**: Fires randomly until scoring a hit
2. **Hunt mode**: On a hit, adds all valid adjacent cells to a target queue. Processes the queue until empty, then returns to search mode

This mimics how a human naturally plays — random exploration followed by focused investigation.

### Hard Mode (Probability Density)
For each unattacked cell, calculates how many valid ship placements (of all remaining unsunk ship sizes) could cover that cell. The cell with the highest count is the most likely to contain a ship.

Key optimization: When there are existing hits (unsunk), placements covering those hits get a 20× weight multiplier. This makes the AI aggressively pursue partially-hit ships while still making smart probabilistic guesses elsewhere.

## Interview Talking Points

### Why this is more than a basic Battleship clone
- **Three-tier AI** with distinct, explainable algorithms — not just random moves
- **Sonar Scan** adds a strategic ability that demonstrates UX thinking (limited resource, area reveal, visual feedback)
- **Clean architecture** with game logic fully separated from UI — the `logic/` folder could power a CLI or multiplayer backend
- **Type-driven design** with comprehensive TypeScript interfaces — no `any` types, no shortcuts
- **Performance-conscious** cell memoization, reducer-based state management
- **Polished UX** with animations, visual feedback for every state, and a cohesive design system

### Tradeoffs Made
- **Auto-placement over manual**: Chose automatic ship placement to keep the game fast and focused on the core loop. Manual placement would add complexity without proportional UX value for an interview demo
- **useReducer over external state library**: Kept dependencies minimal. The game state is local and doesn't need global state management — `useReducer` is the right tool at this scale
- **Module-level AI state**: The medium AI's hunt state is stored at module level rather than in React state. This keeps AI internals out of the UI layer, though it means the AI state isn't serializable. Acceptable tradeoff for a single-player game
- **No sound effects**: Prioritized visual polish over audio. Sound requires careful UX (autoplay policies, volume control, mute toggle) and would add complexity without strengthening the engineering narrative

### Where I would extend it next
- **Manual ship placement** with drag-and-drop using a proper DnD library
- **Multiplayer** via WebSockets — the pure logic layer is already backend-ready
- **Game replay** — since state transitions are action-based (reducer pattern), recording and replaying games is straightforward
- **Accessibility** — full keyboard navigation, ARIA labels for screen readers, high-contrast mode
- **Mobile optimization** — responsive grid sizing, touch-friendly targets
- **Analytics dashboard** — win rate by difficulty, average turns to win, sonar scan effectiveness
