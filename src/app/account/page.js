"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useSession } from "@/hooks/useSession"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateUserSchema, updatePasswordSchema } from "@/lib/validations"
import { Loader2, CheckCircle2, XCircle, Shield } from "lucide-react"

export default function AccountPage() {
	const router = useRouter();
	const [user, setUser] = useState(null);
	const [revokeOtherSessions, setRevokeOtherSessions] = useState(false);
	const [userMessage, setUserMessage] = useState("");
	const [userError, setUserError] = useState("");
	const [passwordMessage, setPasswordMessage] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const { loading, isAuthenticated } = useSession();

	const {
		register: registerUser,
		handleSubmit: handleSubmitUser,
		setValue: setValueUser,
		formState: { errors: errorsUser, isSubmitting: isSubmittingUser }
	} = useForm({
		resolver: zodResolver(updateUserSchema),
		mode: "onTouched",
		defaultValues: {
			name: "",
			email: ""
		}
	});

	const {
		register: registerPassword,
		handleSubmit: handleSubmitPassword,
		reset: resetPassword,
		formState: { errors: errorsPassword, isSubmitting: isSubmittingPassword }
	} = useForm({
		resolver: zodResolver(updatePasswordSchema),
		mode: "onTouched",
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmNewPassword: ""
		}
	});

	const fetchUserData = async () => {
		try {
			const res = await fetch(`/api/user`);
			const data = await res.json();

			if (data.error) {
				throw new Error(data.error);
			}

			console.log(data);
			setUser(data);
		} catch (error) {
			console.error(error);
			setUserError("Erro ao carregar dados do usuário");
		}
	}

	useEffect(() => {
		if (user) {
			setValueUser("name", user.name || "");
			setValueUser("email", user.email || "");
		}
	}, [user, setValueUser]);

	useEffect(() => {
		if (!loading && !isAuthenticated) {
			router.push('/login');
			return;
		}
		if (isAuthenticated) {
			fetchUserData();
		}
	}, [isAuthenticated, loading, router]);

	async function onSubmitUser(data) {
		setUserMessage("");
		setUserError("");

		try {
			const res = await fetch("/api/user", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					name: data.name,
					email: data.email
				}),
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Erro ao atualizar dados");
			}

			const updatedUser = await res.json();
			setUser({ ...user, ...updatedUser });
			setUserMessage("Dados atualizados com sucesso!");

			setTimeout(() => {
				setUserMessage("")
			}, 3000);
		} catch (error) {
			setUserError(error.message || "Erro ao atualizar dados");
		}
	}

	async function onSubmitPassword(data) {
		setPasswordMessage("");
		setPasswordError("");

		try {
			const res = await fetch("/api/user/password", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					currentPassword: data.currentPassword,
					newPassword: data.newPassword,
					confirmNewPassword: data.confirmNewPassword,
					revokeOtherSessions
				}),
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Erro ao atualizar senha");
			}

			setPasswordMessage("Senha atualizada com sucesso!");
			resetPassword();

			setTimeout(() => {
				setPasswordMessage("")
				if (revokeOtherSessions) {
					router.push('/login');
				}
				setRevokeOtherSessions(false);
			}, 3000);
		} catch (error) {
			setPasswordError(error.message || "Erro ao atualizar senha");
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
			<div className="max-w-4xl mx-auto space-y-6">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold">Minha Conta</h1>
						<p className="text-muted-foreground mt-1">
							Gerencie suas informações pessoais e configurações
						</p>
					</div>
					{!user?.canChangeEmail && (
						<Badge variant="secondary" className="gap-2">
							<Shield className="h-3 w-3" />
							Conta Google
						</Badge>
					)}
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Informações Pessoais</CardTitle>
						<CardDescription>
							Atualize seus dados pessoais
						</CardDescription>
					</CardHeader>
					<CardContent>
						{userError && (
							<Alert variant="destructive" className="mb-4 animate-in slide-in-from-top-2">
								<XCircle className="h-4 w-4" />
								<AlertTitle>Erro</AlertTitle>
								<AlertDescription>{userError}</AlertDescription>
							</Alert>
						)}
						{userMessage && (
							<Alert className="mb-4 bg-green-50 border-green-200 animate-in slide-in-from-top-2">
								<CheckCircle2 className="h-4 w-4 text-green-600" />
								<AlertTitle className="text-green-800">{userMessage}</AlertTitle>
							</Alert>
						)}

						<form onSubmit={handleSubmitUser(onSubmitUser)} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Nome</Label>
								<Input
									id="name"
									placeholder="Seu nome completo"
									{...registerUser("name")}
									disabled={isSubmittingUser}
									className={errorsUser.name ? "border-destructive" : ""}
								/>
								{errorsUser.name && (
									<p className="text-xs text-destructive flex items-center gap-1">
										<XCircle className="h-3 w-3" />
										{errorsUser.name.message}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">E-mail</Label>
								<Input
									id="email"
									type="email"
									placeholder="seu@email.com"
									{...registerUser("email")}
									disabled={user && !user?.canChangeEmail}
								/>
								{user && !user?.canChangeEmail && (
									<p className="text-xs text-muted-foreground">
										O e-mail está vinculado a uma conta Google e não pode ser alterado
									</p>
								)}
							</div>
							<Button
								type="submit"
								className="w-full sm:w-auto"
								disabled={isSubmittingUser}
							>
								{isSubmittingUser ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Salvando...
									</>
								) : (
									"Salvar Alterações"
								)}
							</Button>
						</form>
					</CardContent>
				</Card>

				{user && user?.canChangeEmail && (
					<Card>
						<CardHeader>
							<CardTitle>Alterar Senha</CardTitle>
							<CardDescription>
								Mantenha sua conta segura com uma senha forte
							</CardDescription>
						</CardHeader>
						<CardContent>
							{passwordError && (
								<Alert variant="destructive" className="mb-4 animate-in slide-in-from-top-2">
									<XCircle className="h-4 w-4" />
									<AlertTitle>Erro</AlertTitle>
									<AlertDescription>{passwordError}</AlertDescription>
								</Alert>
							)}
							{passwordMessage && (
								<Alert className="mb-4 bg-green-50 border-green-200 animate-in slide-in-from-top-2">
									<CheckCircle2 className="h-4 w-4 text-green-600" />
									<AlertTitle className="text-green-800">{passwordMessage}</AlertTitle>
								</Alert>
							)}

							<form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="space-y-2">
										<Label htmlFor="currentPassword">Senha Atual</Label>
										<Input
											id="currentPassword"
											type="password"
											placeholder="••••••••"
											{...registerPassword("currentPassword")}
											disabled={isSubmittingPassword}
											className={errorsPassword.currentPassword ? "border-destructive" : ""}
										/>
										{errorsPassword.currentPassword && (
											<p className="text-xs text-destructive flex items-center gap-1">
												<XCircle className="h-3 w-3" />
												{errorsPassword.currentPassword.message}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="newPassword">Nova Senha</Label>
										<Input
											id="newPassword"
											type="password"
											placeholder="••••••••"
											{...registerPassword("newPassword")}
											disabled={isSubmittingPassword}
											className={errorsPassword.newPassword ? "border-destructive" : ""}
										/>
										{errorsPassword.newPassword && (
											<p className="text-xs text-destructive flex items-center gap-1">
												<XCircle className="h-3 w-3" />
												{errorsPassword.newPassword.message}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
										<Input
											id="confirmNewPassword"
											type="password"
											placeholder="••••••••"
											{...registerPassword("confirmNewPassword")}
											disabled={isSubmittingPassword}
											className={errorsPassword.confirmNewPassword ? "border-destructive" : ""}
										/>
										{errorsPassword.confirmNewPassword && (
											<p className="text-xs text-destructive flex items-center gap-1">
												<XCircle className="h-3 w-3" />
												{errorsPassword.confirmNewPassword.message}
											</p>
										)}
									</div>
								</div>
								<div className="flex items-center space-x-2">
									<input
										type="checkbox"
										id="revokeOtherSessions"
										checked={revokeOtherSessions}
										onChange={(e) => setRevokeOtherSessions(e.target.checked)}
										className="h-4 w-4 rounded border-gray-300 cursor-pointer"
										disabled={isSubmittingPassword}
									/>
									<Label htmlFor="revokeOtherSessions" className="text-sm font-normal cursor-pointer">
										Desconectar de todos os dispositivos
									</Label>
								</div>
								<Button
									type="submit"
									className="w-full sm:w-auto"
									disabled={isSubmittingPassword}
								>
									{isSubmittingPassword ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Alterando...
										</>
									) : (
										"Alterar Senha"
									)}
								</Button>
							</form>
						</CardContent>
					</Card>
				)}

				{user && !user?.canChangeEmail && (
					<Alert>
						<Shield className="h-4 w-4" />
						<AlertTitle>Conta vinculada ao Google</AlertTitle>
						<AlertDescription>
							Você está usando login com Google. Não é necessário definir uma senha.
						</AlertDescription>
					</Alert>
				)}
			</div>
		</div>
	)
}