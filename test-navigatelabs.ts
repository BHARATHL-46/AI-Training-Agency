import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function testNavigateLabs() {
  const apiKey = process.env.NAVIGATE_LAB_API_KEY;
  const baseUrl = process.env.NAVIGATE_LAB_BASE_URL;
  if (!apiKey || !baseUrl) return;
  
  try {
    console.log("Testing Navigate Labs Chat with gemini-2.5-flash...");
    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model: "gemini-2.5-flash",
        messages: [{ role: "user", content: "Hi" }],
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log("✅ Navigate Labs Chat works with gemini-2.5-flash!");
    console.log("Response:", response.data.choices[0].message.content);
  } catch (e: any) {
    console.log("❌ Navigate Labs Chat failed:", e.response?.data || e.message);
  }
}

testNavigateLabs();
