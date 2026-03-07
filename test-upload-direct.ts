import axios from "axios";
import fs from "fs";
import FormData from "form-data";

async function testUpload() {
  const filePath = "test.txt";
  fs.writeFileSync(filePath, "This is a test document for RAG processing. It contains interesting information about AI training.");
  
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  
  try {
    console.log("Testing upload to 127.0.0.1:3000/api/modules/test-123/rag/upload...");
    const response = await axios.post(
      "http://127.0.0.1:3000/api/modules/test-123/rag/upload",
      form,
      {
        headers: form.getHeaders(),
      }
    );
    console.log("✅ Success:", response.data);
  } catch (e: any) {
    if (e.response) {
      console.log("❌ Failed:", e.response.status, JSON.stringify(e.response.data));
    } else {
      console.log("❌ Failed:", e.message);
    }
  }
}

testUpload();
