"use client"

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const router = useRouter();

	async function handleSubmit(e) {
		e.preventDefault();
		setMessage("Cadastrando...");

		try {
			await authClient.signUp.email({
				name,
				email,
				password,
				callbackURL: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/login`
			});
			router.replace("/login");
		} catch (error) {
			setMessage(`Erro no cadastro: ${error.message}`);
		}
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
			<h1 className="mb-6 text-3xl font-bold">Cadastro</h1>
			<form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded shadow-md">
				<div className="mb-4">
					<label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="name">
						Nome
					</label>
					<input
						type="text"
						id="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						className="w-full rounded border px-3 py-2 text-gray-700 focus:outline-none focus:ring"
					/>
				</div>
				<div className="mb-4">
					<label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="email">
						E-mail
					</label>
					<input
						type="email"
						id="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="w-full rounded border px-3 py-2 text-gray-700 focus:outline-none focus:ring"
					/>
				</div>
				<div className="mb-6">
					<label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="password">
						Senha
					</label>
					<input
						type="password"
						id="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						className="w-full rounded border px-3 py-2 text-gray-700 focus:outline-none focus:ring"
					/>
				</div>
				<button
					type="submit"
					className="w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring"
				>
					Cadastrar
				</button>
			</form>
			{message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
		</div>
	)
}
