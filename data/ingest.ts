import { createReadStream } from "fs";
import { join } from "path";
import { tsv2json } from "tsv-json";
import { DataAPIClient } from "@datastax/astra-db-ts";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

type Schema = {
  tconst: string;
  titleType: string;
  primaryTitle: string;
  originalTitle: string;
  isAdult: string;
  startYear: string;
  endYear: string;
  runtimeMinutes: string;
  genres: string;
};

const output: Schema[] = [];
const readStream = createReadStream(join(__dirname, "imdb.tsv"), "utf8");

const dataClient = new DataAPIClient(process.env.DS_API_KEY!);
const collection = dataClient
  .db(process.env.DS_API_ENDPOINT!)
  .collection("movies");

const rl = readline.createInterface({
  input: readStream,
  crlfDelay: Infinity,
});

let lines: any[] = [];
let lineCount = 0;
const linesPerBatch = 10000;
let inserted = 0;

rl.on("line", async (line) => {
  const processedLine = tsv2json(line);
  lines.push(
    ...processedLine.map((l) => ({
      tconst: l[0],
      titleType: l[1],
      primaryTitle: l[2],
      originalTitle: l[3],
      isAdult: l[4],
      startYear: l[5],
      endYear: l[6],
      runtimeMinutes: l[7],
      genres: l[8],
    }))
  );
  lineCount++;

  if (lineCount === linesPerBatch) {
    await processLines();
    lines = [];
    lineCount = 0;
  }
});

rl.on("close", async () => {
  if (lines.length > 0) {
    // Process any remaining lines that didn't fill the last batch
    await processLines();
  }
  console.log("Finished reading the file");
});

rl.on("error", (err) => {
  console.error("An error occurred:", err.message);
});

async function processLines() {
  const record = lines.map((curr) => {
    return {
      $vectorize: `${curr.primaryTitle} is a ${curr.genres} released in ${curr.startYear} and is ${curr.runtimeMinutes} minutes long.`,
      ...curr,
    };
  });

  await collection.insertMany(record, {
    maxTimeMS: 2_147_483_647,
    ordered: false,
  });
  inserted += record.length;
  console.clear();
  console.log(
    `(${Math.floor(inserted / 10809177)}%) Inserted ${inserted} movies`
  );
}
