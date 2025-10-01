"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react"

export default function CreateGroupPage() {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [rpgTypeId, setRpgTypeId] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [types, setTypes] = useState([]);

	useEffect(() => {
		async function fetchRpgTypes() {
			try {
				const res = await fetch("/api/rpg-types");
				const data = await res.json();
				//debug
				console.log(data);
				setTypes(data);
			} catch (error) {
				console.error("Erro ao buscar tipos de RPG:", error);
			}
		}
		fetchRpgTypes();
	}, [])

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		setSuccess(false);
		try {
			const res = await fetch("/api/groups", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name,
					description,
					rpgTypeId: parseInt(rpgTypeId),
				}),
			});
			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || "Erro ao criar grupo");
			}
			setSuccess(true);
			setTimeout(() => {
				router.replace("/home");
			}, 2000);
		} catch (error) {
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen p-8">
			<div className="max-w-2xl mx-auto">
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl">Criar Novo Grupo</CardTitle>
						<CardDescription>
							Preencha os detalhes abaixo para criar um novo grupo de RPG.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{error && (
							<Alert variant="destructive" className="mb-4">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						{success && (
							<Alert className="mb-4 bg-green-50 border-green-200">
								<AlertDescription className="text-green-800">
									Grupo criado com sucesso! Redirecionando...
								</AlertDescription>
							</Alert>
						)}

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Nome do Grupo</Label>
								<Input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Digite o nome do grupo"
									required
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Descrição</Label>
								<Textarea
									id="description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Digite a descrição do grupo"
									required
									disabled={isLoading}
									rows={4}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="rpgType">Tipo de RPG</Label>
								<Select
									value={rpgTypeId}
									onValueChange={setRpgTypeId}
									disabled={isLoading}
									required
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Selecione o tipo de RPG" />
									</SelectTrigger>
									<SelectContent>
										{types.map((type) => (
											<SelectItem key={type.id} value={type.id.toString()}>
												{type.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<Button
								type="submit"
								className="w-full"
								size="lg"
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Criando...
									</>
								) : (
									"Criar Grupo"
								)}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}