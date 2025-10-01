"use client"

import { authClient } from "@/lib/auth-client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { io } from "socket.io-client"

export default function ChatPage({ params }) {
	// const { id } = params;
	const [socket, setSocket] = useState(null);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [session, setSession] = useState(null);
	const [isLoading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const router = useRouter();

	useEffect(() => {
		async function fetchSession() {
			try {
				const { data, error } = await authClient.getSession();
				if (error) throw error;
				setSession(data);
			} catch (error) {
				setError(error.message || "Failed to load session");
			} finally {
				setLoading(false);
			}
		}
		fetchSession();
	}, [])

	useEffect(() => {
		async function fetchMessages() {
			try {
				const res = await fetch(`/api/messages`);
				const data = await res.json();
				if (data.error) throw new Error(data.error);
				setMessages(data);
			} catch (error) {
				setError(error.message || 'Failed to load messages');
			}
		}
		fetchMessages();
	}, []);

	useEffect(() => {
		if (!isLoading && !session) {
			router.push("/login");
		}
	}, [isLoading, session, router]);

	useEffect(() => {
		const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000");
		setSocket(newSocket);

		newSocket.emit("joinGroup", "id");

		newSocket.on("message", (msg) => {
			console.log("Mensagem recebida:", msg);
			setMessages((prev) => [...prev, msg]);
		});

		return () => {
			newSocket.disconnect();
		};
	}, []);

	const sendMessage = () => {
		if (socket && input.trim() !== "") {
			socket.emit("message", {
				msg: input,
				sender: session?.user?.id,
				senderName: session?.user?.name || session?.user?.email || "Unknown", // Include senderName
			});
			setInput("");
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && input.trim() !== "") {
			sendMessage();
		}
	};

	if (isLoading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;
	if (!session) return <p>Redirecting...</p>;

	return (
		<div className="p-4">
			<h1 className="text-xl font-bold">Chat do grupo</h1>
			<div className="border p-2 h-64 overflow-y-auto my-2">
				{messages.map((msg, i) => (
					<div key={msg.id || i} className="py-1">
						<span className="font-semibold">
							{msg.senderName || msg.userName  || msg.sender || "Unknown"}:
						</span>{" "}
						{msg.text || msg.message || msg }
					</div>
				))}
			</div>
			<div className="flex">
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyPress={handleKeyPress}
					className="border p-1 flex-1"
					aria-label="Message input"
				/>
				<button
					onClick={sendMessage}
					className="ml-2 bg-blue-500 px-3 text-white"
					aria-label="Send message"
				>
					Enviar
				</button>
			</div>
		</div>
	)
}
