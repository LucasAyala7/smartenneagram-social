// Gera JWT_SECRET + 2 senhas fortes + hashes bcrypt escapados pro .env
// Uso: npx tsx scripts/gen_prod_secrets.ts
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

function randChunk(len = 8): string {
  return crypto.randomBytes(len).toString("base64url").slice(0, len);
}

function generateSecrets() {
  const jwtSecret = crypto.randomBytes(32).toString("hex");

  const lucasPassword = `LucasSE-${randChunk(10)}`;
  const samaraPassword = `SamaraSE-${randChunk(10)}`;

  const lucasHash = bcrypt.hashSync(lucasPassword, 10);
  const samaraHash = bcrypt.hashSync(samaraPassword, 10);

  // escape pra Next .env
  const esc = (h: string) => h.replace(/\$/g, "\\$");

  return {
    jwtSecret,
    lucasPassword,
    samaraPassword,
    lucasHash,
    samaraHash,
    lucasHashEsc: esc(lucasHash),
    samaraHashEsc: esc(samaraHash)
  };
}

const s = generateSecrets();

console.log("=".repeat(70));
console.log("CREDENCIAIS GERADAS — SMARTENNEAGRAM SOCIAL FACTORY");
console.log("=".repeat(70));
console.log("");
console.log("Login Lucas (admin):");
console.log(`  Email:    lucasayalla@gmail.com`);
console.log(`  Senha:    ${s.lucasPassword}`);
console.log("");
console.log("Login Samara (editor):");
console.log(`  Email:    samara@diwins.com.br`);
console.log(`  Senha:    ${s.samaraPassword}`);
console.log("");
console.log("=".repeat(70));
console.log("ENV VARS — cole no painel Coolify do app:");
console.log("=".repeat(70));
console.log("");
console.log(`JWT_SECRET=${s.jwtSecret}`);
console.log("");
console.log(`LUCAS_EMAIL=lucasayalla@gmail.com`);
console.log(`LUCAS_PASSWORD_HASH=${s.lucasHash}`);
console.log(`LUCAS_NAME=Lucas`);
console.log("");
console.log(`SAMARA_EMAIL=samara@diwins.com.br`);
console.log(`SAMARA_PASSWORD_HASH=${s.samaraHash}`);
console.log(`SAMARA_NAME=Samara`);
console.log("");
console.log("=".repeat(70));
console.log("OBS: No painel Coolify, as env vars são strings literais.");
console.log("     NÃO precisa escapar \\$ como no .env — cole o hash bruto.");
console.log("=".repeat(70));
