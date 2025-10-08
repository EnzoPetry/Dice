"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Plus, ArrowLeft, CheckCircle2, XCircle, Gamepad2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGroupSchema } from "@/lib/validations";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";

export default function CreateGroupPage() {
	const [rpgTypes, setRpgTypes] = useState([]);
	const [isLoadingTypes, setIsLoadingTypes] = useState(true);
	const [submitError, setSubmitError] = useState("");
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const router = useRouter();
	const { loading, isAuthenticated } = useSession();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isSubmitting }
	} = useForm({
		resolver: zodResolver(createGroupSchema),
		mode: "onTouched",
		defaultValues: {
			name: "",
			description: "",
			rpgTypeId: ""
		}
	});

	const selectedRpgTypeId = watch("rpgTypeId");
	const name = watch("name");
	const description = watch("description");

	useEffect(() => {
		async function fetchRpgTypes() {
			try {
				const res = await fetch("/api/rpg-types");
				if (!res.ok) throw new Error("Erro ao buscar tipos de RPG");

				const data = await res.json();
				setRpgTypes(data);
			} catch (error) {
				console.error("Erro ao buscar tipos de RPG:", error);
				setSubmitError("Erro ao carregar tipos de RPG. Tente recarregar a página.");
			} finally {
				setIsLoadingTypes(false);
			}
		}

		if (isAuthenticated) {
			fetchRpgTypes();
		}
	}, [isAuthenticated]);

	useEffect(() => {
		if (!loading && !isAuthenticated) {
			router.push("/login");
		}
	}, [loading, isAuthenticated, router]);

	async function onSubmit(data) {
		setSubmitError("");
		setSubmitSuccess(false);

		try {
			const res = await fetch("/api/groups", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: data.name,
					description: data.description,
					rpgTypeId: parseInt(data.rpgTypeId),
				}),
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Erro ao criar grupo");
			}

			const groupData = await res.json();
			setSubmitSuccess(true);

			setTimeout(() => {
				router.push(`/group/${groupData.id}`);
			}, 2000);
		} catch (error) {
			setSubmitError(error.message);
		}
	}

	const nameCharCount = name?.length || 0;
	const descriptionCharCount = description?.length || 0;

	if (loading || isLoadingTypes) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
					<p className="text-muted-foreground">Carregando...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
			<div className="max-w-2xl mx-auto">
				<Button
					variant="ghost"
					onClick={() => router.push("/home")}
					className="mb-6 hover:bg-white/50"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Voltar para Home
				</Button>

				<Card className="shadow-xl">
					<CardHeader className="space-y-1">
						<div className="flex items-center gap-3">
							<div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
								<Gamepad2 className="h-6 w-6 text-white" />
							</div>
							<div>
								<CardTitle className="text-3xl">Criar Novo Grupo</CardTitle>
								<CardDescription className="text-base mt-1">
									Preencha os detalhes para criar um grupo de RPG
								</CardDescription>
							</div>
						</div>
					</CardHeader>

					<CardContent>
						{submitError && (
							<Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2">
								<XCircle className="h-4 w-4" />
								<AlertTitle>Erro ao criar grupo</AlertTitle>
								<AlertDescription>{submitError}</AlertDescription>
							</Alert>
						)}

						{submitSuccess && (
							<Alert className="mb-6 bg-green-50 border-green-200 animate-in slide-in-from-top-2">
								<CheckCircle2 className="h-4 w-4 text-green-600" />
								<AlertTitle className="text-green-800">Grupo criado com sucesso!</AlertTitle>
								<AlertDescription className="text-green-700">
									Redirecionando para o grupo...
								</AlertDescription>
							</Alert>
						)}

						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name" className="text-base font-semibold">Nome do Grupo</Label>
								<Input
									id="name"
									{...register("name")}
									placeholder="Ex: Aventuras em Waterdeep"
									disabled={isSubmitting || submitSuccess}
									className={errors.name ? "border-destructive" : ""}
								/>
								<div className="flex items-center justify-between">
									{errors.name && (
										<p className="text-xs text-destructive flex items-center gap-1">
											<XCircle className="h-3 w-3" />
											{errors.name.message}
										</p>
									)}
									<p className={`text-xs ml-auto ${nameCharCount > 100 ? "text-destructive" : "text-muted-foreground"}`}>
										{nameCharCount}/100 caracteres
									</p>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description" className="text-base font-semibold">Descrição</Label>
								<Textarea
									id="description"
									{...register("description")}
									placeholder="Descreva o grupo, estilo de jogo, horários, nível de experiência esperado..."
									disabled={isSubmitting || submitSuccess}
									rows={5}
									className={errors.description ? "border-destructive" : ""}
								/>
								<div className="flex items-center justify-between">
									{errors.description && (
										<p className="text-xs text-destructive flex items-center gap-1">
											<XCircle className="h-3 w-3" />
											{errors.description.message}
										</p>
									)}
									<p className={`text-xs ml-auto ${descriptionCharCount > 500 ? "text-destructive" : "text-muted-foreground"}`}>
										{descriptionCharCount}/500 caracteres
									</p>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="rpgType" className="text-base font-semibold">Tipo de RPG</Label>
								<Select
									value={selectedRpgTypeId}
									onValueChange={(value) => setValue("rpgTypeId", value, { shouldValidate: true, shouldDirty: true })}
									disabled={isSubmitting || submitSuccess || rpgTypes.length === 0}
								>
									<SelectTrigger
										className={`w-full ${errors.rpgTypeId ? "border-destructive" : ""}`}
										id="rpgType"
									>
										<SelectValue placeholder="Selecione o sistema de RPG" />
									</SelectTrigger>
									<SelectContent>
										{rpgTypes.length === 0 ? (
											<SelectItem value="none" disabled>Nenhum tipo disponível</SelectItem>
										) : (
											rpgTypes.map((type) => (
												<SelectItem key={type.id} value={type.id.toString()}>
													<div className="flex flex-col">
														<span className="font-medium">{type.name}</span>
													</div>
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
								{errors.rpgTypeId && (
									<p className="text-xs text-destructive flex items-center gap-1">
										<XCircle className="h-3 w-3" />
										{errors.rpgTypeId.message}
									</p>
								)}
							</div>

							<div className="flex gap-3 pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => router.push("/home")}
									disabled={isSubmitting || submitSuccess}
									className="flex-1"
								>
									Cancelar
								</Button>
								<Button
									type="submit"
									disabled={isSubmitting || submitSuccess}
									className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
								>
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Criando...
										</>
									) : submitSuccess ? (
										<>
											<CheckCircle2 className="mr-2 h-4 w-4" />
											Criado!
										</>
									) : (
										<>
											<Plus className="mr-2 h-4 w-4" />
											Criar Grupo
										</>
									)}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}