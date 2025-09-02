import { initSocket } from "@/lib/socketio";

export const dynamic = "force-dynamic";

export async function GET(req) {
	const server = req.nextUrl.server;

	initSocket(server);

	return new Response(null, { status: 200 });
}