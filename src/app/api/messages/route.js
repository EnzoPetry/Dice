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

		const messages = await prisma.message.findMany({
			orderBy: {
				createdAt: "asc"
			},
			include: {
				user: {
					select: {
						email: true,
						name: true
					}
				}
			},
		});

		const formattedMessages = messages.map(msg => ({
			id: msg.id,
			message: msg.text,
			type: "user",
			userId: msg.userId,
			userName: msg.user.name || msg.user.email,
			createdAt: msg.createdAt,
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
		console.log("Erro ao buscar mensagens: ", error);
		return new Response(JSON.stringify(
			{
				error: "Internal Server Error"
			}), { status: 500 }
		);
	}
}