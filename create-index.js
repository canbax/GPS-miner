import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createIndex(tsvFilePath) {
  const indexFilePath = path.join(path.dirname(tsvFilePath), "index.bin");
  const fileHandle = await fs.open(tsvFilePath, "r");
  const indexFileHandle = await fs.open(indexFilePath, "w");

  let lineStart = 0;
  let lineNumber = 0;
  const buffer = Buffer.alloc(8); // 8 bytes for a BigInt

  for await (const line of fileHandle.readLines()) {
    buffer.writeBigInt64LE(BigInt(lineStart));
    await indexFileHandle.write(buffer);
    lineStart += Buffer.byteLength(line) + 1; // +1 for the newline character
    lineNumber++;
  }

  await fileHandle.close();
  await indexFileHandle.close();

  console.log(`Index created with ${lineNumber} entries.`);
}

// Usage
const tsvFilePath = path.join(__dirname, "generated_data/db.tsv");
createIndex(tsvFilePath).catch(console.error);
