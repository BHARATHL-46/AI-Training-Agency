import axios from "axios";

async function testLocalTTS() {
  try {
    const response = await axios.post(
      "http://127.0.0.1:3000/api/tts",
      {
        text: "Testing local proxy",
        model: "gpt-4o-mini-tts",
        voice: "alloy"
      }
    );
    console.log("✅ Backend proxy works!");
  } catch (e: any) {
    if (e.response) {
      console.log("❌ Backend proxy failed:", e.response.status, e.response.data);
    } else {
      console.log("❌ Backend proxy failed:", e.message);
    }
  }
}

testLocalTTS();
