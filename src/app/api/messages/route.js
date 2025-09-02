import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

exports.dynamic = "force-dynamic";

exports.GET = async function (req) {

	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	}

	const messages = await prisma.message.findMany({
		orderBy: { createdAt: "asc" },
		include: { user: { select: { email: true, name: true } } },
	});

	return new Response(JSON.stringify(messages.map(msg => ({
		message: msg.text,
		type: "user",
		userId: msg.userId,
		userName: msg.user.name || msg.user.email,
	}))), { status: 200 });
}