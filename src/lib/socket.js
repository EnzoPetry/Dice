import { Server } from "socket.io";
import { prisma } from "./prisma.js";
import { auth } from "./auth.js";

export function initSocket(server) {
	let io = new Server(server, {
		cors: {
			origin: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
		},
	});

	io.on("connection", async (socket) => {
		const session = await auth.api.getSession({ headers: socket.request.headers });
		if (!session) {
			socket.disconnect();
			return;
		}

		socket.on("message", async (data) => {
			if (!data.msg) return;

			const message = await prisma.message.create({
				data: {
					text: data.msg,
					userId: session.user.id,
				},
				include: { user: { select: { name: true, email: true } } },
			});

			io.emit("message", {
				id: message.id,
				text: message.text,
				sender: message.userId,
				senderName: message.user.name || message.user.email,
				type: "user",
			});
		});
	});
	return io;
}
