import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey, apiVersion: "v1beta" });

const stripMarkdown = (text: string) => {
  if (!text) return "";
  // Attempt to extract the first JSON-like block (either array or object)
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    return jsonMatch[0].trim();
  }
  return text.replace(/```json\n?|```/g, "").trim();
};

export const generateModuleContentStream = async (
  topic: string,
  languageCode: string,
  headings: string[] | undefined,
  onChunk: (text: string) => void,
  ragContext?: string
) => {
  const model = "gemini-2.5-flash-lite";
  const languageMap: { [key: string]: string } = {
    en: 'English', ta: 'Tamil'
  };
  const language = languageMap[languageCode] || languageCode;

  const systemInstruction = `You are an expert instructional designer.
Generate educational content ONLY for module lessons.
The content must be written in ${language}.
Output valid JSON only.

${ragContext ? `USE THE FOLLOWING RETRIEVED KNOWLEDGE AS REFERENCE:
---
${ragContext}
---` : ''}

FORMAT:
{
  "module_title": "...",
  "sections": [{ "heading": "...", "content": "...", "key_points": ["..."], "example": "..." }],
  "objectives_summary": "..."
}`;

  const prompt = `Topic: ${topic}. Headings: ${headings?.join(', ')}. Language: ${language}.`;

  const response = await ai.models.generateContentStream({
    model,
    contents: prompt,
    config: { systemInstruction: systemInstruction, responseMimeType: "application/json" },
  });

  let fullText = "";
  for await (const chunk of response) {
    const text = chunk.text;
    if (text) {
      fullText += text;
      onChunk(fullText);
    }
  }

  try {
    return JSON.parse(stripMarkdown(fullText));
  } catch (e) {
    console.error("Failed to parse generated content", e);
    return null;
  }
};

export const translateModuleContent = async (
  content: any,
  targetLanguageCode: string
) => {
  const model = "gemini-2.5-flash-lite";
  const languageMap: { [key: string]: string } = {
    en: 'English', ta: 'Tamil'
  };
  const targetLanguage = languageMap[targetLanguageCode] || targetLanguageCode;
  console.log(`[geminiService] Translating content to: ${targetLanguage} (${targetLanguageCode})`);

  const systemInstruction = `You are a professional translator. 
Translate the provided JSON educational content into ${targetLanguage}.
CRITICAL: 
1. Translate ALL text values into ${targetLanguage}.
2. Keep the JSON keys exactly the same.
3. Output ONLY the translated JSON object.
4. No markdown, no explanations.`;

  const prompt = `Translate this JSON to ${targetLanguage}:\n${JSON.stringify(content)}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { systemInstruction: systemInstruction, responseMimeType: "application/json" },
  });

  console.log(`[geminiService] Translation response received. Length: ${response.text?.length || 0}`);

  try {
    return JSON.parse(stripMarkdown(response.text || "{}"));
  } catch (e) {
    console.error("Translation parsing failed", e);
    return null;
  }
};

export const generateQuiz = async (topic: string, language: string, headings?: string[]) => {
  const model = "gemini-2.5-flash-lite";
  const systemInstruction = "You are an educational assessment expert. Generate high-quality multiple-choice questions. The output MUST be in English, regardless of the input language of the topic.";
  const headingsContext = headings ? `The quiz should cover these specific topics: ${headings.join(', ')}.` : '';
  const prompt = `Generate 10 multiple-choice questions about "${topic}" in ${language}. 
  ${headingsContext}
  Each question should have 4 options and one correct answer.
  Return as a JSON array of objects with fields: question, options (array), correctAnswer (index).`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "[]");
};

export const generateHeadingSuggestions = async (moduleTitle: string, existingHeadings: string[]) => {
  const model = "gemini-2.5-flash-lite";
  const systemInstruction = `You are an expert course curriculum designer.
Generate 5–8 structured module section headings for a learning module.

Rules:
• Do not repeat existing headings
• Maintain logical learning progression
• Use short clear headings
• Make them suitable for an educational module
• Return only the headings as a JSON array of strings. 
• DO NOT include any introductory or explanatory text. 
• ONLY OUTPUT THE RAW JSON.`;

  const prompt = `Module Title: ${moduleTitle}
Existing Headings: ${existingHeadings.join(', ')}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { systemInstruction: systemInstruction, responseMimeType: "application/json" },
  });

  try {
    return JSON.parse(stripMarkdown(response.text || "[]"));
  } catch (e) {
    console.error("Failed to parse heading suggestions", e);
    return [];
  }
};
