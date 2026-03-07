import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function testEmbeddings() {
  const apiKey = process.env.NAVIGATE_LAB_API_KEY;
  const baseUrl = process.env.NAVIGATE_LAB_BASE_URL;
  if (!apiKey || !baseUrl) {
    console.log("Missing config");
    return;
  }
  
  try {
    console.log("Testing Navigate Labs Embeddings with text-embedding-3-small...");
    console.log("URL:", `${baseUrl}/embeddings`);
    const response = await axios.post(
      `${baseUrl}/embeddings`,
      {
        model: "text-embedding-3-small",
        input: "Hello world",
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log("✅ Success!");
    console.log("Embedding length:", response.data.data[0].embedding.length);
  } catch (e: any) {
    console.log("❌ Failed:", e.response?.data || e.message);
  }
}

testEmbeddings();
