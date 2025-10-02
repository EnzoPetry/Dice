import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

		const group = await prisma.group.findUnique({
			where: { id: groupIdParam },
			select: {
				id: true,
				name: true,
				description: true,
				createdAt: true,
				status: true,
				rpgType: {
					select: {
						id: true,
						name: true,
						description: true,
					}
				},
				userGroups: {
					select: {
						role: true,
						user: {
							select: {
								name: true,
								email: true,
							}
						}
					}
				},
				_count: {
					select: {
						userGroups: true,
						messages: true,
					}
				}
			}
		});
		if (!group) {
			return new Response(
				JSON.stringify({ error: "Group not found" }),
				{
					status: 404,
				});
		}

		const response = {
			...group,
			members: group.userGroups.map(ug => ({
				userId: ug.user.id,
				name: ug.user.name,
				email: ug.user.email,
				role: ug.role,
			}))
		};
		return new Response(
			JSON.stringify(response),
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

export async function PUT(req, { params }) {
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
					error: "Forbidden - Only admins can update group"
				}),
				{
					status: 403,
					headers: {
						"Content-Type": "application/json"
					}
				}
			);
		}

		const { name, description, status } = await req.json();

		const updatedGroup = await prisma.group.update({
			where: { id: groupIdParam },
			data: {
				name: name ? name : undefined,
				description: description ? description : undefined,
				status: typeof status === "boolean" ? status : undefined,
			},
			include: {
				rpgType: true,
				_count: {
					select: {
						userGroups: true,
						messages: true,
					}
				}
			}
		});

		return new Response(
			JSON.stringify(updatedGroup),
			{
				status: 200,
				headers: { "Content-Type": "application/json", },
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

export async function DELETE(req, { params }) {
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
					error: "Forbidden - Only admins can update group"
				}),
				{
					status: 403,
					headers: {
						"Content-Type": "application/json"
					}
				}
			);
		}

		await prisma.group.delete({
			where: {
				id: groupIdParam
			}
		});

		return new Response({
			message: "Group deleted successfully"
		}), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		};
	} catch (error) {
		console.error("Error deleting group:", error);

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