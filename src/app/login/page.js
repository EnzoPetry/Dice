"use client"

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, UserPlus, Eye, EyeOff, XCircle, CheckCircle2 } from "lucide-react";
import { loginSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function LoginPage() {
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [emailNotVerified, setEmailNotVerified] = useState(false);
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting }
	} = useForm({
		resolver: zodResolver(loginSchema),
		mode: "onSubmit",
		reValidateMode: "onChange",
		defaultValues: {
			email: "",
			password: ""
		}
	});

	const emailValue = watch("email");

	const onSubmit = async (data) => {
		setMessage("");
		setError("");
		setEmailNotVerified(false);

		try {
			const {
				data: authData,
				error: authError
			} = await authClient.signIn.email({
				email: data.email,
				password: data.password
			});
			if (authError) {
				const errorMessage = authError.message.toLowerCase();

				if (errorMessage.includes("email not verified") ||
					errorMessage.includes("e-mail não verificado") ||
					errorMessage.includes("not verified")) {
					setEmailNotVerified(true);
					await authClient.sendVerificationEmail({
						email: emailValue.toLowerCase(),
					});
					return;
				}

				setError(`Erro ao fazer login: ${authError.message}`);
				return;
			}
			if (authData) {
				setMessage("Login realizado com sucesso!");
				setTimeout(() => {
					router.push("/home");
				}, 2000);
			}
		} catch (err) {
			setError(`Erro ao fazer login: ${err.message}`);
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

						{emailNotVerified && (
							<>
								<Alert className="animate-in slide-in-from-top-2 bg-yellow-50 border-yellow-200">
									<AlertTitle className="text-yellow-800">
										E-mail não verificado
									</AlertTitle>
									<AlertDescription className="text-yellow-700 space-y-2">
										<p>Reenviamos um novo link de verificação para seu e-mail.</p>
										<p>Verifique sua caixa de entrada e clique no link para ativar sua conta.</p>
									</AlertDescription>
								</Alert>
							</>
						)}

						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
										<XCircle className="h-3 w-3" />
										{errors.email.message}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Senha</Label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder="••••••••"
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
										<XCircle className="h-3 w-3" />
										{errors.password.message}
									</p>
								)}
							</div>
							<Button
								type="submit"
								disabled={isSubmitting}
								className="w-full h-11 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
							>
								{isSubmitting ? (
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
							disabled={isSubmitting}
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
							disabled={isSubmitting}
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
