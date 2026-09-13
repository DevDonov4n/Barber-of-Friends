"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() { const router = useRouter(); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState("");
  async function submit(e: FormEvent) { e.preventDefault(); setError(""); const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) }); const data = await r.json(); if (!r.ok) return setError(data.error); router.push(data.user.role === "BARBER" ? "/painel/barbeiro" : "/agendar"); router.refresh(); }
  return <main className="site-shell"><section className="auth-page"><div className="auth-card glass"><a className="back-link" href="/">← Início</a><span className="eyebrow">BARBER OF FRIENDS</span><h1>Bem-vindo de volta.</h1><p>Entre para agendar seu próximo corte.</p><form onSubmit={submit}><label>E-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Senha<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>{error && <p className="error">{error}</p>}<button className="btn btn-primary" type="submit">Entrar</button></form><a className="register-link" href="/cadastro">Ainda não tenho conta</a></div></section></main>; }
