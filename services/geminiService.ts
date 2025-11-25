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

export const generateLevel = async (currentLevelId: number): Promise<LevelData> => {
  if (!process.env.API_KEY) {
    console.warn("No API_KEY found. Using fallback level.");
    return { ...FALLBACK_LEVEL, id: currentLevelId + 1 };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // We increase difficulty slightly by asking for more obstacles based on level ID
    const difficulty = currentLevelId > 3 ? "medium" : "easy";
    const numObstacles = currentLevelId > 3 ? 6 : 3;

    const prompt = `
      Create a grid puzzle level for a 4-year-old child's coding game.
      The grid is ${GRID_SIZE}x${GRID_SIZE}.
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
        temperature: 0.8, // Little bit of creativity for themes
      },
    });

    const rawData = response.text;
    if (!rawData) {
        throw new Error("Empty response from AI");
    }
    
    const parsedData = JSON.parse(rawData);

    return {
      id: currentLevelId + 1,
      gridSize: GRID_SIZE,
      start: parsedData.start,
      goal: parsedData.goal,
      obstacles: parsedData.obstacles,
      theme: parsedData.theme,
      story: parsedData.story,
    };

  } catch (error) {
    console.error("Failed to generate level with Gemini:", error);
    // Return a slightly modified fallback to avoid exact duplicates if offline
    return { 
        ...FALLBACK_LEVEL, 
        id: currentLevelId + 1,
        story: "Oops, the internet is napping! Let's play this backup level."
    };
  }
};