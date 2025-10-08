"use client"

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { registerSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { XCircle, CheckCircle2, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";

export default function RegisterPage() {
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		formState: {
			errors,
			isSubmitting,
			touchedFields
		}
	} = useForm({
		resolver: zodResolver(registerSchema),
		mode: "onChange",
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: ""
		}
	});

	const password = watch("password");
	const confirmPassword = watch("confirmPassword");

	const onSubmit = async (data) => {
		setMessage("");
		setError("");
		try {
			const {
				data: authData,
				error: authError
			} = await authClient.signUp.email({
				name: data.name,
				email: data.email,
				password: data.password
			});
			if (authError) {
				setError(`Erro ao realizar o cadastro: ${error.message}`);
				return;
			}
			if (authData) {
				setMessage("Cadastro realizado com sucesso!");
				setTimeout(() => {
					router.push("/login");
				}, 2000);
			}
		} catch (err) {
			setError(`Erro no cadastro: ${err.message}`);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">Project Dice</h1>
					<p className="text-muted-foreground">
						Crie sua conta e comece a jogar
					</p>
				</div>
				<Card className="shadow-xl">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl font-bold text-center">Cadastro</CardTitle>
						<CardDescription className="text-center">
							Preencha seus dados para criar uma conta
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleSubmit(onSubmit)}>
						<CardContent className="space-y-4">
							{error && (
								<Alert variant="destructive" className="animate-in slide-in-from-top-2">
									<XCircle className="h-4 w-4" />
									<AlertTitle>Erro</AlertTitle>
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
							{message && !error && (
								<Alert className="bg-green-50 border-green-200 animate-in slide-in-from-top-2">
									<CheckCircle2 className="h-4 w-4 text-green-600" />
									<AlertTitle className="text-green-800">{message}</AlertTitle>
								</Alert>
							)}
							<div className="space-y-2">
								<Label htmlFor="name">Nome Completo</Label>
								<Input
									id="name"
									type="text"
									placeholder="Digite seu nome completo"
									disabled={isSubmitting}
									className={errors.name ? "border-destructive" : ""}
									{...register("name")}
								/>
								{errors.name && (
									<p className="text-xs text-destructive mt-1 flex items-center gap-1">
										<XCircle className="h-3 w-3" />{errors.name.message}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">E-mail</Label>
								<Input
									id="email"
									type="email"
									placeholder="seu@email.com"
									disabled={isSubmitting}
									className={errors.email ? "border-destructive" : ""}
									{...register("email")}
								/>
								{errors.email && (
									<p className="text-xs text-destructive mt-1 flex items-center gap-1">
										<XCircle className="h-3 w-3" />{errors.email.message}</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Senha</Label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder="Crie uma senha forte"
										disabled={isSubmitting}
										className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
										{...register("password")}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
										disabled={isSubmitting}
										tabIndex={-1}
									>
										{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</button>
								</div>
								{errors.password && (
									<p className="text-xs text-destructive mt-1 flex items-center gap-1">
										<XCircle className="h-3 w-3" />{errors.password.message}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirmar Senha</Label>
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
										disabled={isSubmitting}
										tabIndex={-1}
									>
										{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</button>
								</div>
								{errors.confirmPassword && (
									<p className="text-xs text-destructive mt-1 flex items-center gap-1">
										<XCircle className="h-3 w-3" />{errors.confirmPassword.message}</p>
								)}
								{confirmPassword && !errors.confirmPassword && password === confirmPassword && touchedFields.confirmPassword && (
									<p className="text-xs text-green-600 mt-1 flex items-center gap-1">
										<CheckCircle2 className="h-3 w-3" />
										As senhas coincidem
									</p>
								)}
							</div>

							<Button
								type="submit"
								disabled={isSubmitting}
								className="w-full h-11 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl mt-4"
							>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-5 w-5 animate-spin" />
										Criando conta...
									</>
								) : (
									<>
										<UserPlus className="mr-2 h-5 w-5" />
										Criar Conta
									</>
								)}
							</Button>
						</CardContent>
					</form>
				</Card>
			</div>
		</div>
	);
};