"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useSession } from "@/hooks/useSession"
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { useRef } from "react";

export default function GroupPage({ params }) {
	const { id } = use(params);
	const [group, setGroup] = useState(null);
	const [socket, setSocket] = useState(null);
	const [messages, setMessages] = useState([]);
	const [notifications, setNotifications] = useState([]);
	const [input, setInput] = useState("");
	const [isLoading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const messagesEndRef = useRef(null);
	const messagesContainerRef = useRef(null);
	const router = useRouter();
	const { session, loading, isAuthenticated } = useSession();

	const combinedItems = useMemo(() => {
		const items = [
			...messages.map(msg => ({
				...msg,
				itemType: 'message',
				timestamp: new Date(msg.sendAt || msg.createdAt).getTime()
			})),
			...notifications.map(notif => ({
				...notif,
				itemType: 'notification',
				timestamp: notif.timestamp || Date.now()
			}))
		];

		return items.sort((a, b) => a.timestamp - b.timestamp);
	}, [messages, notifications]);

	const fetchData = async () => {
		try {
			const res = await fetch(`/api/groups/${id}`);
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			setGroup(data);
		} catch (error) {
			setError(error.message || 'Failed to load messages');
		}
	}

	const fetchMessages = async () => {
		try {
			const res = await fetch(`/api/groups/${id}/messages`);
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			setMessages(data);
		} catch (error) {
			setError(error.message || 'Failed to load messages');
		}
	}

	const sendMessage = () => {
		if (socket && input.trim() !== "") {
			socket.emit("message", {
				content: input,
				groupId: id,
				sender: session.user?.id,
				senderName: session?.user?.name || session?.user?.email
			});
			setInput("");
		}
	};

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && input.trim() !== "") {
			sendMessage();
		}
	};

	useEffect(() => {
		if (!loading && !isAuthenticated) {
			router.push('/login');
			return;
		}
		if (isAuthenticated) {
			fetchData();
			fetchMessages();
		}
	}, [isAuthenticated, loading, router, id]);

	useEffect(() => {
		if (!id) return;

		const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000");
		setSocket(newSocket);

		newSocket.emit("joinGroup", id);

		newSocket.on("message", (msg) => {
			console.log("Mensagem recebida:", msg);
			setMessages((prev) => [...prev, msg]);
		});

		newSocket.on("user_joined", (data) => {
			console.log("Usuário entrou:", data);
			const notification = {
				id: `notif-joined-${Date.now()}`,
				type: 'joined',
				userId: data.userId,
				userName: data.userName,
				message: data.message || `${data.userName} entrou no grupo`,
				timestamp: Date.now()
			};
			setNotifications((prev) => [...prev, notification]);
		});

		newSocket.on("user_left", (data) => {
			console.log("Usuário saiu:", data);
			const notification = {
				id: `notif-left-${Date.now()}`,
				type: 'left',
				userId: data.userId,
				userName: data.userName,
				message: data.message || `${data.userName} saiu do grupo`,
				timestamp: Date.now()
			};
			setNotifications((prev) => [...prev, notification]);
		});

		return () => {
			newSocket.emit("leaveGroup", id);
			newSocket.disconnect();
		};
	}, [id]);

	useEffect(() => {
		scrollToBottom();
	}, [combinedItems]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-lg">Carregando...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-lg text-destructive mb-2">Erro</p>
					<p className="text-muted-foreground">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen p-8">
			<div className="max-w-4xl mx-auto">
				{group && (
					<div className="space-y-6">
						<div className="bg-card rounded-lg border p-6 shadow-sm">
							<div className="flex items-start justify-between mb-4">
								<div>
									<h1 className="text-3xl font-bold mb-2">{group.name}</h1>
									<p className="text-muted-foreground">{group.description}</p>
								</div>
								<span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm font-medium">
									{group.rpgType?.name}
								</span>
							</div>
							<div className="flex gap-6 text-sm text-muted-foreground border-t pt-4">
								<div className="flex items-center gap-2">
									<span className="font-medium text-foreground">{group._count?.userGroups || 0}</span>
									<span>membros</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="font-medium text-foreground">{group._count?.messages || 0}</span>
									<span>mensagens</span>
								</div>
							</div>
						</div>

						<div className="bg-card rounded-lg border shadow-sm flex flex-col h-[600px]">
							<div className="p-4 border-b">
								<h2 className="text-xl font-semibold">Chat do Grupo</h2>
							</div>

							<div
								ref={messagesContainerRef}
								className="flex-1 overflow-y-auto p-4 space-y-3"
							>
								{combinedItems.length === 0 ? (
									<div className="flex items-center justify-center h-full text-muted-foreground">
										<p>Nenhuma mensagem ainda. Seja o primeiro a enviar!</p>
									</div>
								) : (
									combinedItems.map((item, i) => {
										if (item.itemType === 'notification') {
											return (
												<div
													key={item.id || `notif-${i}`}
													className="flex items-center justify-center my-4 w-full"
												>
													<div className="flex items-center w-full max-w-md">
														<div className="flex-1 h-px bg-border"></div>
														<span className="px-3 text-xs text-muted-foreground whitespace-nowrap">
															{item.message}
														</span>
														<div className="flex-1 h-px bg-border"></div>
													</div>
												</div>
											);
										}

										const isOwnMessage = session?.user?.id === item.sender;
										return (
											<div
												key={item.id || `msg-${i}`}
												className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
											>
												<div
													className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwnMessage
														? 'bg-primary text-primary-foreground'
														: 'bg-muted'
														}`}
												>
													{!isOwnMessage && (
														<p className="text-xs font-semibold mb-1 opacity-80">
															{item.senderName || item.userName || "Usuário"}
															{item.type && item.type !== "common" && item.type !== "joined" && item.type !== "left" && (
																<span className="ml-2 px-2 py-0.5 text-[10px] bg-black/20 rounded">
																	{item.type}
																</span>
															)}
														</p>
													)}
													<p className="text-sm break-words">
														{item.content || item.message || item.text || String(item)}
													</p>
													<p className="text-[10px] mt-1 opacity-70">
														{item.sendAt || item.createdAt
															? new Date(item.sendAt || item.createdAt).toLocaleTimeString('pt-BR', {
																hour: '2-digit',
																minute: '2-digit'
															})
															: ''
														}
													</p>
												</div>
											</div>
										);
									})
								)}
								<div ref={messagesEndRef} />
							</div>

							<div className="p-4 border-t">
								<div className="flex gap-2">
									<input
										value={input}
										onChange={(e) => setInput(e.target.value)}
										onKeyPress={handleKeyPress}
										className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
										placeholder="Digite sua mensagem..."
										aria-label="Message input"
										disabled={!session}
									/>
									<button
										onClick={sendMessage}
										disabled={!input.trim() || !session}
										className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										aria-label="Send message"
									>
										Enviar
									</button>
								</div>
								<p className="text-xs text-muted-foreground mt-2">
									Pressione Enter para enviar
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}