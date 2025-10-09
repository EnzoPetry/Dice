import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

//Listar Mensagens do Grupo
export async function GET(req, { params }) {
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
		const { groupId } = await params;
		const groupIdParam = parseInt(groupId);

		const messages = await prisma.message.findMany({
			take: -1000,
			where: {
				groupId: groupIdParam
			},
			include: {
				user: {
					select: {
						id: true,
						email: true,
						name: true,
						userGroups: {
							where: {
								groupId: groupIdParam
							},
							select: {
								role: true
							}
						}
					}
				}
			},
			orderBy: {
				createdAt: "asc"
			},
		});

		const formattedMessages = messages.map(msg => ({
			id: msg.id,
			message: msg.content,
			type: msg.user.userGroups[0]?.role || "common",
			sender: msg.userId,
			userName: msg.user.name || msg.user.email,
			sendAt: msg.sendAt,
		}));

		return new Response(
			JSON.stringify(formattedMessages),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
	} catch (error) {
		console.log(error);
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

//Criar Mensagem do Grupo
export async function POST(req, { params }) {
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

		const { content } = await req.json();
		const { groupId } = await params;
		const groupIdParam = parseInt(groupId);

		if (!content || content.trim() === "") {
			return new Response(
				JSON.stringify({
					error: "Message content is required",
				}),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		const group = await prisma.group.findUnique({
			where: {
				id: groupIdParam
			}
		})

		if (!group) {
			return new Response(
				JSON.stringify({
					error: "Group not found"
				}),
				{
					status: 404,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		const isMember = await prisma.userGroup.findFirst({
			where: {
				userId: session.user.id,
				groupId: groupIdParam,
			}
		});

		if (!isMember) {
			return new Response(
				JSON.stringify({
					error: "Forbidden - Not a member of this group"
				}),
				{
					status: 403,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		const message = await prisma.message.create({
			data: {
				content: content.trim(),
				userId: session.user.id,
				groupId: groupIdParam,
				sendAt: new Date(),
			},
			include: {
				user: {
					select: {
						id: true,
						email: true,
						name: true,
						userGroups: {
							where: {
								groupId: groupIdParam
							},
							select: {
								role: true
							}
						}
					}
				}
			},
		});

		const formattedMessage = {
			id: message.id,
			message: message.content,
			type: message.user.userGroups[0]?.role || "common",
			sender: message.userId,
			senderName: message.user.name,
			sendAt: message.sendAt,
		};

		return new Response(
			JSON.stringify(formattedMessage),
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