"use client"
import React from 'react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users } from "lucide-react";
import Link from 'next/link';


export default function GroupCard({ group, onJoinSuccess }) {

	const handleJoinGroup = async () => {
		try {
			const res = await fetch(`/api/groups/${group.id}/join`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			})
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Failed to join group");
			}
			if (onJoinSuccess) {
				onJoinSuccess();
			}
		} catch (error) {
			throw new Error(error.message || "Failed to join group");
		}
	}

	return (
		<Card id={`grupo-${group.id}`}>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<Link href={`/group/${group.id}`}>
							<CardTitle className="text-2xl mb-2">{group.name}</CardTitle>
						</Link>						<CardDescription className="text-base">
							{group.description}
						</CardDescription>
					</div>
				</div>

				<Badge variant="secondary" className="w-fit mt-2">
					{group.rpgType.name}
				</Badge>
			</CardHeader>

			<CardContent>
				<div className="flex gap-6 mb-4">
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

				<Button
					className="w-full"
					size="lg"
					onClick={handleJoinGroup}
				>
					Entrar no Grupo
				</Button>
			</CardContent>
		</Card>
	);
}