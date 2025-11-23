# DabaaGO

Premium minimalist chess puzzle web application with blitz and time-limit modes. Built for speed, precision, and offline play.

## Overview

DabaaGO is a production-ready, single-repo web application that provides an engaging chess puzzle experience without requiring server-side authentication. All user progress is stored locally on the device, with full import/export capabilities. The app features multiple game modes, a beautiful 2.5D SVG board, and integrates with Stockfish WebAssembly for local analysis.

### Key Features

- **Multiple Game Modes**: Blitz Puzzles, Timed Limited-Piece, Practice, Ultra Mode, Rated Progression, Daily Puzzle
- **Local-First**: All progress stored in IndexedDB, no server required
- **Offline Support**: Works completely offline with seeded puzzle dataset
- **2.5D Visual Style**: Minimalist SVG board with subtle depth effects
- **Engine Integration**: Stockfish WebAssembly for hints and analysis
- **Export/Import**: Full progress backup and restore functionality
- **Accessibility**: Keyboard navigation, ARIA labels, high contrast support
- **PWA Ready**: Progressive Web App with service worker for offline play

## Architecture

### Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS with custom 2.5D effects
- **Chess Logic**: [chess.js](https://github.com/jhlywa/chess.js) for move generation/validation
- **Engine**: Stockfish WebAssembly ([lichess-org/stockfish.wasm](https://github.com/lichess-org/stockfish.wasm) or [nmrugg/stockfish.js](https://github.com/nmrugg/stockfish.js))
- **Storage**: IndexedDB via [idb](https://github.com/jakearchibald/idb) with localStorage fallback
- **Board**: Custom SVG board component with 2.5D styling
- **Testing**: Vitest with React Testing Library

### Project Structure

```
dabaaGO/
├── src/
│   ├── components/          # React components
│   │   ├── Board/          # Chess board and pieces
│   │   ├── Timer/          # High-precision timer
│   │   ├── Settings/       # User settings UI
│   │   ├── Stats/          # Statistics display
│   │   └── ExportImport/   # Progress export/import
│   ├── modes/              # Game mode implementations
│   │   ├── BlitzMode.tsx
│   │   └── PracticeMode.tsx
│   ├── services/           # Core services
│   │   ├── localStore.ts   # IndexedDB wrapper
│   │   ├── puzzleImporter.ts # Dataset import
│   │   └── engine.ts       # Stockfish wrapper
│   ├── hooks/              # React hooks
│   │   └── usePuzzle.ts    # Puzzle game state
│   ├── types/              # TypeScript types
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── scripts/
│   ├── fetchDatasets.ts    # Download puzzle datasets
│   └── buildSeed.ts        # Build seed dataset
├── data/
│   └── seed.json           # Curated seed puzzles (~2k)
├── tests/                  # Test files
├── public/                 # Static assets
└── .github/workflows/      # CI configuration
```

## Developer Quickstart

### Prerequisites

- Node.js 20+ and npm
- Git

### Installation

1. **Clone the repository** (or navigate to the project directory):
   ```bash
   cd dabaaGO
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Import seed puzzle data** (optional, app works with built-in seed):
   ```bash
   npm run fetch-datasets
   ```
   
   If the download fails (network issues, CORS, etc.), the app will use the included seed dataset in `data/seed.json`.

4. **Start development server**:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory. Preview the production build:

```bash
npm run preview
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Dataset Management

### Primary Puzzle Sources

1. **432k FEN Puzzles**: [rebeccaloran/432k-chess-puzzles](https://github.com/rebeccaloran/432k-chess-puzzles)
   - Primary dataset with 432,000 puzzles in FEN format
   - Automatically downloaded and processed by `fetchDatasets.ts`

2. **Lichess Database**: [database.lichess.org](https://database.lichess.org/)
   - Supplemental puzzles and game dumps
   - Used for additional puzzle variety

3. **Chess Puzzles API**: [chess-puzzles-api.vercel.app](https://chess-puzzles-api.vercel.app/)
   - Optional lightweight API for fetching puzzles
   - Disabled by default (requires user permission)

4. **PGN Mentor**: [pgnmentor.com/files.html](https://www.pgnmentor.com/files.html)
   - Additional PGN datasets for extended puzzle sources

### Fetching Datasets

The `scripts/fetchDatasets.ts` script downloads and preprocesses puzzle datasets:

```bash
npm run fetch-datasets
```

**What it does**:
- Downloads the 432k FEN dataset from GitHub
- Parses and validates puzzle FEN strings
- Deduplicates puzzles by position
- Estimates difficulty from solution length
- Saves full dataset to `data/puzzles-full.json`
- Builds a curated seed of ~2000 puzzles to `data/seed.json`

**If download fails**:
- The script will log warnings but continue
- The app uses the included `data/seed.json` as fallback
- You can manually download datasets and place them in `data/raw/` for processing

### Building Seed Dataset

To rebuild the seed from an existing full dataset:

```bash
npm run build-seed
```

This creates a diverse selection of puzzles across all difficulty levels.

### Dataset Format

Puzzles are stored as JSON with the following structure:

```typescript
interface Puzzle {
  id: string;                    // Unique identifier
  fen: string;                   // Starting position in FEN
  solution: string[];            // Array of moves in SAN format
  rating?: number;               // Estimated puzzle rating
  difficulty: 'simple' | 'medium' | 'hard' | 'ultra';
  theme?: string[];              // Puzzle themes (e.g., 'mate', 'tactic')
  pieceCount?: number;           // Number of pieces on board
  thumbnailFen?: string;         // FEN for thumbnail generation
  sourceUrl?: string;            // Original source URL
}
```

## Import/Export Progress

### Exporting Progress

1. Navigate to the main menu
2. Click "Export / Import"
3. Click "Export Progress"
4. A JSON file will be downloaded with all your progress, statistics, and settings

### Importing Progress

1. Navigate to the main menu
2. Click "Export / Import"
3. Click "Choose File" and select a previously exported JSON file
4. Your progress will be restored (refresh the page if needed)

### Export Format

The export file contains:
- Version information
- Export date
- All puzzle progress (solved/attempted status, best times, streaks)
- User statistics (total puzzles, accuracy, streaks, etc.)
- Game settings (theme, time limits, difficulty preferences)

## Configuration

### Settings

Access settings from the main menu:

- **Theme**: Light or Dark mode
- **Piece Style**: Minimal, Rounded, or Geometric
- **Time Limit**: 30s, 60s, 90s, 120s, or Unlimited
- **Difficulty**: Adaptive, Simple, Medium, Hard, or Ultra
- **Engine Strength**: 1-20 (affects hint quality and analysis depth)
- **Sound**: Enable/disable move sounds
- **Animations**: Enable/disable visual animations

### Changing Piece Assets

SVG chess pieces are rendered using Unicode symbols by default. To use custom SVG assets:

1. Place SVG files in `public/assets/pieces/`
2. Update `src/components/Board/Piece.tsx` to load custom SVGs
3. Support multiple styles: minimal, rounded, geometric

Example structure:
```
public/assets/pieces/
├── minimal/
│   ├── white-king.svg
│   ├── white-queen.svg
│   └── ...
├── rounded/
└── geometric/
```

## Game Modes

### Blitz Puzzles

Fast-paced continuous puzzle stream with per-puzzle time limits. Score points for correct solves, maintain streaks, and compete against the clock.

### Practice Mode

Unlimited time to study puzzles. Show solutions on demand, analyze multiple move lines, and learn at your own pace.

### Timed Limited-Piece

Endgame-focused puzzles with reduced piece counts (e.g., K+Q vs K+R). Short timers emphasize technique and precision.

### Ultra Mode

Multi-move forced mate puzzles with strict timers. Advanced puzzles for experienced players.

### Rated Progression

Adaptive difficulty selection based on your performance. The system adjusts puzzle difficulty to match your skill level.

### Daily Puzzle

One special puzzle per day. Challenge yourself with a curated puzzle that changes daily.

## Troubleshooting

### Engine Not Loading

**Symptoms**: Hints don't work, analysis unavailable

**Solutions**:
1. Check browser console for errors
2. Ensure WebAssembly is supported (modern browsers)
3. Try refreshing the page
4. Check network tab for failed asset loads
5. The app will gracefully degrade to chess.js-only validation

### IndexedDB Quota Exceeded

**Symptoms**: Progress not saving, "QuotaExceededError" in console

**Solutions**:
1. Clear browser storage for the site (Settings → Privacy → Clear site data)
2. Export your progress before clearing
3. Reduce puzzle dataset size (use seed only)
4. Check browser storage limits (usually 50MB-1GB depending on browser)

### CORS Errors When Fetching Datasets

**Symptoms**: `fetchDatasets.ts` fails with CORS errors

**Solutions**:
1. Run the script in Node.js (not browser) - it should work automatically
2. If using browser, download datasets manually:
   - Visit [432k-chess-puzzles](https://github.com/rebeccaloran/432k-chess-puzzles)
   - Download `puzzles.txt` manually
   - Place in `data/raw/puzzles.txt`
   - Modify `fetchDatasets.ts` to read from local file
3. Use the included seed dataset (`data/seed.json`)

### Puzzles Not Loading

**Symptoms**: "No puzzles available" message

**Solutions**:
1. Check that `data/seed.json` exists
2. Run `npm run fetch-datasets` to import puzzles
3. Check browser console for IndexedDB errors
4. Clear IndexedDB and re-import: `localStorage.clear()` in console, then refresh

### Timer Drift

**Symptoms**: Timer counts down faster/slower than expected

**Solutions**:
- The app uses `performance.now()` for high precision
- Timer should be accurate to within milliseconds
- If drift occurs, check browser performance (too many tabs, low memory)
- Refresh the page to reset timer state

### Build Failures

**Symptoms**: `npm run build` fails

**Solutions**:
1. Ensure all dependencies are installed: `npm ci`
2. Check TypeScript errors: `npx tsc --noEmit`
3. Clear build cache: `rm -rf dist node_modules/.vite`
4. Update dependencies: `npm update`

## Privacy & Security

### Data Storage

- **All data is stored locally** on your device using IndexedDB
- No data is sent to external servers
- No tracking, analytics, or telemetry
- Progress is completely private

### Deleting Data

To delete all local data:

1. Use the "Clear All Data" button in Export/Import menu
2. Or manually clear in browser:
   - Chrome: DevTools → Application → Storage → Clear site data
   - Firefox: DevTools → Storage → Clear All
   - Safari: Develop → Empty Caches

### Network Requests

- Puzzle datasets are fetched at build time (not runtime)
- Optional online puzzle fetching is **disabled by default**
- If enabled, clearly asks for user permission
- All external requests documented in code with `TODO: SERVER_SWITCH` markers

## Performance

### Lighthouse Goals

Target scores:
- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: >90

### Optimizations

- Code splitting for puzzle data (lazy-loaded chunks)
- SVG assets (vector, no raster images)
- Tree-shaking for minimal bundle size
- Service worker for offline caching
- IndexedDB for efficient local storage

## Testing

### Unit Tests

Tests cover:
- Puzzle validation and move checking
- Timer precision using `performance.now()`
- Local storage operations
- Move generation and validation

Run tests:
```bash
npm test
```

### Integration Tests

Integration tests verify:
- Complete puzzle solve flow
- Timer timeout behavior
- Progress saving
- Export/import functionality

### CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on:
- Push to `main` or `develop`
- Pull requests

Checks:
- Linting
- Unit tests
- Build verification

## License & Attribution

### Project License

MIT License - see LICENSE file for details

### Resource Attribution

This project uses the following resources:

1. **chess.js** - [MIT License](https://github.com/jhlywa/chess.js)
   - Chess move generation and validation
   - URL: https://github.com/jhlywa/chess.js

2. **Stockfish WebAssembly** - [GPL-3.0 License](https://github.com/lichess-org/stockfish.wasm)
   - Chess engine for analysis and hints
   - URL: https://github.com/lichess-org/stockfish.wasm
   - Alternative: https://github.com/nmrugg/stockfish.js

3. **432k Chess Puzzles Dataset** - [License TBD - check repository](https://github.com/rebeccaloran/432k-chess-puzzles)
   - Primary puzzle dataset
   - URL: https://github.com/rebeccaloran/432k-chess-puzzles
   - **Note**: Check dataset license and include attribution if required

4. **Lichess Database** - [CC0 / Public Domain](https://database.lichess.org/)
   - Supplemental puzzle and game data
   - URL: https://database.lichess.org/
   - **Note**: Lichess data is typically CC0/public domain

5. **SVG Chess Pieces** - [Various licenses - check Wikimedia](https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces)
   - Chess piece SVG assets
   - URL: https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces
   - **Note**: Check individual asset licenses on Wikimedia

6. **idb** - [ISC License](https://github.com/jakearchibald/idb)
   - IndexedDB wrapper library
   - URL: https://github.com/jakearchibald/idb

7. **cm-chessboard** - [MIT License](https://www.npmjs.com/package/cm-chessboard)
   - Chess board library (referenced, custom implementation used)
   - URL: https://www.npmjs.com/package/cm-chessboard

**Important**: Please verify and respect all dataset licenses. Some datasets may require specific attribution or have usage restrictions.

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and test thoroughly
4. Run tests: `npm test`
5. Build to verify: `npm run build`
6. Submit a pull request

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prefer functional components with hooks
- Concise, lowercase comments (human-oriented, no "AI" language)
- TODOs marked clearly for future work

## Roadmap

### Planned Features

- [ ] Additional game modes (Puzzle Rush, Puzzle Builder)
- [ ] Chess variants (King of the Hill, etc.)
- [ ] Enhanced analytics and insights
- [ ] Custom puzzle creation and sharing
- [ ] Multi-language support
- [ ] Advanced difficulty algorithms

### Known Limitations

- Stockfish engine requires WebAssembly support
- Large puzzle datasets may impact initial load time
- Some older browsers may not support IndexedDB
- Engine analysis limited by device performance

## Support

### Reporting Issues

1. Check the Troubleshooting section above
2. Search existing issues on GitHub
3. Create a new issue with:
   - Browser and version
   - Steps to reproduce
   - Console errors (if any)
   - Expected vs actual behavior

### Feature Requests

Feature requests are welcome! Please create an issue with:
- Clear description of the feature
- Use case and motivation
- Proposed implementation (if applicable)

## Credits

Built with:
- React + Vite for fast development
- TypeScript for type safety
- Tailwind CSS for styling
- chess.js for chess logic
- Stockfish for engine analysis
- IndexedDB for local storage

Inspired by premium puzzle sites like Matiks.com, adapted for blitz and time-limit chess puzzles.

---

**Enjoy solving puzzles!** 🎯♟️

