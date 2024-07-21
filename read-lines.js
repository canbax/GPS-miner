import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readLine(tsvFilePath, lineNumber) {
  const indexFilePath = path.join(path.dirname(tsvFilePath), "index.bin");

  // Open both files
  const tsvFileHandle = await fs.open(tsvFilePath, "r");
  const indexFileHandle = await fs.open(indexFilePath, "r");

  // Read the offset from the index file
  const buffer = Buffer.alloc(8);
  await indexFileHandle.read(buffer, 0, 8, lineNumber * 8);
  const offset = buffer.readBigInt64LE();

  // Read the line from the TSV file
  const lineBuffer = Buffer.alloc(1024); // Assume max line length of 1024 bytes
  const { bytesRead } = await tsvFileHandle.read(
    lineBuffer,
    0,
    1024,
    Number(offset)
  );
  const line = lineBuffer.toString("utf8", 0, bytesRead).split("\n")[0];

  // Close file handles
  await tsvFileHandle.close();
  await indexFileHandle.close();

  return line;
}

// Usage
async function main() {
  const tsvFilePath = path.join(__dirname, "generated_data/db.tsv");
  const line = await readLine(tsvFilePath, 322442); // Read the 6th line (0-indexed)
  console.log(line);
}

main().catch(console.error);
