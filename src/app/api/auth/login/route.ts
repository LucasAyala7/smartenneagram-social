import { NextResponse } from "next/server";
import { verifyCredentials, createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "email e senha obrigatórios" }, { status: 400 });
    }

    const user = await verifyCredentials(email, password);
    if (!user) {
      // Não distingue email inválido de senha inválida (segurança)
      return NextResponse.json({ error: "credenciais inválidas" }, { status: 401 });
    }

    const token = await createSessionToken(user);
    setSessionCookie(token);

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: err?.message || "erro" }, { status: 500 });
  }
}
