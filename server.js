import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { auth } from "./src/lib/auth.js";
import { setIO } from "./src/lib/socket.js";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	const server = createServer((req, res) => {
		const parsedUrl = parse(req.url, true);
		handle(req, res, parsedUrl);
	});

	// Inicializa Socket.IO
	const io = new Server(server, {
		cors: {
			origin: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
			methods: ["GET", "POST"],
			credentials: true,
		},
	});
	setIO(io);

	io.on("connection", async (socket) => {
		console.log("Nova conexão socket:", socket.id);

		let session = null;

		try {
			session = await auth.api.getSession({
				headers: socket.request.headers
			});

			if (!session) {
				console.log("Conexão rejeitada - sem sessão válida");
				socket.emit("auth_error", { message: "Sessão inválida" });
				socket.emit("leaveGroup");
				socket.disconnect();
				return;
			}

			const now = new Date();
			const sessionExpiry = new Date(session.expiresAt);

			if (sessionExpiry < now) {
				console.log("Conexão rejeitada - sessão expirada");
				socket.emit("auth_error", { message: "Sessão expirada" });
				socket.disconnect();
				return;
			}

			console.log(`Usuário conectado: ${session.user.name || session.user.email} (${session.user.id})`);

			socket.emit("auth_success", {
				user: {
					id: session.user.id,
					name: session.user.name,
					email: session.user.email
				}
			});

		} catch (error) {
			console.error("Erro na validação da sessão:", error);
			socket.emit("auth_error", { message: "Erro de autenticação" });
			socket.disconnect();
			return;
		}

		// Handler para entrar em grupos/salas
		socket.on("joinGroup", (groupId) => {
			if (!session) return;

			socket.join(`group_${groupId}`);
			socket.currentGroupId = groupId;
			console.log(`Usuário ${session.user.id} entrou no grupo ${groupId}`);

			const serverTimestamp = Date.now();
			const serverDate = new Date();

			// Notifica outros usuários do grupo
			socket.to(`group_${groupId}`).emit("user_joined", {
				id: `joined-${serverTimestamp}-${session.user.id}`,
				userId: session.user.id,
				userName: session.user.name || session.user.email,
				message: `${session.user.name || session.user.email} entrou no chat`,
				timestamp: serverTimestamp,
				sendAt: serverDate.toISOString()
			});
		});

		// Handler para sair de grupos
		socket.on("leaveGroup", (groupId) => {
			if (!session) return;

			socket.leave(`group_${groupId}`);
			console.log(`Usuário ${session.user.id} saiu do grupo ${groupId}`);

			const serverTimestamp = Date.now();
			const serverDate = new Date();

			// Notifica outros usuários do grupo
			socket.to(`group_${groupId}`).emit("user_left", {
				id: `left-${serverTimestamp}-${session.user.id}`,
				userId: session.user.id,
				userName: session.user.name || session.user.email,
				message: `${session.user.name || session.user.email} saiu do chat`,
				timestamp: serverTimestamp,
				sendAt: serverDate.toISOString()
			});
		});

		// Handler para mensagens
		socket.on("message", async (data) => {
			if (!session || !data.content || !data.groupId) {
				socket.emit("message_error", { message: "Dados inválidos" });
				return;
			}

			try {
				const response = await fetch(`${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/groups/${data.groupId}/messages`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Cookie": socket.request.headers.cookie || ""
					},
					body: JSON.stringify({
						content: data.content
					})
				})

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Erro ao enviar mensagem");
				}

				console.log(`Mensagem enviada por ${session.user.id} no grupo ${data.groupId}: ${data.content}`);
			} catch (error) {
				console.error("Erro ao processar mensagem:", error);
				socket.emit("message_error", {
					message: "Erro ao enviar mensagem"
				});
			}
		});

		// Handler para desconexão
		socket.on("disconnect", () => {
			console.log(`Usuário desconectado: ${socket.id}`);

			const serverTimestamp = Date.now();
			const serverDate = new Date();

			if (session && socket.currentGroupId) {
				socket.to(`group_${socket.currentGroupId}`).emit("user_left", {
					id: `left-${serverTimestamp}-${session.user.id}`,
					userId: session.user.id,
					userName: session.user.name || session.user.email,
					message: `${session.user.name || session.user.email} saiu do chat`,
					timestamp: serverTimestamp,
					sendAt: serverDate.toISOString()
				});
				console.log(`Sessão encerrada para: ${session.user.id}`);
			}
		});
	});

	const port = process.env.PORT || 3000;

	server.listen(port, (err) => {
		if (err) throw err;
		console.log(`> Servidor rodando em http://localhost:${port}`);
		console.log(`> Socket.IO inicializado`);
	});
});