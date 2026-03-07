import express from "express";
import axios from "axios";
import multer from "multer";
import path from "path";
import fs from "fs";
import mammoth from "mammoth";
import { GoogleGenAI } from "@google/genai";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfImport = require("pdf-parse");
const pdf = typeof pdfImport === "function" ? pdfImport : pdfImport.default;

dotenv.config();

const logFile = path.join(process.cwd(), "server_debug.log");
const serverLog = (msg: string) => {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${msg}\n`;
  fs.appendFileSync(logFile, entry);
  console.log(msg);
};

serverLog("Server logging initialized");

async function startServer() {
  const app = express();
  const PORT = 3000;

  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const upload = multer({ dest: "uploads/" });
  const db = new Database("rag.db");
  db.exec(`
    CREATE TABLE IF NOT EXISTS chunks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      moduleId TEXT,
      filename TEXT,
      text TEXT,
      embedding TEXT
    )
  `);

  async function getEmbedding(text: string) {
    const key = process.env.NAVIGATE_LAB_API_KEY;
    const baseUrl = process.env.NAVIGATE_LAB_BASE_URL;
    
    if (!key || !baseUrl) {
      console.error("Navigate Labs configuration is missing.");
      throw new Error("NAVIGATE_LAB_API_KEY or NAVIGATE_LAB_BASE_URL is missing in environment");
    }
    
    try {
      const response = await axios.post(
        `${baseUrl}/embeddings`,
        {
          model: "text-embedding-3-small",
          input: text,
        },
        {
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data || !response.data.data || response.data.data.length === 0) {
        throw new Error("No embeddings returned from Navigate Labs API");
      }
      
      return response.data.data[0].embedding;
    } catch (error: any) {
      console.error("Embedding generation error:", error.response?.data || error.message);
      throw error;
    }
  }

  function cosineSimilarity(vecA: number[], vecB: number[]) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Routes
  app.post("/api/modules/:moduleId/rag/upload", upload.single("file"), async (req, res) => {
    const { moduleId } = req.params;
    const file = req.file;
    console.log(`Received upload request for module: ${moduleId}, file: ${file?.originalname}`);
    
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    try {
      const ragKey = process.env.NAVIGATE_LAB_API_KEY;
      if (!ragKey || ragKey === 'dummy') {
         console.error("NAVIGATE_LAB_API_KEY is missing or dummy in environment.");
         return res.status(500).json({ error: "RAG Embedding configuration is missing on the server." });
      }

      serverLog(`Starting document processing for module ${moduleId}, file: ${file.originalname}`);
      let text = "";
      const ext = path.extname(file.originalname).toLowerCase();
      serverLog(`Processing file extension: ${ext}`);

      if (ext === ".pdf") {
        const dataBuffer = fs.readFileSync(file.path);
        const data = await pdf(dataBuffer);
        text = data.text;
      } else if (ext === ".docx") {
        const dataBuffer = fs.readFileSync(file.path);
        const data = await mammoth.extractRawText({ buffer: dataBuffer });
        text = data.value;
      } else if (ext === ".txt") {
        text = fs.readFileSync(file.path, "utf-8");
      } else {
        console.error(`Unsupported format: ${ext}`);
        return res.status(400).json({ error: "Unsupported format. Use PDF, DOCX, or TXT." });
      }

      if (!text || text.trim().length === 0) {
        throw new Error("Extracted text is empty");
      }

      // Cleaning text
      serverLog(`Extracted ${text.length} characters. Cleaning and chunking...`);
      text = text.replace(/(\r\n|\n|\r)/gm, " "); // Normalize newlines
      text = text.replace(/\s+/g, " ").trim();    // Normalize whitespace

      // Chunking by sentences to maintain semantic boundaries
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const chunks: string[] = [];
      let currentChunk = "";
      const targetChunkSize = 1500; // ~400-500 tokens
      const minChunkSize = 200;

      for (const sentence of sentences) {
        if ((currentChunk + sentence).length > targetChunkSize && currentChunk.length > minChunkSize) {
          chunks.push(currentChunk.trim());
          // Simple overlap: keep the last sentence
          currentChunk = sentence;
        } else {
          currentChunk += " " + sentence;
        }
      }
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
      }

      serverLog(`Created ${chunks.length} chunks. Generating embeddings...`);
      
      const batchSize = 10;
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        serverLog(`Processing batch ${i / batchSize + 1} (${batch.length} chunks)...`);
        
        await Promise.all(batch.map(async (chunkText, index) => {
          try {
            const embedding = await getEmbedding(chunkText);
            const insert = db.prepare("INSERT INTO chunks (moduleId, filename, text, embedding) VALUES (?, ?, ?, ?)");
            insert.run(moduleId, file.originalname, chunkText, JSON.stringify(embedding));
          } catch (embedError: any) {
            serverLog(`Embedding error for chunk ${i + index}: ${embedError.message}`);
            throw embedError;
          }
        }));
      }
      
      fs.unlinkSync(file.path);
      serverLog(`Upload complete for ${file.originalname}. ${chunks.length} chunks indexed.`);
      res.json({ success: true, filename: file.originalname, chunksCreated: chunks.length });
    } catch (error: any) {
      const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : (error.stack || error.message);
      serverLog(`Full processing error: ${errorDetail}`);
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      res.status(500).json({ error: `Processing failed: ${error.message}`, details: error.response?.data });
    }
  });

  app.post("/api/modules/:moduleId/rag/search", async (req, res) => {
    const { moduleId } = req.params;
    const { query, limit = 5 } = req.body;
    try {
      serverLog(`RAG Search initiated for module: ${moduleId}, query: "${query}"`);
      const queryEmbedding = await getEmbedding(query);
      const allChunks = db.prepare("SELECT text, embedding FROM chunks WHERE moduleId = ?").all(moduleId) as { text: string, embedding: string }[];
      
      serverLog(`Searching through ${allChunks.length} chunks...`);
      
      const results = allChunks
        .map(chunk => ({
          text: chunk.text,
          similarity: cosineSimilarity(queryEmbedding, JSON.parse(chunk.embedding))
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      if (results.length > 0) {
        serverLog(`Top result similarity: ${results[0].similarity.toFixed(4)}`);
      } else {
        serverLog("No chunks found for this module.");
      }

      res.json({ results });
    } catch (error: any) {
      serverLog(`Search failed: ${error.stack || error.message}`);
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.get("/api/modules/:moduleId/rag/documents", (req, res) => {
    const { moduleId } = req.params;
    const docs = db.prepare("SELECT DISTINCT filename FROM chunks WHERE moduleId = ?").all(moduleId) as { filename: string }[];
    res.json({ documents: docs.map(d => d.filename) });
  });

  app.delete("/api/modules/:moduleId/rag/documents/:filename", (req, res) => {
    const { moduleId, filename } = req.params;
    try {
      db.prepare("DELETE FROM chunks WHERE moduleId = ? AND filename = ?").run(moduleId, filename);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  app.post("/api/tts", async (req, res) => {
    const { text, model, voice } = req.body;
    const apiKey = process.env.NAVIGATE_LAB_API_KEY;
    const baseUrl = process.env.NAVIGATE_LAB_BASE_URL;

    serverLog(`TTS Request: text length=${text?.length}, model=${model}, voice=${voice}`);

    if (!apiKey || !baseUrl) {
      serverLog("TTS Config Error: Missing constants");
      return res.status(500).json({ error: "TTS configuration missing on server" });
    }

    try {
      const response = await axios.post(
        `${baseUrl}/audio/speech`,
        {
          model: model || 'gpt-4o-mini-tts',
          input: text,
          voice: voice || 'alloy',
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      serverLog(`TTS Success: received ${response.data.byteLength || response.data.length} bytes`);
      res.set("Content-Type", "audio/mpeg");
      res.send(Buffer.from(response.data));
    } catch (error: any) {
      let errorMsg = error.message;
      if (error.response?.data) {
        const data = error.response.data;
        errorMsg = (data instanceof Buffer || data instanceof ArrayBuffer) 
          ? Buffer.from(data as any).toString() 
          : JSON.stringify(data);
      }
      
      serverLog(`TTS Proxy Error: ${errorMsg}`);
      res.status(error.response?.status || 500).json({ 
        error: "TTS Generation failed", 
        details: errorMsg 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`✅ Using Navigate Labs embeddings: ${process.env.NAVIGATE_LAB_BASE_URL}`);
    console.log(`✅ Using Gemini API (v1beta): ${process.env.GEMINI_API_KEY ? 'Configured' : 'Missing'}\n`);
  });
}

startServer();
