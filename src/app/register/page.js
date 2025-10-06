"use client"

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, UserPlus } from "lucide-react";

export default function RegisterPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	async function handleSubmit(e) {
		e.preventDefault();
		setMessage("");
		setIsLoading(true);
		setError("");

		try {
			const { data, error } = await authClient.signUp.email({
				name,
				email,
				password
			});
			if (error) {
				setError(`Erro ao realizar o cadastro: ${error.message}`);
				setIsLoading(false);
				return;
			}
			if (data) {
				setMessage("Cadastro realizado com sucesso!");
				setTimeout(() => {
					router.push("/login");
				}, 2000);
			}
		} catch (error) {
			setMessage(`Erro no cadastro: ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">Project Dice</h1>
				</div>
				<Card className="shadow-xl">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl font-bold text-center">Cadastro</CardTitle>
						<CardDescription className="text-center">
							Insira suas informações para cadastrar sua conta
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleSubmit}>
						<CardContent className="space-y-4">
							{error && (
								<Alert variant={"destructive"}>
									<AlertTitle>
										{error}
									</AlertTitle>
								</Alert>
							)}
							{message && !error && (
								<Alert>
									<AlertTitle className="text-green">
										{message}
									</AlertTitle>
								</Alert>
							)}
							<div className="space-y-2">
								<Label htmlFor="name">
									Nome
								</Label>
								<Input
									id="name"
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">
									E-mail
								</Label>
								<Input
									id="email"
									type="email"
									placeholder="seu@email.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">
									Senha
								</Label>
								<Input
									id="password"
									type="password"
									placeholder="********"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>
							<Button
								type="submit"
								disabled={isLoading}
								className="w-full">
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Carregando...
									</>
								) : (
									<>
										<UserPlus className="mr-2 h-4 w-4" />
										Criar Conta
									</>
								)}
							</Button>
						</CardContent>
					</form>
				</Card>
			</div>
		</div>
	)
}
