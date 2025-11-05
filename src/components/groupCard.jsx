"use client"
import React from 'react';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Clock, UserPlus, CheckCircle2 } from "lucide-react";
import Link from 'next/link';


export default function GroupCard({ group, onJoinSuccess }) {

	const [joinStatus, setJoinStatus] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	// Estado inicial baseado no userStatus do backend
	const { userStatus } = group;
	const isMember = userStatus?.isMember || false;
	const isPending = userStatus?.isPending || false;
	const isRejected = userStatus?.isRejected || false;

	const handleJoinGroup = async () => {
		setIsLoading(true);
		setJoinStatus(null);

		try {
			const res = await fetch(`/api/groups/${group.id}/join`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			})
			const data = await res.json();

			if (!res.ok) {
				if (data.error === "Already a member of this group") {
					setJoinStatus({
						type: "info",
						message: "Você já é membro deste grupo!"
					});
					if (onJoinSuccess) {
						onJoinSuccess();
					}
					return;
				}

				if (data.error === "Join request already pending") {
					setJoinStatus({
						type: "pending",
						message: "Você já tem uma solicitação pendente para este grupo."
					});
					return;
				}

				throw new Error(data.error || "Failed to join group");
			}

			if (data.requiresApproval) {
				setJoinStatus({
					type: "pending",
					message: "Solicitação enviada! Aguarde a aprovação do administrador."
				});
			} else {
				setJoinStatus({
					type: "success",
					message: "Você entrou no grupo!"
				});
			}

			if (onJoinSuccess) {
				onJoinSuccess();
			}
		} catch (error) {
			setJoinStatus({
				type: "error",
				message: error.message || "Erro ao entrar no grupo"
			});
		} finally {
			setIsLoading(false);
		}
	}

	const getButtonConfig = () => {
		if (isMember) {
			return {
				text: "Membro do Grupo",
				icon: <CheckCircle2 className="mr-2 h-4 w-4" />,
				disabled: true,
				variant: "outline",
				className: "border-green-200 text-green-700"
			};
		}

		if (isPending || joinStatus?.type === "pending") {
			return {
				text: "Aguardando Aprovação",
				icon: <Clock className="mr-2 h-4 w-4" />,
				disabled: true,
				variant: "outline",
				className: "border-yellow-200 text-yellow-700"
			};
		}

		if (isRejected) {
			return {
				text: "Solicitar Novamente",
				icon: null,
				disabled: true,
				variant: "default",
				className: "border-red-200 text-red-700"
			};
		}

		if (joinStatus?.type === "success") {
			return {
				text: "Entrou no Grupo!",
				icon: <CheckCircle2 className="mr-2 h-4 w-4" />,
				disabled: true,
				variant: "outline",
				className: "border-green-200 text-green-700"
			};
		}

		return {
			text: "Entrar no Grupo",
			icon: null,
			disabled: false,
			variant: "default",
			className: ""
		};
	};

	const buttonConfig = getButtonConfig();

	return (
		<Card id={`grupo-${group.id}`} className="flex flex-col h-[400px]" >
			<CardHeader>
				<Link href={`/group/${group.id}`}>
					<CardTitle className="text-2xl mb-2 hover:text-primary transition-colors break-all whitespace-normal  line-clamp-2">
						{group.name}
					</CardTitle>
				</Link>
				<div className="space-y-4">
					<Badge variant="secondary" className="w-fit">
						{group.rpgType.name}
					</Badge>
					<div className="flex gap-6">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Users className="w-4 h-4 text-blue-500" />
							<span className="font-medium text-foreground">{group._count.userGroups}</span>
							<span>membros</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<MessageSquare className="w-4 h-4 text-green-500" />
							<span className="font-medium text-foreground">{group._count.messages}</span>
							<span>mensagens</span>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex-1 flex flex-col justify-between space-y-4">
				<CardDescription className="text-base break-all whitespace-normal line-clamp-4">
					{group.description}
				</CardDescription>
				<div className='flex gap-8'>
					<Button
						className={`flex-1 ${buttonConfig.className}`}
						size="lg"
						variant={buttonConfig.variant}
						onClick={handleJoinGroup}
						disabled={isLoading || buttonConfig.disabled}
					>
						{isLoading ? (
							<>
								<Clock className="mr-2 h-4 w-4 animate-spin" />
								Processando...
							</>
						) : (
							<>
								{buttonConfig.icon}
								{buttonConfig.text}
							</>
						)}
					</Button>
					<Button
						className={`flex-2 ${buttonConfig.className}`}
						size="lg"
						variant={buttonConfig.variant}
						onClick={handleJoinGroup}
						disabled={isLoading || buttonConfig.disabled}
					>
						{isLoading ? (
							<>
								<Clock className="mr-2 h-4 w-4 animate-spin" />
								Processando...
							</>
						) : (
							<>
								{buttonConfig.icon}
								{buttonConfig.text}
							</>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}