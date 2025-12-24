// puzzle validation and tactical hint generation

import { Chess } from 'chess.js';
import type { Puzzle, TacticType, LearningTheme } from '../types';

/**
 * Validate that a puzzle is solvable
 */
export function validatePuzzle(puzzle: Puzzle): {
  valid: boolean;
  errors: string[];
  moveCount: number;
} {
  const errors: string[] = [];

  try {
    const chess = new Chess(puzzle.fen);
    let moveCount = 0;

    // validate each move in solution
    for (const move of puzzle.solution) {
      try {
        const result = chess.move(move);
        if (!result) {
          errors.push(`Invalid move: ${move} at position ${moveCount + 1}`);
          return { valid: false, errors, moveCount };
        }
        moveCount++;
      } catch (error) {
        errors.push(`Move ${move} throws error: ${error}`);
        return { valid: false, errors, moveCount };
      }
    }

    // check move count is 2-7
    if (moveCount < 2) {
      errors.push(`Too few moves: ${moveCount} (minimum 2)`);
    }
    if (moveCount > 7) {
      errors.push(`Too many moves: ${moveCount} (maximum 7)`);
    }

    return {
      valid: errors.length === 0,
      errors,
      moveCount,
    };
  } catch (error) {
    errors.push(`Invalid FEN: ${puzzle.fen}`);
    return { valid: false, errors, moveCount: 0 };
  }
}

/**
 * Generate tactical hint based on puzzle's main tactic
 */
export function generateTacticalHint(puzzle: Puzzle): string {
  const tacticalHints: Record<TacticType, string[]> = {
    'pin': [
      'Look for a piece that cannot move without exposing a more valuable piece',
      'Can you attack a piece that\'s protecting something important?',
      'Find the pinned piece - it can\'t move!',
    ],
    'skewer': [
      'Attack a valuable piece with a less valuable one behind it',
      'Force the important piece to move and capture what\'s behind',
      'Look for pieces lined up on a file, rank, or diagonal',
    ],
    'fork': [
      'Can one piece attack two or more pieces at once?',
      'Knights are great at forking - look for a knight move!',
      'Attack two pieces simultaneously',
    ],
    'royal-fork': [
      'Can you attack the king and another piece at the same time?',
      'A royal fork attacks the king and a valuable piece!',
      'Look for a knight fork on the king',
    ],
    'discovered-attack': [
      'Move one piece to reveal an attack from another',
      'What happens when this piece moves out of the way?',
      'Look for a piece blocking a powerful attacker',
    ],
    'discovered-check': [
      'Move a piece and give check with the piece behind it',
      'Can you reveal a check by moving another piece?',
      'Look for a discovered check opportunity',
    ],
    'double-attack': [
      'Attack two different pieces or squares at once',
      'Can you threaten multiple things in one move?',
      'Look for a move that creates two threats',
    ],
  };

  const learningHints: Partial<Record<LearningTheme, string>> = {
    'backrank-mate': 'The king is trapped on the back rank!',
    'smothered-mate': 'The king is surrounded by its own pieces',
    'forced-mate': 'Look for a forcing sequence that leads to checkmate',
    'sacrifice': 'Sometimes you need to give up material for a win!',
    'king-safety': 'The king is vulnerable - exploit it!',
    'development': 'Get your pieces into the game quickly',
  };

  // try main tactic first
  if (puzzle.mainTactic) {
    const hints = tacticalHints[puzzle.mainTactic];
    return hints[Math.floor(Math.random() * hints.length)];
  }

  // try learning theme
  if (puzzle.learningThemes && puzzle.learningThemes.length > 0) {
    const theme = puzzle.learningThemes[0];
    if (learningHints[theme]) {
      return learningHints[theme]!;
    }
  }

  // fallback generic hints
  return 'Look for the best move that improves your position';
}

/**
 * Get tactic name in readable format
 */
export function getTacticName(tactic: TacticType): string {
  const names: Record<TacticType, string> = {
    'pin': 'Pin',
    'skewer': 'Skewer',
    'fork': 'Fork',
    'royal-fork': 'Royal Fork',
    'discovered-attack': 'Discovered Attack',
    'discovered-check': 'Discovered Check',
    'double-attack': 'Double Attack',
  };
  return names[tactic];
}

/**
 * Get learning theme name in readable format
 */
export function getLearningThemeName(theme: LearningTheme): string {
  const names: Record<LearningTheme, string> = {
    'backrank-mate': 'Back Rank Checkmate',
    'ladder-mate': 'Ladder Checkmate',
    'forced-mate': 'Forced Checkmate',
    'anastasias-mate': "Anastasia's Mate",
    'arabian-mate': 'Arabian Mate',
    'smothered-mate': 'Smothered Mate',
    'bodens-mate': "Boden's Mate",
    'opera-mate': 'Opera Mate',
    'damianos-mate': "Damiano's Mate",
    'drawing': 'Drawing Techniques',
    'sacrifice': 'Sacrifices',
    'opening': 'Opening Principles',
    'king-rook-endgame': 'King and Rook Endgame',
    'king-pawn-endgame': 'King and Pawn Endgame',
    'king-queen-endgame': 'King and Queen Endgame',
    'forced-stalemate': 'Forced Stalemate',
    'gambit': 'Gambits',
    'counter-gambit': 'Counter-Gambits',
    'material-exchange': 'Material Exchange',
    'open-files': 'Open Files',
    'outpost': 'Outposts',
    'development': 'Development',
    'king-safety': 'King Safety',
  };
  return names[theme];
}

/**
 * Get tactic description
 */
export function getTacticDescription(tactic: TacticType): string {
  const descriptions: Record<TacticType, string> = {
    'pin': 'A pin restricts a piece from moving because it would expose a more valuable piece behind it to capture.',
    'skewer': 'A skewer forces a valuable piece to move, exposing a less valuable piece behind it to capture.',
    'fork': 'A fork is when one piece attacks two or more opponent pieces simultaneously.',
    'royal-fork': 'A royal fork attacks the opponent\'s king and another valuable piece at the same time.',
    'discovered-attack': 'Moving one piece reveals an attack from another piece that was blocked.',
    'discovered-check': 'Moving one piece reveals a check from another piece, forcing the opponent to respond.',
    'double-attack': 'Attacking two different pieces or squares at once, creating multiple threats.',
  };
  return descriptions[tactic];
}

/**
 * Detect likely tactic in a puzzle based on position and solution
 */
export function detectTactic(puzzle: Puzzle): TacticType | null {
  // simple heuristic detection based on solution patterns
  // in a real app, you'd use chess engine analysis

  const solution = puzzle.solution;
  if (solution.length === 0) return null;

  // check for knight moves (often forks)
  if (solution[0].startsWith('N')) {
    return 'fork';
  }

  // check for checks (might be discovered check or royal fork)
  if (solution[0].includes('+')) {
    return 'discovered-check';
  }

  // default
  return null;
}

/**
 * Enhance puzzle with tactical information
 */
export function enhancePuzzle(puzzle: Puzzle): Puzzle {
  const validation = validatePuzzle(puzzle);
  const detectedTactic = puzzle.mainTactic || detectTactic(puzzle);

  return {
    ...puzzle,
    validated: validation.valid,
    moveCount: validation.moveCount,
    mainTactic: detectedTactic || undefined,
    hint: puzzle.hint || (detectedTactic ? generateTacticalHint({ ...puzzle, mainTactic: detectedTactic }) : undefined),
  };
}
