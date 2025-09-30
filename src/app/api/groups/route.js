import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req) {
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

		const groups = await prisma.group.findMany({
			select: {
				id: true,
				name: true,
				description: true,
				createdAt: true,
				status: true,
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
				}
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return new Response(
			JSON.stringify(groups),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
	} catch (error) {
		console.log("Erro ao buscar grupos: ", error);
		return new Response(JSON.stringify(
			{
				error: "Internal Server Error"
			}), { status: 500 }
		);
	}
}

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

		const { name, description, rpgTypeId } = await req.json();

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
			where: { id: rpgTypeId }
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
		console.log("Erro ao criar grupo: ", error);
		return new Response(JSON.stringify(
			{
				error: "Internal Server Error"
			}), { status: 500 }
		);
	}
}