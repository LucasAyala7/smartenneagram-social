// Smoke test do knowledge loader
import { buildKnowledgeBundle } from "../src/lib/knowledge";

const bundle = buildKnowledgeBundle({
  typeTarget: 4,
  model: "M1",
  pillar: "A"
});

console.log("=== Knowledge Bundle Stats ===");
console.log(JSON.stringify(bundle.stats, null, 2));
console.log("=== First 800 chars ===");
console.log(bundle.system.slice(0, 800));
console.log("...");
console.log("=== Last 400 chars ===");
console.log(bundle.system.slice(-400));
