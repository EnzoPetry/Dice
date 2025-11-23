"use client"

import { useState, useEffect, useMemo } from "react"
import GroupCard from "@/components/groupCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useSession } from "@/hooks/useSession"
import { Search, Filter, X, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function HomePage() {
	const router = useRouter();
	const [groups, setGroups] = useState([]);
	const [rpgTypes, setRpgTypes] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRpgType, setSelectedRpgType] = useState("all");
	const [isLoadingGroups, setIsLoadingGroups] = useState(true);
	const [isLoadingTypes, setIsLoadingTypes] = useState(true);
	const { loading, isAuthenticated } = useSession();

	const fetchGroups = async () => {
		setIsLoadingGroups(true);
		try {
			const res = await fetch(`/api/groups`);
			const data = await res.json();
			setGroups(data);
		} catch (error) {
			console.error("Erro ao buscar grupos:", error);
		} finally {
			setIsLoadingGroups(false);
		}
	}

	const fetchRpgTypes = async () => {
		setIsLoadingTypes(true);
		try {
			const res = await fetch("/api/rpg-types");
			const data = await res.json();
			setRpgTypes(data);
		} catch (error) {
			console.error("Erro ao buscar tipos de RPG:", error);
		} finally {
			setIsLoadingTypes(false);
		}
	}

	useEffect(() => {
		if (!loading && !isAuthenticated) {
			router.push("/login");
			return;
		}

		if (isAuthenticated) {
			fetchGroups();
			fetchRpgTypes();
		}
	}, [isAuthenticated, loading, router]);

	const filteredGroups = useMemo(() => {
		return groups.filter(group => {
			const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				group.description.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesRpgType = selectedRpgType === "all" ||
				group.rpgType?.id.toString() === selectedRpgType;

			return matchesSearch && matchesRpgType;
		});
	}, [groups, searchTerm, selectedRpgType]);

	const clearFilters = () => {
		setSearchTerm("");
		setSelectedRpgType("all");
	}

	const hasActiveFilters = searchTerm !== "" || selectedRpgType !== "all";

	function handleCreateGroup() {
		router.push("/createGroup");
	}

	if (loading || isLoadingGroups || isLoadingTypes) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
				<div className="text-center space-y-4">
					<Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" />
					<p className="text-muted-foreground text-lg">Carregando grupos...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8">
					<Card className="p-6 shadow-md">
						<div className="space-y-4">
							<div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
								<div className="flex flex-col lg:flex-row gap-4 items-center w-full lg:w-auto flex-1">
									<div className="relative w-full lg:w-auto lg:min-w-[400px]">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
										<Input
											type="text"
											placeholder="Buscar por nome ou descrição..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="pl-10 text-base"
										/>
									</div>

									<Select
										value={selectedRpgType}
										onValueChange={setSelectedRpgType}
									>
										<SelectTrigger className="text-base w-full lg:w-auto lg:min-w-[200px]">
											<div className="flex items-center gap-2">
												<Filter className="h-4 w-4" />
												<SelectValue placeholder="Filtrar por sistema" />
											</div>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">
												<span className="font-medium">Todos os Sistemas</span>
											</SelectItem>
											{rpgTypes.map((type) => (
												<SelectItem key={type.id} value={type.id.toString()}>
													{type.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{hasActiveFilters && (
										<Button
											variant="outline"
											onClick={clearFilters}
											className="px-6 w-full lg:w-auto whitespace-nowrap"
										>
											<X className="h-4 w-4 mr-2" />
											Limpar Filtros
										</Button>
									)}
								</div>
								<div className="w-full lg:w-auto">
									<Button
										onClick={handleCreateGroup}
										className="px-6 w-full lg:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap"
									>
										Criar Novo Grupo
									</Button>
								</div>
							</div>
							<div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
								<span className="font-medium text-foreground text-base">{filteredGroups.length}</span>
								<span>
									{filteredGroups.length === 1 ? "grupo encontrado" : "grupos encontrados"}
								</span>
								{hasActiveFilters && (
									<span className="text-purple-600 font-medium">• Filtros ativos</span>
								)}
							</div>
						</div>
					</Card>
				</div>
				{filteredGroups.length === 0 ? (
					<Card className="p-12 text-center">
						<div className="max-w-md mx-auto space-y-4">
							<div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
								<Search className="h-8 w-8 text-gray-400" />
							</div>
							<h3 className="text-xl font-semibold text-gray-900">
								Nenhum grupo encontrado
							</h3>
							<p className="text-muted-foreground">
								{hasActiveFilters
									? "Tente ajustar os filtros ou criar um novo grupo"
									: "Seja o primeiro a criar um grupo!"}
							</p>
							{hasActiveFilters ? (
								<Button variant="outline" onClick={clearFilters} className="mt-4">
									<X className="h-4 w-4 mr-2" />
									Limpar Filtros
								</Button>
							) : (
								<Button onClick={handleCreateGroup} className="mt-4">
									Criar Primeiro Grupo
								</Button>
							)}
						</div>
					</Card>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
						{filteredGroups.map((group) => (
							<div key={group.id} className="min-w-0">
								<GroupCard group={group} />
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}