import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { generateIncidents } from "../src/data/generateIncidents";

const output = resolve("public/asrs-synthetic-incidents.json");
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(generateIncidents(1250), null, 2));
console.log(`Wrote ${output}`);
