import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, RotateCcw, Trash2 } from 'lucide-react';
import { Direction, GameStatus } from '../types';

interface ControlsProps {
  onAddCommand: (cmd: Direction) => void;
  onRun: () => void;
  onReset: () => void;
  onClear: () => void;
  gameStatus: GameStatus;
  commandsCount: number;
}

export const Controls: React.FC<ControlsProps> = ({
  onAddCommand,
  onRun,
  onReset,
  onClear,
  gameStatus,
  commandsCount,
}) => {
  const isRunning = gameStatus === 'RUNNING';
  const isWon = gameStatus === 'WON';

  // Helper to style directional buttons
  const btnClass = "bg-blue-400 hover:bg-blue-500 active:bg-blue-600 text-white rounded-2xl shadow-[0_4px_0_rgb(29,78,216)] active:shadow-none active:translate-y-1 transition-all p-4 flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24";
  
  return (
    <div className="flex flex-col items-center gap-6 p-4 bg-white/50 rounded-3xl shadow-xl backdrop-blur-sm border-4 border-white">
      {/* Directional Pad */}
      <div className="grid grid-cols-3 gap-3">
        <div />
        <button
          onClick={() => onAddCommand(Direction.UP)}
          disabled={isRunning || isWon}
          className={`${btnClass} ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Up"
        >
          <ArrowUp size={48} strokeWidth={3} />
        </button>
        <div />

        <button
          onClick={() => onAddCommand(Direction.LEFT)}
          disabled={isRunning || isWon}
          className={`${btnClass} ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Left"
        >
          <ArrowLeft size={48} strokeWidth={3} />
        </button>
        <div className="flex items-center justify-center bg-blue-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 opacity-50">
           <span className="text-4xl">🤖</span>
        </div>
        <button
          onClick={() => onAddCommand(Direction.RIGHT)}
          disabled={isRunning || isWon}
          className={`${btnClass} ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Right"
        >
          <ArrowRight size={48} strokeWidth={3} />
        </button>

        <div />
        <button
          onClick={() => onAddCommand(Direction.DOWN)}
          disabled={isRunning || isWon}
          className={`${btnClass} ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Down"
        >
          <ArrowDown size={48} strokeWidth={3} />
        </button>
        <div />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 w-full justify-center border-t-2 border-slate-100 pt-4">
        <button
          onClick={onClear}
          disabled={isRunning}
          className="bg-red-400 hover:bg-red-500 text-white rounded-xl shadow-[0_4px_0_rgb(185,28,28)] active:shadow-none active:translate-y-1 p-3 flex-1 flex flex-col items-center justify-center disabled:opacity-50"
        >
           <Trash2 size={24} />
           <span className="text-xs font-bold mt-1 uppercase">Clear</span>
        </button>

        {gameStatus === 'LOST' || gameStatus === 'WON' ? (
           <button
           onClick={onReset}
           className="bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl shadow-[0_4px_0_rgb(202,138,4)] active:shadow-none active:translate-y-1 p-3 flex-[2] flex flex-col items-center justify-center"
         >
            <RotateCcw size={32} strokeWidth={3} />
            <span className="text-xs font-bold mt-1 uppercase">Try Again</span>
         </button>
        ) : (
          <button
          onClick={onRun}
          disabled={isRunning || commandsCount === 0}
          className="bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-[0_4px_0_rgb(21,128,61)] active:shadow-none active:translate-y-1 p-3 flex-[2] flex flex-col items-center justify-center disabled:opacity-50 disabled:shadow-none disabled:translate-y-0"
        >
           <Play size={32} fill="white" strokeWidth={3} />
           <span className="text-xs font-bold mt-1 uppercase">GO!</span>
        </button>
        )}
      </div>
    </div>
  );
};