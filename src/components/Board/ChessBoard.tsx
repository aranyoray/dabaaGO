// svg chess board component with 2.5d styling

import { useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import { Piece } from './Piece';

interface ChessBoardProps {
  fen: string;
  orientation?: 'white' | 'black';
  onMove?: (from: Square, to: Square, promotion?: string) => void;
  legalMoves?: string[];
  selectedSquare?: Square | null;
  lastMove?: { from: Square; to: Square } | null;
  disabled?: boolean;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export function ChessBoard({
  fen,
  orientation = 'white',
  onMove,
  legalMoves = [],
  selectedSquare,
  lastMove,
  disabled = false,
}: ChessBoardProps) {
  const [selected, setSelected] = useState<Square | null>(null);
  const boardRef = useRef<SVGSVGElement>(null);
  const chess = new Chess(fen);

  const isLight = (file: number, rank: number) => {
    return (file + rank) % 2 === 0;
  };

  const getSquare = (file: number, rank: number): Square => {
    const fileChar = FILES[file];
    const rankChar = RANKS[rank];
    return `${fileChar}${rankChar}` as Square;
  };

  const isLegalMove = (from: Square, to: Square): boolean => {
    if (legalMoves.length === 0) {
      // if no legal moves provided, check with chess.js
      const moves = chess.moves({ square: from, verbose: true });
      return moves.some(m => m.to === to);
    }
    return legalMoves.includes(`${from}${to}`) || legalMoves.includes(`${from}-${to}`);
  };

  const handleSquareClick = (square: Square) => {
    if (disabled || !onMove) return;
    
    if (selected) {
      if (selected === square) {
        setSelected(null);
        return;
      }
      if (isLegalMove(selected, square)) {
        onMove(selected, square);
        setSelected(null);
      }
    } else {
      const piece = chess.get(square);
      if (piece && piece.color === chess.turn()) {
        setSelected(square);
      }
    }
  };

  const squares = [];
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const displayRank = orientation === 'white' ? 7 - rank : rank;
      const displayFile = orientation === 'white' ? file : 7 - file;
      const square = getSquare(displayFile, displayRank);
      const isLightSquare = isLight(displayFile, displayRank);
      const piece = chess.get(square);
      const isSelected = (selectedSquare || selected) === square;
      const isLastMoveFrom = lastMove?.from === square;
      const isLastMoveTo = lastMove?.to === square;

      squares.push(
        <g key={square}>
          <rect
            x={file * 62.5}
            y={rank * 62.5}
            width={62.5}
            height={62.5}
            fill={isLightSquare ? '#f0d9b5' : '#b58863'}
            className="board-tile"
            style={{
              transition: 'filter 0.1s',
              cursor: disabled ? 'default' : 'pointer',
            }}
            onClick={() => handleSquareClick(square)}
          />
          {(isLastMoveFrom || isLastMoveTo) && (
            <rect
              x={file * 62.5}
              y={rank * 62.5}
              width={62.5}
              height={62.5}
              fill="rgba(255, 255, 0, 0.3)"
            />
          )}
          {isSelected && (
            <rect
              x={file * 62.5}
              y={rank * 62.5}
              width={62.5}
              height={62.5}
              fill="rgba(20, 85, 30, 0.5)"
            />
          )}
          {legalMoves.length > 0 && (selectedSquare || selected) && isLegalMove((selectedSquare || selected)!, square) && (
            <circle
              cx={file * 62.5 + 31.25}
              cy={rank * 62.5 + 31.25}
              r={piece ? 20 : 8}
              fill={piece ? 'rgba(20, 85, 30, 0.3)' : 'rgba(20, 85, 30, 0.5)'}
            />
          )}
          {piece && (
            <Piece
              type={piece.type}
              color={piece.color}
              x={file * 62.5 + 31.25}
              y={rank * 62.5 + 31.25}
            />
          )}
        </g>
      );
    }
  }

  return (
    <div className="flex justify-center items-center">
      <svg
        ref={boardRef}
        width={500}
        height={500}
        viewBox="0 0 500 500"
        className="shadow-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {squares}
      </svg>
    </div>
  );
}

