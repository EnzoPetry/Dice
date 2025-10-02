"use client"

import { useState, useEffect } from "react"
import GroupCard from "@/components/groupCard"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSession } from "@/hooks/useSession"

export default function HomePage() {
	const router = useRouter();
	const [group, setGroup] = useState([]);
	const { loading, isAuthenticated } = useSession();

	const fetchGroup = async () => {
		try {
			const res = await fetch(`/api/groups`);
			const data = await res.json();
			//debug
			console.log(data);
			setGroup(data);
		} catch (error) {
			console.error(error);
		}
	}
	useEffect(() => {
		if (!loading && !isAuthenticated) {
			router.push('/login');
			return;
		}

		if (isAuthenticated) {
			fetchGroup();
		}
	}, [isAuthenticated, loading, router]);

	function handleCreateGroup() {
		router.replace("/createGroup");
	}

	return (
		<div className="min-h-screen min-w-screen  p-8">
			<div className="mx-auto">
				<div className="flex justify-end mb-6">
					<Button onClick={handleCreateGroup} size="lg">
						Criar Novo Grupo
					</Button>
				</div>

				<div className="grid grid-cols-1 gap-4">
					{group.map((group) => (
						<GroupCard key={group.id} group={group} onJoinSuccess={fetchGroup} />
					))}
				</div>
			</div>
		</div>
	)
}