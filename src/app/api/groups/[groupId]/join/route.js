import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { email } from "zod";

export const dynamic = "force-dynamic";

//Entrar no Grupo
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

		const group = await prisma.group.findUnique({
			where: { id: groupIdParam }
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
				groupId: groupIdParam,
			}
		});
		if (alreadyMember) {
			return new Response(
				JSON.stringify({ error: "Already a member of this group" }),
				{
					status: 400,
				});
		}

		const existingRequest = await prisma.joinRequest.findUnique({
			where: {
				userId_groupId: {
					userId: session.user.id,
					groupId: groupIdParam,
				}
			}
		});

		if (existingRequest) {
			if (existingRequest.status === "pending") {
				return new Response(
					JSON.stringify({
						error: "Join request already pending",
						requestId: existingRequest.id,
						status: existingRequest.status
					}),
					{
						status: 400,
					});
			} else if (existingRequest.status === "rejected") {
				const updatedRequest = await prisma.joinRequest.update({
					where: { id: existingRequest.id },
					data: {
						status: "pending",
						updatedAt: new Date()
					}
				});

				return new Response(
					JSON.stringify({
						message: "Join request resubmitted",
						requestId: updatedRequest.id,
						requiresApproval: true
					}),
					{
						status: 200,
						headers: {
							"Content-Type": "application/json",
						},
					}
				);
			}
		}

		if (group.requiresApproval) {
			const joinRequest = await prisma.joinRequest.create({
				data: {
					userId: session.user.id,
					groupId: groupIdParam,
					status: "pending",
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true
						}
					}
				}
			})

			return new Response(
				JSON.stringify({
					message: "Join request submitted and pending approval",
					requestId: joinRequest.id,
					requiresApproval: true
				}),
				{
					status: 201,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		const userGroup = await prisma.userGroup.create({
			data: {
				userId: session.user.id,
				groupId: groupIdParam,
				role: "common",
			}
		});

		return new Response(
			JSON.stringify({
				...userGroup,
				requiresApproval: false
			}),
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