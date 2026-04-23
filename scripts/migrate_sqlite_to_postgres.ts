// Migra dados do SQLite local (prisma/dev.db) pro Postgres de produção.
// Rodar 1x no deploy inicial se você quiser preservar posts/configs criados localmente.
//
// Pré-requisitos:
//   1. Postgres já configurado com schema aplicado (npx prisma db push usando schema.postgres.prisma)
//   2. SOURCE_SQLITE_URL aponta pro dev.db local: "file:./prisma/dev.db"
//   3. TARGET_POSTGRES_URL aponta pro postgres remoto
//
// Uso:
//   SOURCE_SQLITE_URL="file:./prisma/dev.db" TARGET_POSTGRES_URL="postgresql://..." \
//     npx tsx scripts/migrate_sqlite_to_postgres.ts

import { PrismaClient as SqliteClient } from "@prisma/client";

async function main() {
  const sourceUrl = process.env.SOURCE_SQLITE_URL || "file:./prisma/dev.db";
  const targetUrl = process.env.TARGET_POSTGRES_URL;

  if (!targetUrl) {
    console.error("TARGET_POSTGRES_URL não definida");
    process.exit(1);
  }

  console.log(`[migrate] source: ${sourceUrl}`);
  console.log(`[migrate] target: ${targetUrl.replace(/:[^:@/]+@/, ":****@")}`);

  // IMPORTANTE: esse script assume que o schema já foi trocado e o PrismaClient
  // atual conecta no Postgres (target). Pra ler o SQLite, precisamos criar um
  // client com override de datasource — que só funciona se o provider do schema
  // atual for compatível. Estratégia segura:
  //
  // 1. Schema atual = postgres (target)
  // 2. Lê SQLite via better-sqlite3 direto (bypass Prisma)
  // 3. Escreve no Postgres via Prisma

  const Database = require("better-sqlite3");
  const sqlitePath = sourceUrl.replace(/^file:/, "");
  const sqlite = new Database(sqlitePath, { readonly: true });

  const target = new SqliteClient({ datasources: { db: { url: targetUrl } } });

  // ==== CITATIONS ====
  const citations = sqlite
    .prepare("SELECT * FROM Citation")
    .all()
    .map((r: any) => ({
      ...r,
      hasPage: Boolean(r.hasPage),
      translated: Boolean(r.translated),
      usedAt: r.usedAt ? new Date(r.usedAt) : null
    }));
  console.log(`[migrate] citations: ${citations.length}`);
  await target.citation.deleteMany();
  // createMany do postgres suporta skipDuplicates
  const CHUNK = 500;
  for (let i = 0; i < citations.length; i += CHUNK) {
    await target.citation.createMany({
      data: citations.slice(i, i + CHUNK)
    });
  }
  console.log(`✓ ${citations.length} citations migradas`);

  // ==== TYPE META ====
  const typemetas = sqlite.prepare("SELECT * FROM TypeMeta").all();
  await target.typeMeta.deleteMany();
  for (const t of typemetas as any[]) {
    await target.typeMeta.create({ data: t });
  }
  console.log(`✓ ${typemetas.length} typeMetas migradas`);

  // ==== POSTS ====
  const posts = sqlite
    .prepare("SELECT * FROM Post")
    .all()
    .map((r: any) => ({
      ...r,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
      scheduledFor: r.scheduledFor ? new Date(r.scheduledFor) : null,
      publishedAt: r.publishedAt ? new Date(r.publishedAt) : null
    }));
  await target.post.deleteMany();
  for (const p of posts) {
    await target.post.create({ data: p });
  }
  console.log(`✓ ${posts.length} posts migrados`);

  // ==== CONFIG ====
  const configs = sqlite.prepare("SELECT * FROM Config").all();
  await target.config.deleteMany();
  for (const c of configs as any[]) {
    await target.config.create({ data: c });
  }
  console.log(`✓ ${configs.length} configs migrados`);

  await target.$disconnect();
  sqlite.close();
  console.log("[migrate] concluído");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
