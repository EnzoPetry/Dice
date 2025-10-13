"use client"

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";

export default function VerifyEmailPage() {
	const [status, setStatus] = useState("verifying"); // verifying, success, error
	const [message, setMessage] = useState("");
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	useEffect(() => {
		if (!token) {
			setStatus("error");
			setMessage("Token de verificação não encontrado na URL");
			return;
		}

		verifyEmail();
	}, [token]);

	async function verifyEmail() {
		try {
			const response = await fetch(`/api/auth/verify-email?token=${token}`, {
				method: "GET",
			});

			const data = await response.json();

			if (!response.ok || data.error) {
				throw new Error(data.error?.message || "Erro ao verificar e-mail");
			}

			setStatus("success");
			setMessage("E-mail verificado com sucesso! Você já pode fazer login.");

		} catch (error) {
			setStatus("error");
			setMessage(error.message || "Erro ao verificar e-mail. O link pode ter expirado.");
			console.error("Erro na verificação:", error);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
			<Card className="w-full max-w-md shadow-xl">
				<CardHeader className="text-center space-y-4">
					{status === "verifying" && (
						<div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
							<Mail className="w-8 h-8 text-blue-600 animate-pulse" />
						</div>
					)}
					{status === "success" && (
						<div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-300">
							<CheckCircle2 className="w-8 h-8 text-green-600" />
						</div>
					)}
					{status === "error" && (
						<div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
							<XCircle className="w-8 h-8 text-red-600" />
						</div>
					)}

					<CardTitle className="text-2xl">
						{status === "verifying" && "Verificando E-mail..."}
						{status === "success" && "E-mail Verificado!"}
						{status === "error" && "Erro na Verificação"}
					</CardTitle>
					<CardDescription>
						{status === "verifying" && "Aguarde enquanto confirmamos seu e-mail"}
						{status === "success" && "Sua conta foi ativada com sucesso"}
						{status === "error" && "Não foi possível verificar seu e-mail"}
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					{status === "verifying" && (
						<div className="flex flex-col items-center justify-center py-8">
							<Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
							<p className="text-muted-foreground text-center">
								Processando sua verificação...
							</p>
						</div>
					)}

					{status === "success" && (
						<>
							<Alert className="bg-green-50 border-green-200 animate-in slide-in-from-top-2">
								<CheckCircle2 className="h-4 w-4 text-green-600" />
								<AlertTitle className="text-green-800">Sucesso!</AlertTitle>
								<AlertDescription className="text-green-700">
									{message}
								</AlertDescription>
							</Alert>

							<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
								<p className="text-sm text-blue-800 mb-2">
									<strong>Próximos passos:</strong>
								</p>
								<ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
									<li>Faça login com seu e-mail e senha</li>
									<li>Explore grupos de RPG</li>
									<li>Comece a jogar!</li>
								</ul>
							</div>

							<Button onClick={() => router.push("/login")} className="w-full">
								Ir para Login agora
							</Button>
						</>
					)}

					{status === "error" && (
						<>
							<Alert variant="destructive" className="animate-in slide-in-from-top-2">
								<XCircle className="h-4 w-4" />
								<AlertTitle>Erro</AlertTitle>
								<AlertDescription>{message}</AlertDescription>
							</Alert>

							<div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
								<p className="text-sm text-yellow-800 mb-2">
									<strong>Possíveis causas:</strong>
								</p>
								<ul className="text-sm text-yellow-700 space-y-1 ml-4 list-disc">
									<li>Link expirado (válido por 24 horas)</li>
									<li>Link já foi usado</li>
									<li>Token inválido</li>
								</ul>
							</div>

							<div className="flex flex-col gap-2 pt-2">
								<Button onClick={() => router.push("/resend-verification")} className="w-full">
									Reenviar E-mail de Verificação
								</Button>
								<Button
									onClick={() => router.push("/register")}
									variant="outline"
									className="w-full"
								>
									Criar nova conta
								</Button>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}