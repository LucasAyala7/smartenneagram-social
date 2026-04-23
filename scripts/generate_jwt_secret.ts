// Gera um JWT_SECRET aleatório de 64 chars hex
// Uso: npx tsx scripts/generate_jwt_secret.ts
import crypto from "node:crypto";
console.log(crypto.randomBytes(32).toString("hex"));
