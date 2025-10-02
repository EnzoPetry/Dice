import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

//Sair do Grupo
export async function POST(req, { params }) {
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
		const { groupId } = await params;
		const groupIdParam = parseInt(groupId);

		const userGroup = await prisma.userGroup.findUnique({
			where: {
				userId_groupId: {
					userId: session.user.id,
					groupId: groupIdParam,
				}
			}
		});

		if (!userGroup) {
			return new Response(
				JSON.stringify({
					error: "User not in this group"
				}),
				{
					status: 404,
					headers: {
						"Content-Type": "application/json"
					},
				}
			);
		}

		const adminCount = await prisma.userGroup.count({
			where: {
				groupId: groupIdParam,
				role: "admin"
			}
		})

		if (adminCount && adminCount <= 1) {
			JSON.stringify({
				error: "Forbidden - Last admin cannot exit the group"
			}), {
				status: 403,
				headers: {
					"Content-Type": "application/json"
				},
			}
		}

		await prisma.userGroup.delete({
			where: {
				userId_groupId: {
					userId: session.user.id,
					groupId: groupIdParam,
				}
			}
		});

		return new Response(
			JSON.stringify({
				message: "User exited the group successfully"
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
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