import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

//Listar Grupos
export async function GET(req) {
	try {
		const session = await auth.api.getSession({ headers: req.headers });
		if (!session) {
			return new Response(
				JSON.stringify({
					error: "Unauthorized"
				}),
				{
					status: 401,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		const groups = await prisma.group.findMany({
			select: {
				id: true,
				name: true,
				description: true,
				createdAt: true,
				status: true,
				requiresApproval: true,
				rpgType: {
					select: {
						id: true,
						name: true
					}
				},
				_count: {
					select: {
						userGroups: true,
						messages: true
					}
				},
				userGroups: {
					where: {
						userId: session.user.id
					},
					select: {
						userId: true,
						role: true
					}
				},
				joinRequests: {
					where: {
						userId: session.user.id
					},
					select: {
						id: true,
						status: true,
						createdAt: true
					}
				}
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		const groupsWithUserStatus = groups.map(group => {
			const userGroup = group.userGroups[0];
			const joinRequest = group.joinRequests[0];

			return {
				id: group.id,
				name: group.name,
				description: group.description,
				createdAt: group.createdAt,
				status: group.status,
				requiresApproval: group.requiresApproval,
				rpgType: group.rpgType,
				_count: group._count,
				userStatus: {
					isMember: !!userGroup,
					isPending: !!joinRequest && joinRequest.status === 'pending',
					isRejected: !!joinRequest && joinRequest.status === 'rejected',
					isApproved: !!joinRequest && joinRequest.status === 'approved',
					role: userGroup?.role || null,
					requestId: joinRequest?.id || null,
					requestedAt: joinRequest?.createdAt || null
				}
			};
		});

		return new Response(
			JSON.stringify(groupsWithUserStatus),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: error.message || "Internal Server Error",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

//Criar Grupo
export async function POST(req) {
	try {
		const session = await auth.api.getSession({ headers: req.headers });
		if (!session) {
			return new Response(
				JSON.stringify({ error: "Unauthorized" }),
				{
					status: 401,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		const { name, description, rpgTypeId, requiresApproval } = await req.json();

		if (!name || !description || !rpgTypeId) {
			return new Response(
				JSON.stringify({ error: "Missing required fields" }),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}
		const rpgType = await prisma.rpgType.findUnique({
			where: { id: parseInt(rpgTypeId) }
		});
		if (!rpgType) {
			return new Response(
				JSON.stringify({ error: "Invalid RPG type" }),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		const newGroup = await prisma.group.create({
			data: {
				name,
				description,
				createdAt: new Date(),
				status: true,
				requiresApproval: requiresApproval || false,
				rpgTypeId: rpgType.id
			},
			include: {
				rpgType: true,
				_count: {
					select: {
						userGroups: true,
						messages: true
					}
				}
			}
		});

		await prisma.userGroup.create({
			data: {
				userId: session.user.id,
				groupId: newGroup.id,
				role: "admin"
			}
		});

		return new Response(
			JSON.stringify(newGroup),
			{
				status: 201,
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: error.message || "Internal Server Error",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}