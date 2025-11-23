import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
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

		if (!userGroup || userGroup.role !== "admin") {
			return new Response(
				JSON.stringify({
					error: "Forbidden - Only admins can view join requests"
				}),
				{
					status: 403,
					headers: {
						"Content-Type": "application/json"
					}
				}
			);
		}

		const joinRequests = await prisma.joinRequest.findMany({
			where: {
				groupId: groupIdParam,
				status: "pending"
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true
					}
				}
			},
			orderBy: {
				createdAt: "asc"
			}
		});

		return new Response(
			JSON.stringify(joinRequests),
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

export async function PATCH(req, { params }) {
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
		const { requestId, action } = await req.json();

		if (!requestId || !action) {
			return new Response(
				JSON.stringify({ error: "Missing requestId or action" }),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		if (action !== "approved" && action !== "rejected") {
			return new Response(
				JSON.stringify({ error: "Invalid action. Must be 'approved' or 'rejected'" }),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		const userGroup = await prisma.userGroup.findUnique({
			where: {
				userId_groupId: {
					userId: session.user.id,
					groupId: groupIdParam,
				}
			}
		});

		if (!userGroup || userGroup.role !== "admin") {
			return new Response(
				JSON.stringify({
					error: "Forbidden - Only admins can manage join requests"
				}),
				{
					status: 403,
					headers: {
						"Content-Type": "application/json"
					}
				}
			);
		}

		const joinRequest = await prisma.joinRequest.findUnique({
			where: {
				id: requestId
			}
		});

		if (!joinRequest) {
			return new Response(
				JSON.stringify({ error: "Join request not found" }),
				{
					status: 404,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		if (joinRequest.groupId !== groupIdParam) {
			return new Response(
				JSON.stringify({ error: "Join request does not belong to this group" }),
				{
					status: 403,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		if (joinRequest.status !== "pending") {
			return new Response(
				JSON.stringify({ error: "Join request is not pending" }),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		const updatedRequest = await prisma.joinRequest.update({
			where: {
				id: requestId
			},
			data: {
				status: action,
				updatedAt: new Date()
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
		});

		if (action === "approved") {
			await prisma.userGroup.create({
				data: {
					userId: joinRequest.userId,
					groupId: groupIdParam,
					role: "common"
				}
			});
		}

		return new Response(
			JSON.stringify({
				message: `Join request ${action} successfully`,
				request: updatedRequest
			}),
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