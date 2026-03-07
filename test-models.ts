import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function testModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;
  const ai = new GoogleGenAI({ apiKey });
  
  const models = ['gemini-2.0-flash-lite', 'gemini-2.0-flash-lite-preview-02-05', 'gemini-1.5-flash-002', 'gemini-1.5-flash-001'];

  for (const model of models) {
    try {
      console.log(`Testing ${model}...`);
      const response = await ai.models.generateContent({
        model,
        contents: "Hi",
      });
      console.log(`  ✅ ${model} works!`);
    } catch (e: any) {
      console.log(`  ❌ ${model} failed: ${e.message}`);
    }
  }
}

testModels();
