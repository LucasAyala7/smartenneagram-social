// Auth simples: users hardcoded no .env (2), cookie JWT HttpOnly.
// Pra adicionar user: bcrypt hash a senha (npm run hash), cola no .env, reinicia.

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export type AuthUser = {
  email: string;
  name: string;
  role: "admin" | "editor";
};

const COOKIE_NAME = "se_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dias

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "";
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET não configurado (mínimo 32 chars). Gere com: openssl rand -hex 32"
    );
  }
  return new TextEncoder().encode(secret);
}

// Carrega users do .env
// Formato: USERS='[{"email":"...","passwordHash":"...","name":"...","role":"admin|editor"}]'
// OU campos separados: LUCAS_EMAIL, LUCAS_PASSWORD_HASH, SAMARA_EMAIL, SAMARA_PASSWORD_HASH
type StoredUser = AuthUser & { passwordHash: string };

function loadUsers(): StoredUser[] {
  const users: StoredUser[] = [];

  // formato JSON consolidado
  if (process.env.USERS) {
    try {
      const parsed = JSON.parse(process.env.USERS);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // ignora, segue pro formato separado
    }
  }

  // formato campos separados
  if (process.env.LUCAS_EMAIL && process.env.LUCAS_PASSWORD_HASH) {
    users.push({
      email: process.env.LUCAS_EMAIL.toLowerCase().trim(),
      passwordHash: process.env.LUCAS_PASSWORD_HASH,
      name: process.env.LUCAS_NAME || "Lucas",
      role: "admin"
    });
  }
  if (process.env.SAMARA_EMAIL && process.env.SAMARA_PASSWORD_HASH) {
    users.push({
      email: process.env.SAMARA_EMAIL.toLowerCase().trim(),
      passwordHash: process.env.SAMARA_PASSWORD_HASH,
      name: process.env.SAMARA_NAME || "Samara",
      role: "editor"
    });
  }

  return users;
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const users = loadUsers();
  const user = users.find((u) => u.email === email.toLowerCase().trim());
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { email: user.email, name: user.name, role: user.role };
}

export async function createSessionToken(user: AuthUser): Promise<string> {
  const token = await new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getJwtSecret());
  return token;
}

export async function verifySessionToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (!payload.email || !payload.role) return null;
    return {
      email: String(payload.email),
      name: String(payload.name || ""),
      role: payload.role as AuthUser["role"]
    };
  } catch {
    return null;
  }
}

// Helpers pra uso em server components / API routes
export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export { COOKIE_NAME };
