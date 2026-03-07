import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function listAllModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found");
    return;
  }
  const ai = new GoogleGenAI({ apiKey, apiVersion: "v1beta" });
  
  try {
    console.log("Listing models...");
    const models = await ai.models.list();
    for await (const model of models) {
      console.log(`- ${model.name} (${model.supported_methods.join(", ")})`);
    }
  } catch (e: any) {
    console.log(`Error: ${e.message}`);
  }
}

listAllModels();
