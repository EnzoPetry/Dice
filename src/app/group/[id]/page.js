"use client";

import { use, useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Clock, UserPlus, Loader2, ArrowLeft } from "lucide-react";

export default function GroupPage({ params }) {
	const { id } = use(params);
	const [group, setGroup] = useState(null);
	const [socket, setSocket] = useState(null);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [error, setError] = useState(null);
	const [isVisible, setIsVisible] = useState(false);
	const [isMember, setIsMember] = useState(false);
	const [userStatus, setUserStatus] = useState(null);
	const [isJoining, setIsJoining] = useState(false);
	const [joinStatus, setJoinStatus] = useState(null);
	const messagesEndRef = useRef(null);
	const messagesContainerRef = useRef(null);
	const isFirstLoadRef = useRef(true);
	const router = useRouter();
	const { session, loading, isAuthenticated } = useSession();

	const combinedItems = useMemo(() => {
		return messages.map(msg => ({
			...msg,
			itemType: (msg.type === "joined" || msg.type === "left") ? "notification" : "message",
			timestamp: msg.sendAt
				? new Date(msg.sendAt).getTime()
				: (msg.createdAt ? new Date(msg.createdAt).getTime() : msg.timestamp || Date.now())
		})).sort((a, b) => a.timestamp - b.timestamp);
	}, [messages]);

	const fetchData = useCallback(async () => {
		try {
			const res = await fetch(`/api/groups/${id}`);
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			setGroup(data);

			// Verifica se o usuário é membro do grupo
			if (session?.user?.id) {
				const memberCheck = data.userGroups?.some(
					ug => ug.user.email === session.user.email
				);
				setIsMember(memberCheck || false);
			}
		} catch (error) {
			setError(error.message || "Failed to load group data");
		}
	}, [id, session?.user?.id, session?.user?.email]);

	const fetchUserStatus = useCallback(async () => {
		try {
			const res = await fetch(`/api/groups`);
			const data = await res.json();
			if (data.error) throw new Error(data.error);

			const currentGroup = data.find(g => g.id === parseInt(id));
			if (currentGroup) {
				setUserStatus(currentGroup.userStatus);
				setIsMember(currentGroup.userStatus?.isMember || false);
			}
		} catch (error) {
			console.error("Erro ao buscar status do usuário:", error);
		}
	}, [id]);

	const fetchMessages = useCallback(async () => {
		if (!isMember) return;

		try {
			const res = await fetch(`/api/groups/${id}/messages`);
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			setMessages(data);
		} catch (error) {
			setError(error.message || "Failed to load messages");
		}
	}, [id, isMember]);

	const handleJoinGroup = async () => {
		setIsJoining(true);
		setJoinStatus(null);

		try {
			const res = await fetch(`/api/groups/${id}/join`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});
			const data = await res.json();

			if (!res.ok) {
				if (data.error === "Already a member of this group") {
					setJoinStatus({
						type: "info",
						message: "Você já é membro deste grupo!"
					});
					setIsMember(true);
					await fetchData();
					await fetchUserStatus();
					return;
				}

				if (data.error === "Join request already pending") {
					setJoinStatus({
						type: "pending",
						message: "Você já tem uma solicitação pendente para este grupo."
					});
					return;
				}

				throw new Error(data.error || "Failed to join group");
			}

			if (data.requiresApproval) {
				setJoinStatus({
					type: "pending",
					message: "Solicitação enviada! Aguarde a aprovação do administrador."
				});
				await fetchUserStatus();
			} else {
				setJoinStatus({
					type: "success",
					message: "Você entrou no grupo!"
				});
				setIsMember(true);
				await fetchData();
				await fetchUserStatus();
			}
		} catch (error) {
			setJoinStatus({
				type: "error",
				message: error.message || "Erro ao entrar no grupo"
			});
		} finally {
			setIsJoining(false);
		}
	};

	const sendMessage = () => {
		if (socket && input.trim() !== "" && isMember) {
			socket.emit("message", {
				content: input,
				groupId: id,
				sender: session.user?.id,
				senderName: session?.user?.name || session?.user?.email
			});
			setInput("");
		}
	};

	const scrollToBottom = useCallback((behavior = "smooth") => {
		messagesEndRef.current?.scrollIntoView({ behavior: behavior });
	}, []);

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && input.trim() !== "" && isMember) {
			sendMessage();
		}
	};

	useEffect(() => {
		if (combinedItems.length === 0) return;

		if (isFirstLoadRef.current) {
			setTimeout(() => {
				scrollToBottom("auto");
			}, 50);
			isFirstLoadRef.current = false;

			setTimeout(() => {
				setIsVisible(true);
			}, 50);
		} else {
			scrollToBottom("smooth");
		}
	}, [combinedItems.length, scrollToBottom]);

	useEffect(() => {
		if (!loading && !isAuthenticated) {
			router.push("/login");
			return;
		}
		if (isAuthenticated) {
			fetchData();
			fetchUserStatus();
		}
	}, [isAuthenticated, loading, router, fetchData, fetchUserStatus]);

	useEffect(() => {
		if (!id || !isAuthenticated || !isMember) return;

		fetchMessages();

		const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000");

		newSocket.on("connect", () => {
			console.log("Socket conectado com ID:", newSocket.id);
			setTimeout(() => {
				newSocket.emit("joinGroup", id);
			}, 100);
		});

		newSocket.on("message", (msg) => {
			console.log("Mensagem recebida:", msg);
			setMessages((prev) => [...prev, msg]);
		});

		newSocket.on("user_joined", (data) => {
			if (session?.user?.id !== data.userId) {
				console.log("Usuário entrou:", data);
				const notification = {
					id: `notif-joined-${Date.now()}-${data.userId}`,
					type: "joined",
					userId: data.userId,
					userName: data.userName,
					message: data.message || `${data.userName} entrou no grupo`,
					sendAt: data.sendAt || new Date(data.timestamp).toISOString(),
					timestamp: data.timestamp
				};
				setMessages((prev) => [...prev, notification]);
			}
		});

		newSocket.on("user_left", (data) => {
			if (session?.user?.id !== data.userId) {
				console.log("Usuário saiu:", data);
				const notification = {
					id: `notif-left-${Date.now()}-${data.userId}`,
					type: "left",
					userId: data.userId,
					userName: data.userName,
					message: data.message || `${data.userName} saiu do grupo`,
					sendAt: data.sendAt || new Date(data.timestamp).toISOString(),
					timestamp: data.timestamp
				};
				setMessages((prev) => [...prev, notification]);
			}
		});
		setSocket(newSocket);

		return () => {
			newSocket.emit("leaveGroup", id);
			newSocket.disconnect();
		};
	}, [id, isAuthenticated, isMember, fetchMessages, session?.user?.id]);

	const getJoinButtonConfig = () => {
		if (isMember || userStatus?.isMember) {
			return {
				text: "Você é membro",
				icon: <CheckCircle2 className="mr-2 h-4 w-4" />,
				disabled: true,
				variant: "outline",
				className: "border-green-200 text-green-700"
			};
		}

		if (userStatus?.isPending || joinStatus?.type === "pending") {
			return {
				text: "Aguardando Aprovação",
				icon: <Clock className="mr-2 h-4 w-4" />,
				disabled: true,
				variant: "outline",
				className: "border-yellow-200 text-yellow-700"
			};
		}

		if (userStatus?.isRejected) {
			return {
				text: "Solicitação Rejeitada",
				icon: null,
				disabled: true,
				variant: "outline",
				className: "border-red-200 text-red-700"
			};
		}

		if (joinStatus?.type === "success") {
			return {
				text: "Entrou no Grupo!",
				icon: <CheckCircle2 className="mr-2 h-4 w-4" />,
				disabled: true,
				variant: "outline",
				className: "border-green-200 text-green-700"
			};
		}

		return {
			text: "Entrar no Grupo",
			icon: <UserPlus className="mr-2 h-4 w-4" />,
			disabled: false,
			variant: "default",
			className: ""
		};
	};

	const buttonConfig = getJoinButtonConfig();

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
				<Button
					variant="ghost"
					onClick={() => router.push("/home")}
					className="mb-6 hover:bg-white/50"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Voltar para Home
				</Button>

				{group && (
					<div className="space-y-6">
						<div className="bg-card rounded-lg border p-6 shadow-sm">
							<div className="flex items-start justify-between gap-4 mb-4">
								<div className="flex-1 min-w-0">
									<h1 className="text-3xl font-bold mb-2 break-words">{group.name}</h1>
									<p className="text-muted-foreground break-words">{group.description}</p>
								</div>
								<div className="flex-shrink-0">
									<span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm font-medium whitespace-nowrap">
										{group.rpgType?.name}
									</span>
								</div>
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

						{!isMember && !userStatus?.isMember && (
							<div className="bg-card rounded-lg border p-6 shadow-sm">
								{joinStatus && (
									<Alert
										variant={joinStatus.type === "error" ? "destructive" : "default"}
										className={`mb-4 ${
											joinStatus.type === "pending" ? "bg-yellow-50 border-yellow-200" :
											joinStatus.type === "success" ? "bg-green-50 border-green-200" : ""
										}`}
									>
										<AlertTitle>
											{joinStatus.type === "pending" && "Solicitação Pendente"}
											{joinStatus.type === "success" && "Sucesso!"}
											{joinStatus.type === "error" && "Erro"}
											{joinStatus.type === "info" && "Informação"}
										</AlertTitle>
										<AlertDescription>{joinStatus.message}</AlertDescription>
									</Alert>
								)}

								<div className="text-center space-y-4">
									<h2 className="text-xl font-semibold">Você não é membro deste grupo</h2>
									<p className="text-muted-foreground">
										Entre no grupo para ter acesso ao chat e interagir com outros membros.
									</p>
									<Button
										className={buttonConfig.className}
										size="lg"
										variant={buttonConfig.variant}
										onClick={handleJoinGroup}
										disabled={isJoining || buttonConfig.disabled}
									>
										{isJoining ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Processando...
											</>
										) : (
											<>
												{buttonConfig.icon}
												{buttonConfig.text}
											</>
										)}
									</Button>
								</div>
							</div>
						)}

						{(isMember || userStatus?.isMember) && (
							<div className="bg-card rounded-lg border shadow-sm flex flex-col h-[600px]">
								<div className="p-4 border-b">
									<h2 className="text-xl font-semibold">Chat do Grupo</h2>
								</div>

								<div
									ref={messagesContainerRef}
									className="flex-1 overflow-y-auto p-4 space-y-3"
									style={{
										opacity: isVisible ? 1 : 0,
										transition: "opacity 0.2s ease-in-out"
									}}
								>
									{combinedItems.length === 0 ? (
										<div className="flex items-center justify-center h-full text-muted-foreground">
											<p>Nenhuma mensagem ainda. Seja o primeiro a enviar!</p>
										</div>
									) : (
										combinedItems.map((item, i) => {
											if (item.itemType === "notification") {
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
													className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
												>
													<div
														className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwnMessage
															? "bg-primary text-primary-foreground"
															: "bg-muted"
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
																? new Date(item.sendAt || item.createdAt).toLocaleTimeString("pt-BR", {
																	hour: "2-digit",
																	minute: "2-digit"
																})
																: ""
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
											disabled={!session || !isMember}
										/>
										<button
											onClick={sendMessage}
											disabled={!input.trim() || !session || !isMember}
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
						)}
					</div>
				)}
			</div>
		</div>
	);
}