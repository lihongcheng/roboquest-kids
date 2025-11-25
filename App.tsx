import React, { useState, useEffect, useCallback } from 'react';
import { Grid } from './components/Grid';
import { Controls } from './components/Controls';
import { CommandBar } from './components/CommandBar';
import { generateLevel } from './services/geminiService';
import { INITIAL_LEVEL, GRID_SIZE } from './constants';
import { Direction, Position, LevelData, GameStatus } from './types';
import { PartyPopper, RefreshCw, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [level, setLevel] = useState<LevelData>(INITIAL_LEVEL);
  const [playerPos, setPlayerPos] = useState<Position>(INITIAL_LEVEL.start);
  const [commands, setCommands] = useState<Direction[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('IDLE');
  const [activeCommandIndex, setActiveCommandIndex] = useState<number | null>(null);
  const [isLoadingLevel, setIsLoadingLevel] = useState(false);

  // Initialize player position when level changes
  useEffect(() => {
    setPlayerPos(level.start);
    setCommands([]);
    setGameStatus('IDLE');
    setActiveCommandIndex(null);
  }, [level]);

  const handleAddCommand = (cmd: Direction) => {
    if (gameStatus === 'RUNNING') return;
    // Limit commands to prevent memory issues or overly complex sequences for kids (max 20)
    if (commands.length < 20) {
      setCommands((prev) => [...prev, cmd]);
    }
  };

  const handleClear = () => {
     if (gameStatus === 'RUNNING') return;
     setCommands([]);
     setPlayerPos(level.start);
     setGameStatus('IDLE');
  };

  const handleReset = () => {
    setPlayerPos(level.start);
    setGameStatus('IDLE');
    setActiveCommandIndex(null);
    // Keep commands so they can try to fix them
  };

  const checkCollision = (pos: Position, currentLevel: LevelData): 'GOAL' | 'OBSTACLE' | 'WALL' | null => {
    // Check Goal
    if (pos.x === currentLevel.goal.x && pos.y === currentLevel.goal.y) return 'GOAL';
    
    // Check Walls
    if (pos.x < 0 || pos.x >= currentLevel.gridSize || pos.y < 0 || pos.y >= currentLevel.gridSize) return 'WALL';

    // Check Obstacles
    const hitObstacle = currentLevel.obstacles.some(o => o.x === pos.x && o.y === pos.y);
    if (hitObstacle) return 'OBSTACLE';

    return null;
  };

  const handleRun = useCallback(async () => {
    if (gameStatus !== 'IDLE' && gameStatus !== 'LOST') return;
    setGameStatus('RUNNING');
    setPlayerPos(level.start); // Reset to start before running
    
    let currentPos = { ...level.start };

    for (let i = 0; i < commands.length; i++) {
      setActiveCommandIndex(i);
      
      // Calculate next position
      const cmd = commands[i];
      const nextPos = { ...currentPos };
      
      if (cmd === Direction.UP) nextPos.y -= 1;
      if (cmd === Direction.DOWN) nextPos.y += 1;
      if (cmd === Direction.LEFT) nextPos.x -= 1;
      if (cmd === Direction.RIGHT) nextPos.x += 1;

      // Update UI state for position
      setPlayerPos(nextPos);
      
      // Wait for animation (kids need slow visual feedback)
      await new Promise(r => setTimeout(r, 600));

      const collision = checkCollision(nextPos, level);

      if (collision === 'GOAL') {
        setGameStatus('WON');
        setActiveCommandIndex(null);
        return; // Stop execution
      } 
      
      if (collision === 'OBSTACLE' || collision === 'WALL') {
        setGameStatus('LOST');
        setActiveCommandIndex(null);
        return; // Stop execution
      }

      currentPos = nextPos;
    }

    // If we run out of commands and haven't won
    if (checkCollision(currentPos, level) !== 'GOAL') {
      setGameStatus('LOST');
      setActiveCommandIndex(null);
    }
  }, [commands, level, gameStatus]);

  const loadNextLevel = async () => {
    setIsLoadingLevel(true);
    try {
      const nextLevel = await generateLevel(level.id);
      setLevel(nextLevel);
    } catch (e) {
      console.error("Error loading level", e);
    } finally {
      setIsLoadingLevel(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-50 via-blue-50 to-slate-100">
      
      {/* Header / HUD */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4">
         <div className="flex items-center gap-2">
            <div className="bg-yellow-400 text-yellow-900 font-bold px-4 py-2 rounded-2xl shadow-sm">
              Level {level.id}
            </div>
         </div>
         <h1 className="text-2xl font-bold text-slate-700 hidden sm:block tracking-tight text-center">
            RoboQuest Kids
         </h1>
         <div className="w-[80px]"></div> {/* Spacer for balance */}
      </div>

      {/* Story Bubble */}
      <div className="bg-white px-6 py-4 rounded-3xl shadow-sm mb-6 max-w-lg w-full text-center border-2 border-slate-100 relative">
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-slate-100 rotate-45"></div>
        <p className="text-slate-600 font-medium text-lg leading-snug">
            {level.story}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full max-w-5xl justify-center">
        
        {/* Left Col: Game Board & Commands */}
        <div className="flex-1 w-full max-w-[500px] flex flex-col items-center">
          <Grid 
            size={GRID_SIZE} 
            playerPos={playerPos} 
            goalPos={level.goal} 
            obstacles={level.obstacles} 
            theme={level.theme}
          />
          <div className="h-4"></div>
          <CommandBar commands={commands} activeCommandIndex={activeCommandIndex} />
        </div>

        {/* Right Col: Controls */}
        <div className="flex-1 w-full max-w-[400px]">
          <Controls 
            onAddCommand={handleAddCommand} 
            onRun={handleRun} 
            onReset={handleReset} 
            onClear={handleClear}
            gameStatus={gameStatus}
            commandsCount={commands.length}
          />

          {/* Messages */}
          <div className="mt-6 text-center h-20">
            {gameStatus === 'RUNNING' && (
              <p className="text-blue-500 font-bold animate-pulse text-xl">Robo is moving...</p>
            )}
            
            {gameStatus === 'WON' && (
              <div className="animate-bounce-in">
                <p className="text-green-500 font-bold text-2xl flex items-center justify-center gap-2 mb-3">
                  <PartyPopper /> Great Job! <PartyPopper />
                </p>
                <button 
                  onClick={loadNextLevel}
                  disabled={isLoadingLevel}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-2xl shadow-lg transform transition active:scale-95 text-lg flex items-center gap-2 mx-auto"
                >
                  {isLoadingLevel ? (
                      <>
                        <RefreshCw className="animate-spin" /> Making Level...
                      </>
                  ) : (
                      "Next Level ->"
                  )}
                </button>
              </div>
            )}

            {gameStatus === 'LOST' && (
              <div className="animate-shake">
                <p className="text-red-400 font-bold text-xl flex items-center justify-center gap-2">
                  <AlertCircle /> Oops! Try again.
                </p>
                <p className="text-slate-400 text-sm mt-1">Check your steps and press Try Again.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-slate-400 text-xs font-medium">
         Powered by Gemini AI • Made for curious minds
      </footer>
    </div>
  );
};

export default App;