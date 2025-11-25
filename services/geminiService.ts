import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LevelData, Position } from "../types";
import { GRID_SIZE, FALLBACK_LEVEL } from "../constants";

// Define the response schema for strict JSON output
const levelSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    start: {
      type: Type.OBJECT,
      properties: {
        x: { type: Type.INTEGER },
        y: { type: Type.INTEGER },
      },
      required: ["x", "y"],
    },
    goal: {
      type: Type.OBJECT,
      properties: {
        x: { type: Type.INTEGER },
        y: { type: Type.INTEGER },
      },
      required: ["x", "y"],
    },
    obstacles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          x: { type: Type.INTEGER },
          y: { type: Type.INTEGER },
        },
        required: ["x", "y"],
      },
    },
    theme: {
      type: Type.STRING,
      description: "A simple visual theme name like 'candy', 'space', 'forest', 'ocean'.",
    },
    story: {
      type: Type.STRING,
      description: "A very short, encouraging sentence for a 4-year-old describing the mission.",
    },
  },
  required: ["start", "goal", "obstacles", "theme", "story"],
};

const THEMES = [
  { name: 'park', story: 'Help Robo find the magical star in the park!' },
  { name: 'space', story: 'Robo is in space! Reach the energy core.' },
  { name: 'ocean', story: 'Swim through the seaweed to find the treasure!' },
  { name: 'candy', story: 'Yum! Navigate past the broccoli to get the cookie.' },
  { name: 'forest', story: 'Hike through the trees to find the campsite.' },
  { name: 'snow', story: 'Brrr! Slide on the ice to find the warm cocoa.' }
];

// Helper: Check if a path exists from start to goal using BFS
const hasValidPath = (start: Position, goal: Position, obstacles: Position[], size: number): boolean => {
  const queue: Position[] = [start];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  const dirs = [{x:0, y:1}, {x:0, y:-1}, {x:1, y:0}, {x:-1, y:0}];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr.x === goal.x && curr.y === goal.y) return true;

    for (const d of dirs) {
      const next = { x: curr.x + d.x, y: curr.y + d.y };
      const key = `${next.x},${next.y}`;

      // Check bounds
      if (next.x >= 0 && next.x < size && next.y >= 0 && next.y < size) {
        // Check obstacles
        if (!obstacles.some(o => o.x === next.x && o.y === next.y)) {
          if (!visited.has(key)) {
            visited.add(key);
            queue.push(next);
          }
        }
      }
    }
  }
  return false;
};

// Procedural Generator for offline/fallback mode
const generateProceduralLevel = (levelId: number): LevelData => {
  const size = GRID_SIZE;
  let attempts = 0;

  while (attempts < 100) {
    attempts++;
    
    // 1. Random Start & Goal (ensure they aren't the same)
    const start = { 
      x: Math.floor(Math.random() * size), 
      y: Math.floor(Math.random() * size) 
    };
    
    let goal = { 
      x: Math.floor(Math.random() * size), 
      y: Math.floor(Math.random() * size) 
    };

    // Make sure goal is not on start and strictly far enough to be fun (Manhattan distance > 2)
    while ((goal.x === start.x && goal.y === start.y) || (Math.abs(goal.x - start.x) + Math.abs(goal.y - start.y) < 2)) {
      goal = { 
        x: Math.floor(Math.random() * size), 
        y: Math.floor(Math.random() * size) 
      };
    }

    // 2. Random Obstacles
    const numObstacles = Math.floor(Math.random() * 3) + 3; // 3 to 5 obstacles
    const obstacles: Position[] = [];
    
    for (let i = 0; i < numObstacles; i++) {
      const obs = { 
        x: Math.floor(Math.random() * size), 
        y: Math.floor(Math.random() * size) 
      };
      
      // Don't place on start, goal, or existing obstacles
      const clash = (obs.x === start.x && obs.y === start.y) || 
                    (obs.x === goal.x && obs.y === goal.y) ||
                    obstacles.some(o => o.x === obs.x && o.y === obs.y);
      
      if (!clash) {
        obstacles.push(obs);
      }
    }

    // 3. Verify Path
    if (hasValidPath(start, goal, obstacles, size)) {
      const themeObj = THEMES[(levelId - 1) % THEMES.length];
      return {
        id: levelId,
        gridSize: size,
        start,
        goal,
        obstacles,
        theme: themeObj.name,
        story: themeObj.story
      };
    }
  }

  // Fallback to static if generation fails incredibly (unlikely)
  return { ...FALLBACK_LEVEL, id: levelId };
};

export const generateLevel = async (currentLevelId: number): Promise<LevelData> => {
  const nextId = currentLevelId + 1;

  if (!process.env.API_KEY) {
    console.log("Running in offline mode (Procedural Generation)");
    // Introduce a tiny artificial delay so the UI loading state feels natural
    await new Promise(resolve => setTimeout(resolve, 800));
    return generateProceduralLevel(nextId);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const difficulty = nextId > 3 ? "medium" : "easy";
    const numObstacles = nextId > 3 ? 6 : 3;

    const prompt = `
      Create a grid puzzle level for a 4-year-old child's coding game.
      The grid is ${GRID_SIZE}x${GRID_SIZE}.
      Level ID: ${nextId}.
      Difficulty: ${difficulty}.
      Approximate number of obstacles: ${numObstacles}.
      Ensure there is a valid path from start to goal.
      The story should be cute and simple.
      The theme should be fun (e.g., animals, space, treats).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: levelSchema,
        temperature: 0.8,
      },
    });

    const rawData = response.text;
    if (!rawData) {
        throw new Error("Empty response from AI");
    }
    
    const parsedData = JSON.parse(rawData);

    return {
      id: nextId,
      gridSize: GRID_SIZE,
      start: parsedData.start,
      goal: parsedData.goal,
      obstacles: parsedData.obstacles,
      theme: parsedData.theme,
      story: parsedData.story,
    };

  } catch (error) {
    console.warn("Failed to generate level with Gemini, switching to procedural:", error);
    return generateProceduralLevel(nextId);
  }
};