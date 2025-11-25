import React from 'react';
import { Position } from '../types';
import { Star, Zap, Skull, TreePine, Fish, Cookie, Rocket } from 'lucide-react';

interface GridProps {
  size: number;
  playerPos: Position;
  goalPos: Position;
  obstacles: Position[];
  theme: string;
}

export const Grid: React.FC<GridProps> = ({ size, playerPos, goalPos, obstacles, theme }) => {
  // Create grid array
  const gridCells = Array.from({ length: size * size }, (_, i) => {
    const x = i % size;
    const y = Math.floor(i / size);
    return { x, y };
  });

  const getObstacleIcon = (themeName: string) => {
      const t = themeName.toLowerCase();
      if (t.includes('space')) return <div className="text-slate-600"><span className="text-3xl">🪨</span></div>; // Asteroid
      if (t.includes('ocean')) return <div className="text-green-800"><span className="text-3xl">🌿</span></div>; // Seaweed
      if (t.includes('candy')) return <div className="text-pink-500"><span className="text-3xl">🥦</span></div>; // Broccoli (yuck!)
      return <TreePine size={32} className="text-green-700" fill="currentColor" />;
  };

  const getGoalIcon = (themeName: string) => {
    const t = themeName.toLowerCase();
    if (t.includes('space')) return <Rocket size={32} className="text-purple-500 animate-pulse" fill="currentColor" />;
    if (t.includes('ocean')) return <Fish size={32} className="text-orange-500 animate-bounce" fill="currentColor" />;
    if (t.includes('candy')) return <Cookie size={32} className="text-yellow-600 animate-spin-slow" fill="currentColor" />;
    return <Star size={40} className="text-yellow-400 animate-spin-slow" fill="currentColor" />;
  };

  const getPlayerIcon = () => {
      return <div className="text-4xl drop-shadow-lg">🤖</div>;
  };

  return (
    <div 
      className="grid gap-2 p-4 bg-white rounded-3xl shadow-lg border-4 border-slate-200"
      style={{ 
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        maxWidth: '500px',
        margin: '0 auto',
        aspectRatio: '1/1'
      }}
    >
      {gridCells.map((cell) => {
        const isPlayer = cell.x === playerPos.x && cell.y === playerPos.y;
        const isGoal = cell.x === goalPos.x && cell.y === goalPos.y;
        const isObstacle = obstacles.some(o => o.x === cell.x && o.y === cell.y);

        let content = null;
        let cellClass = "bg-slate-100 rounded-xl transition-all duration-300 border-b-4 border-slate-200 relative";

        if (isObstacle) {
          content = getObstacleIcon(theme);
          cellClass += " bg-red-50 border-red-200";
        } else if (isGoal) {
          content = getGoalIcon(theme);
          cellClass += " bg-yellow-50 border-yellow-200";
        } else {
            // Empty path cell
            cellClass += " ";
        }

        return (
          <div 
            key={`${cell.x}-${cell.y}`} 
            className={`flex items-center justify-center ${cellClass}`}
          >
            {content}
            
            {/* Player is absolutely positioned to allow smooth transitions if we added Framer Motion later, 
                but for now we just render it conditionally on top */}
            {isPlayer && (
                <div className="absolute inset-0 flex items-center justify-center z-10 animate-pop">
                    {getPlayerIcon()}
                </div>
            )}
            
            {/* Coordinates for debugging, hidden in production for kids */}
            {/* <span className="absolute bottom-1 right-1 text-[8px] text-gray-300">{cell.x},{cell.y}</span> */}
          </div>
        );
      })}
    </div>
  );
};