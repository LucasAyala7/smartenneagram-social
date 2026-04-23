// Gera bcrypt hash pra colar no .env
// Uso: npx tsx scripts/hash_password.ts "sua-senha-aqui"
import bcrypt from "bcryptjs";

const pw = process.argv[2];
if (!pw) {
  console.error("Uso: npx tsx scripts/hash_password.ts \"sua-senha\"");
  process.exit(1);
}

const hash = bcrypt.hashSync(pw, 10);
// Escapa $ para o .env (Next usa dotenv-expand; $var seria interpretado)
const envSafe = hash.replace(/\$/g, "\\$");

console.log("Hash bcrypt:");
console.log(hash);
console.log("");
console.log("Cole no .env (aspas duplas + $ escapado com \\):");
console.log(`LUCAS_PASSWORD_HASH="${envSafe}"`);
console.log(`# ou`);
console.log(`SAMARA_PASSWORD_HASH="${envSafe}"`);
