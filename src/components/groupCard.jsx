"use client"
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, ArrowRight, Calendar } from "lucide-react";
import Link from 'next/link';


export default function GroupCard({ group }) {
	const { userStatus } = group;
	const isMember = userStatus?.isMember || false;
	const isPending = userStatus?.isPending || false;
	const isRejected = userStatus?.isRejected || false;

	const getMembershipBadge = () => {
		if (isMember) {
			return (
				<Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-sm">
					<CheckCircle2 className="w-3 h-3 mr-1" />
					Membro
				</Badge>
			);
		}

		if (isPending) {
			return (
				<Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">
					<Clock className="w-3 h-3 mr-1" />
					Aguardando
				</Badge>
			);
		}

		if (isRejected) {
			return (
				<Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100">
					<XCircle className="w-3 h-3 mr-1" />
					Rejeitado
				</Badge>
			);
		}

		return null;
	};

	// Formatar data de criação
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now - date);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return "Hoje";
		if (diffDays === 1) return "Ontem";
		if (diffDays < 7) return `${diffDays} dias atrás`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
		if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
		return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' });
	};

	return (
		<Card
			id={`grupo-${group.id}`}
			className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary/20 bg-gradient-to-br from-white to-gray-50/50"
		>
			{/* Gradiente decorativo no topo */}
			<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />


			<CardHeader className="block space-y-4 pb-4">
				{/* Status Badge flutuante */}
				{getMembershipBadge() && (
					<div className="flex m-0 justify-end">
						{getMembershipBadge()}
					</div>
				)}
				<Link href={`/group/${group.id}`}>
					<CardTitle className="text-2xl font-bold mb-2 hover:text-primary transition-colors cursor-pointer break-words line-clamp-2">
						{group.name}
					</CardTitle>
				</Link>

				{/* Badge do tipo de RPG com estilo melhorado */}
				<div className="flex items-center gap-2 mt-3">
					<Badge variant="secondary" className="bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border-purple-200 font-semibold">
						{group.rpgType.name}
					</Badge>
					{group.createdAt && (
						<span className="text-xs text-muted-foreground flex items-center gap-1">
							<Calendar className="w-3 h-3" />
							{formatDate(group.createdAt)}
						</span>
					)}
				</div>

				{/* Estatísticas com ícones melhorados */}
				<div className="flex gap-4 pt-2">
					<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50/50 border border-blue-100 transition-colors group-hover:bg-blue-100/50">
						<span className="text-xs text-blue-600/70 font-medium">Membros {group._count.userGroups}</span>
					</div>
					<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50/50 border border-emerald-100 transition-colors group-hover:bg-emerald-100/50">
						<span className="text-xs text-emerald-600/70 font-medium">Mensagens {group._count.messages}</span>
					</div>
				</div>
			</CardHeader>

			<CardContent className="block space-y-4 pt-0">
				{/* Descrição com melhor tipografia */}
				<CardDescription className="block text-sm break-words line-clamp-3 leading-relaxed text-gray-600">
					{group.description}
				</CardDescription>

				{/* Botão de ação com animação */}
				<Link href={`/group/${group.id}`} className="block">
					<Button
						className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 group/btn"
						size="lg"
					>
						<span className="flex items-center justify-center gap-2">
							Ver Grupo
							<ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
						</span>
					</Button>
				</Link>

				{/* Indicadores de status adicionais */}
				{group.requiresApproval && !isMember && (
					<div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
						<Clock className="w-3 h-3" />
						<span>Grupo requer aprovação para entrar</span>
					</div>
				)}
			</CardContent>

			{/* Brilho decorativo no hover */}
			<div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5" />
		</Card>
	);
}