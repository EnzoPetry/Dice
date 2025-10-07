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

export default function LoginPage() {
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
			const { data, error } = await authClient.signIn.email({
				email,
				password
			});
			if (error) {
				setError(`Erro ao fazer login: ${error.message}`);
				setIsLoading(false);
				return;
			}
			if (data) {
				setMessage("Login realizado com sucesso!");
				setTimeout(() => {
					console.log("Redirecionando para /chat/1");
					router.push("/home");
				}, 2000);
			}
		} catch (error) {
			setError(`Erro ao fazer login: ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	}

	const handleLoginGoogle = async () => {
		await authClient.signIn.social({
			provider: "google",
			callbackURL: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/home`
		});
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">Project Dice</h1>
				</div>
				<Card className="shadow-xl">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
						<CardDescription className="text-center">
							Digite suas credenciais para acessar sua conta
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						{error && (
							<Alert variant="destructive" className="animate-in slide-in-from-top-2">
								<AlertTitle>
									{error}
								</AlertTitle>
							</Alert>
						)}
						{message && !error && (
							<Alert className="bg-green-50 border-green-200 animate-in slide-in-from-top-2">
								<AlertTitle className="text-green-800">
									{message}
								</AlertTitle>
							</Alert>
						)}

						<form onSubmit={handleSubmit} className="space-y-4">
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
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>
							<Button
								type="submit"
								disabled={isLoading}
								className="w-full h-11 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-5 w-5 animate-spin" />
										Entrando...
									</>
								) : (
									<>
										<LogIn className="mr-2 h-5 w-5" />
										Entrar
									</>
								)}
							</Button>
						</form>

						<Button
							type="button"
							variant="outline"
							className="w-full h-11 text-base font-medium border-2 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
							onClick={handleLoginGoogle}
							disabled={isLoading}
						>
							<svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
								<path
									fill="#4285F4"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="#34A853"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="#FBBC05"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="#EA4335"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							Continuar com Google
						</Button>

						<div className="relative my-6">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-300"></div>
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-4 bg-white text-gray-500">não tem conta?</span>
							</div>
						</div>

						<Button
							type="button"
							variant="outline"
							className="w-full h-11 text-base font-medium border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200"
							onClick={() => router.push("/register")}
							disabled={isLoading}
						>
							<UserPlus className="mr-2 h-5 w-5" />
							Criar nova conta
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
