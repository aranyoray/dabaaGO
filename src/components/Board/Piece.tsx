// svg chess piece component with 2.5d styling

interface PieceProps {
  type: 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
  color: 'w' | 'b';
  x: number;
  y: number;
  opacity?: number;
}

const PIECE_SYMBOLS: Record<string, string> = {
  'wK': '♔', 'wQ': '♕', 'wR': '♖', 'wB': '♗', 'wN': '♘', 'wP': '♙',
  'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♟',
};

export function Piece({ type, color, x, y, opacity = 1 }: PieceProps) {
  const key = `${color}${type.toUpperCase()}`;
  const symbol = PIECE_SYMBOLS[key] || '';

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ opacity }}
      className="piece-3d"
    >
      <text
        x="0"
        y="0"
        fontSize="45"
        fill={color === 'w' ? '#ffffff' : '#000000'}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {symbol}
      </text>
    </g>
  );
}

