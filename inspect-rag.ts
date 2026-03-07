import Database from "better-sqlite3";

const db = new Database("rag.db");

function inspect() {
  console.log("\n--- RAG Knowledge Base Inspection ---");
  
  // Get summary
  const summary = db.prepare(`
    SELECT moduleId, filename, COUNT(*) as chunkCount 
    FROM chunks 
    GROUP BY moduleId, filename
  `).all();

  if (summary.length === 0) {
    console.log("No data found in rag.db. Upload some documents first!");
    return;
  }

  console.log("\nIndexed Documents:");
  summary.forEach((row: any) => {
    console.log(`- Module: ${row.moduleId} | File: ${row.filename} | Chunks: ${row.chunkCount}`);
  });

  // Show a sample chunk
  const sample = db.prepare("SELECT text, embedding FROM chunks LIMIT 1").get() as any;
  if (sample) {
    console.log("\nSample Chunk Data:");
    console.log("Text (First 100 chars):", sample.text.substring(0, 100) + "...");
    const embedding = JSON.parse(sample.embedding);
    console.log("Embedding Vector Length:", embedding.length);
    console.log("First 3 dimensions:", embedding.slice(0, 3));
  }
  
  console.log("\n--------------------------------------\n");
}

inspect();
