"use client"

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, ShieldAlert, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PasswordResetPage() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const router = useRouter();

	async function handleReset(e) {
		e.preventDefault();
		setLoading(true);

		try {
			await authClient.requestPasswordReset({
				email: email.toLowerCase(),
			})
		} catch (err) {
			setError(err.message);
		} finally {
			setSubmitted(true);
			setLoading(false);
		}
	}

	if (submitted) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
				<Card className="w-full max-w-md shadow-xl">
					<CardHeader className="text-center space-y-4">
						<div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
							<KeyRound className="w-8 h-8 text-blue-600" />
						</div>
						<CardTitle className="text-2xl">Solicitação Recebida</CardTitle>
						<CardDescription>
							Verifique seu e-mail para as próximas instruções
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Alert className="bg-blue-50 border-blue-200">
							<ShieldAlert className="h-4 w-4 text-blue-600" />
							<AlertTitle className="text-blue-800">Importante</AlertTitle>
							<AlertDescription className="text-blue-700">
								Se o endereço {email} estiver cadastrado em nossa base, enviaremos um link para redefinição de senha nos próximos minutos.
							</AlertDescription>
						</Alert>

						<div className="flex gap-2">
							<Button
								onClick={() => router.push("/login")}
								className="w-full h-11 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
							>
								Ir para Login
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
			<Card className="w-full max-w-md shadow-xl">
				<CardHeader>
					<Button
						variant="ghost"
						onClick={() => router.push("/login")}
						className="w-fit -ml-2 mb-2"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Voltar
					</Button>
					<CardTitle className="text-2xl">Redefinição de senha</CardTitle>
					<CardDescription>
						Informe seu e-mail para receber as instruções de redefinição de senha
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleReset} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">E-mail</Label>
							<Input
								id="email"
								type="email"
								placeholder="seu@email.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={loading}
								className="h-11"
							/>
							<p className="text-xs text-muted-foreground">
								Digite o e-mail associado à sua conta
							</p>
						</div>

						<Button
							type="submit"
							className="w-full h-11 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
							disabled={loading || !email}
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Processando...
								</>
							) : (
								<>
									<KeyRound className="mr-2 h-4 w-4" />
									Redefinir minha senha
								</>
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}