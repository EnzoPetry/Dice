"use client"

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, Lock, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { passwordResetSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";

function ChangePasswordContent() {
	const [status, setStatus] = useState("validating");
	const [message, setMessage] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting }
	} = useForm({
		resolver: zodResolver(passwordResetSchema),
		mode: "onChange",
		defaultValues: {
			password: "",
			confirmPassword: ""
		}
	});

	const password = watch("password");
	const confirmPassword = watch("confirmPassword");

	useEffect(() => {
		if (!token) {
			setStatus("error");
			setMessage("Token de redefinição não encontrado na URL");
			return;
		}
		setStatus("validated");
	}, [token]);

	async function onSubmit(data) {
		try {
			const response = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					newPassword: data.password,
					token,
				}),
			});

			const responseData = await response.json();

			console.log(responseData);

			if (!response.ok || responseData.error) {
				throw new Error(responseData.error?.message || "Erro ao redefinir senha");
			}

			setStatus("success");
			setMessage("Senha atualizada com sucesso!");

		} catch (error) {
			setStatus("error");
			setMessage(error.message || "Erro ao redefinir senha");
			console.error("Erro na redefinição:", error);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
			<Card className="w-full max-w-md shadow-xl">
				<CardHeader className="text-center space-y-4">
					{status === "validating" && (
						<div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
							<Lock className="w-8 h-8 text-blue-600 animate-pulse" />
						</div>
					)}
					{status === "validated" && (
						<div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
							<Lock className="w-8 h-8 text-blue-600" />
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
						{status === "validating" && "Verificando link..."}
						{status === "validated" && "Crie sua nova senha"}
						{status === "success" && "Senha atualizada!"}
						{status === "error" && "Link inválido"}
					</CardTitle>
					<CardDescription>
						{status === "validating" && "Aguarde enquanto validamos seu link"}
						{status === "validated" && "Escolha uma senha forte para sua conta"}
						{status === "success" && "Você já pode fazer login com a nova senha"}
						{status === "error" && "Não foi possível validar o link de redefinição"}
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					{status === "validating" && (
						<div className="flex flex-col items-center justify-center py-8">
							<Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
							<p className="text-muted-foreground text-center">
								Verificando seu link de redefinição...
							</p>
						</div>
					)}

					{status === "validated" && (
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="password">Nova Senha</Label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder="Digite sua nova senha"
										disabled={isSubmitting}
										className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
										{...register("password")}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
										tabIndex={-1}
									>
										{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</button>
								</div>
								{errors.password && (
									<p className="text-xs text-destructive mt-1 flex items-center gap-1">
										<XCircle className="h-3 w-3" />{errors.password.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirme sua nova senha</Label>
								<div className="relative">
									<Input
										id="confirmPassword"
										type={showConfirmPassword ? "text" : "password"}
										placeholder="Digite a senha novamente"
										disabled={isSubmitting}
										className={`pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
										{...register("confirmPassword")}
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
										tabIndex={-1}
									>
										{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</button>
								</div>
								{errors.confirmPassword && (
									<p className="text-xs text-destructive mt-1 flex items-center gap-1">
										<XCircle className="h-3 w-3" />{errors.confirmPassword.message}
									</p>
								)}
								{confirmPassword && !errors.confirmPassword && password === confirmPassword && (
									<p className="text-xs text-green-600 mt-1 flex items-center gap-1">
										<CheckCircle2 className="h-3 w-3" />As senhas coincidem
									</p>
								)}
							</div>

							<Button
								type="submit"
								className="w-full h-11"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Atualizando...
									</>
								) : (
									"Atualizar Senha"
								)}
							</Button>
						</form>
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
									<li>Faça login com seu e-mail e nova senha</li>
									<li>Verifique suas configurações de segurança</li>
									<li>Continue explorando a plataforma</li>
								</ul>
							</div>

							<Button onClick={() => router.push("/login")} className="w-full">
								Ir para Login
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
								<Button onClick={() => router.push("/reset-password")} className="w-full">
									Solicitar novo link
								</Button>
								<Button
									onClick={() => router.push("/login")}
									variant="outline"
									className="w-full"
								>
									Voltar para Login
								</Button>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default function ChangePasswordPage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Carregando...</p>
				</div>
			</div>
		}>
			<ChangePasswordContent />
		</Suspense>
	);
}