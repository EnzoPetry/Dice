import { auth } from "@/lib/auth";
import { updatePasswordSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

//Alterar senha do usuário
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

		const validation = updatePasswordSchema.safeParse(body);

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
		const { revoke, currentPassword, newPassword } = validation.data;

		try {
			await auth.api.changePassword({
				body: {
					currentPassword,
					newPassword,
					revokeOtherSessions: revoke ? true : false
				},
				headers: req.headers
			});

			return new Response(
				JSON.stringify({
					message: "Password updated successfully"
				}),
				{
					status: 200,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

		} catch (authError) {
			return new Response(
				JSON.stringify({
					error: authError.message || "Failed to update password"
				}),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}
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