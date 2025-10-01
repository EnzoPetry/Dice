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

		const types = await prisma.rpgType.findMany({
			select: {
				id: true,
				name: true,
				description: true,
			},
			orderBy: {
				id: "asc",
			},
		});

		return new Response(
			JSON.stringify(types),
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
				error: error.message || "Internal Server Error"
			}), { status: 500 }
		);
	}
}
