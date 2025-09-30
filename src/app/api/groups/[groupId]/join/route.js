import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
		const { groupId: groupIdParam } = await params;

		const group = await prisma.group.findUnique({
			where: { id: parseInt(groupIdParam) }
		});
		if (!group) {
			return new Response(
				JSON.stringify({ error: "Group not found" }),
				{
					status: 404,
				});
		}

		const alreadyMember = await prisma.userGroup.findFirst({
			where: {
				userId: session.user.id,
				groupId: groupId,
			}
		});
		if (alreadyMember) {
			return new Response(
				JSON.stringify({ error: "Already a member of this group" }),
				{
					status: 400,
				});
		}

		const userGroup = await prisma.userGroup.create({
			data: {
				userId: session.user.id,
				groupId: groupId,
				role: "common",
			}
		});

		return new Response(
			JSON.stringify(userGroup),
			{
				status: 201,
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

	} catch (error) {
		return new Response(JSON.stringify(
			{
				error: "Internal Server Error"
			}), { status: 500 }
		);
	}
}