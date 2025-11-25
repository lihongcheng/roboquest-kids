import React, { useEffect, useRef } from 'react';
import { Direction } from '../types';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface CommandBarProps {
  commands: Direction[];
  activeCommandIndex: number | null;
}

export const CommandBar: React.FC<CommandBarProps> = ({ commands, activeCommandIndex }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the newest command
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [commands.length]);

  // Auto-scroll to active command during execution
  useEffect(() => {
     if (activeCommandIndex !== null && scrollRef.current) {
         // Simple logic: try to center the active item or just ensure visibility
         const itemWidth = 56; // approximate width of item + margin
         scrollRef.current.scrollLeft = (activeCommandIndex * itemWidth) - (scrollRef.current.clientWidth / 2) + (itemWidth / 2);
     }
  }, [activeCommandIndex]);

  const getIcon = (cmd: Direction) => {
    switch (cmd) {
      case Direction.UP: return <ArrowUp size={24} />;
      case Direction.DOWN: return <ArrowDown size={24} />;
      case Direction.LEFT: return <ArrowLeft size={24} />;
      case Direction.RIGHT: return <ArrowRight size={24} />;
    }
  };

  return (
    <div className="w-full max-w-[500px] mx-auto mb-4">
      <div className="flex items-center gap-2 mb-2 px-2">
         <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">My Code</span>
         <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{commands.length} steps</span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto p-2 bg-slate-100 rounded-2xl border-inner min-h-[70px] items-center scrollbar-hide snap-x"
        style={{ scrollBehavior: 'smooth' }}
      >
        {commands.length === 0 && (
          <div className="w-full text-center text-slate-400 text-sm italic py-2">
            Tap arrows to add steps!
          </div>
        )}

        {commands.map((cmd, index) => {
            const isActive = index === activeCommandIndex;
            return (
                <div
                    key={index}
                    className={`
                        flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all duration-300
                        ${isActive 
                            ? 'bg-yellow-400 border-yellow-500 text-white scale-110 shadow-lg z-10' 
                            : 'bg-white border-slate-200 text-blue-500'
                        }
                    `}
                >
                    {getIcon(cmd)}
                </div>
            );
        })}
      </div>
    </div>
  );
};