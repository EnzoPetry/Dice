import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateUserSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

//Listar dados do usuário
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
		const user = await prisma.user.findUnique({
			where: {
				id: session.user.id
			},
			select: {
				name: true,
				email: true
			}
		});

		return new Response(
			JSON.stringify(user),
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

//Atualizar dados do usuário
export async function PUT(req) {
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
		const body = await req.json();

		const validation = updateUserSchema.safeParse(body);

		if (!validation.success) {
			return new Response(
				JSON.stringify({
					error: validation.error
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			)
		}

		const { name, email } = validation.data;

		const updatedUser = await prisma.user.update({
			where: {
				id: session.user.id
			},
			data: {
				name,
				email
			},
			select: {
				name: true,
				email: true
			}
		})

		return new Response(
			JSON.stringify(updatedUser),
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