import { readFileSync, writeFile } from "fs";
import { resolve } from "path";

const CELL_SIZE = 0.1; // Define the grid cell size in degrees

// Helper function to get the grid cell index for a given latitude and longitude
function getGridCell(lat, lon) {
  const latIndex = Math.floor(lat / CELL_SIZE);
  const lonIndex = Math.floor(lon / CELL_SIZE);
  return `${latIndex},${lonIndex}`;
}

// Parse the TSV file
async function parseTSVFile(filePath) {
  const grid = {};

  const fileContent = readFileSync(filePath, "utf-8");
  const lines = fileContent.split("\n");

  lines.forEach((line, lineNumber) => {
    if (lineNumber === 0 || line.trim() === "") return; // skip header line
    const [, , , latitude, longitude] = line.split("\t");
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const cell = getGridCell(lat, lon);

    if (!grid[cell]) grid[cell] = [];
    grid[cell].push([lat, lon, lineNumber]);
  });

  return grid;
}

function writeGridToJSON(grid, outputFilePath) {
  return new Promise((resolve, reject) => {
    writeFile(outputFilePath, JSON.stringify(grid), "utf-8", (err) => {
      if (err) reject(err);
      else resolve(outputFilePath);
    });
  });
}

// Calculate the Euclidean distance between two points (lat1, lon1) and (lat2, lon2)
function calculateDistance(lat1, lon1, lat2, lon2) {
  return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2));
}

// Find the top 10 closest settlements
function findClosestSettlements(grid, targetLat, targetLon, k = 10) {
  const targetCell = getGridCell(targetLat, targetLon);

  const neighbors = [];
  const [latIndex, lonIndex] = targetCell.split(",").map(Number);

  // Check the current cell and its neighbors
  for (let i = latIndex - 1; i <= latIndex + 1; i++) {
    for (let j = lonIndex - 1; j <= lonIndex + 1; j++) {
      const cellKey = `${i},${j}`;
      if (grid[cellKey]) {
        for (const settlement of grid[cellKey]) {
          const distance = calculateDistance(
            targetLat,
            targetLon,
            settlement[0],
            settlement[1]
          );
          neighbors.push({ ...settlement, distance });
        }
      }
    }
  }

  // Sort by distance and return the top k results
  neighbors.sort((a, b) => a.distance - b.distance);
  return neighbors.slice(0, k);
}

// Main function
async function main() {
  const filePath = resolve("generated_data/db.tsv");
  const t1 = new Date().getTime();
  const grid = await parseTSVFile(filePath);
  const t2 = new Date().getTime();
  console.log("parse TSV in ", t2 - t1, " ms");
  const outputFilePath = resolve("generated_data/grid.json");
  await writeGridToJSON(grid, outputFilePath);
  // const targetLat = 40.02106; // Replace with your target latitude
  // const targetLon = 32.83102; // Replace with your target longitude

  // const closestSettlements = findClosestSettlements(grid, targetLat, targetLon);

  // console.log("Top 10 closest settlements:", closestSettlements);
}

main().catch((err) => console.error(err));
