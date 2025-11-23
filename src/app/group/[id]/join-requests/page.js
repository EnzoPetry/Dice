"use client";

import { useState, useEffect } from "react";
import { Clock, Check, X, User, Mail, AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";

export default function PendingApprovalsPage() {
	const params = useParams();
	const groupId = params.id;

	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [processingId, setProcessingId] = useState(null);

	useEffect(() => {
		if (groupId) {
			fetchRequests();
		}
	}, [groupId]);

	const fetchRequests = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await fetch(`/api/groups/${groupId}/requests`);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Erro ao carregar solicitações");
			}

			const data = await response.json();
			setRequests(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleAction = async (requestId, action) => {
		try {
			setProcessingId(requestId);
			setError(null);

			const response = await fetch(`/api/groups/${groupId}/requests`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					requestId,
					action
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Erro ao processar solicitação");
			}

			// Remove a solicitação da lista após processamento
			setRequests(prev => prev.filter(req => req.id !== requestId));
		} catch (err) {
			setError(err.message);
		} finally {
			setProcessingId(null);
		}
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		}).format(date);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">
					Solicitações Pendentes
				</h1>
				<p className="text-gray-600">
					Gerencie as solicitações de entrada no grupo
				</p>
			</div>

			{error && (
				<div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
					<AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
					<div>
						<h3 className="font-semibold text-red-900 mb-1">Erro</h3>
						<p className="text-red-700 text-sm">{error}</p>
					</div>
				</div>
			)}

			{requests.length === 0 ? (
				<div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
					<Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						Nenhuma solicitação pendente
					</h3>
					<p className="text-gray-600">
						Não há solicitações aguardando aprovação no momento
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{requests.map((request) => (
						<div
							key={request.id}
							className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-3">
										<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
											{request.user.name?.charAt(0).toUpperCase() || "U"}
										</div>
										<div>
											<h3 className="font-semibold text-gray-900 text-lg">
												{request.user.name}
											</h3>
											<div className="flex items-center gap-2 text-sm text-gray-600">
												<Mail className="w-4 h-4" />
												<span>{request.user.email}</span>
											</div>
										</div>
									</div>

									<div className="flex items-center gap-2 text-sm text-gray-500">
										<Clock className="w-4 h-4" />
										<span>Solicitado em {formatDate(request.createdAt)}</span>
									</div>
								</div>

								<div className="flex gap-2">
									<button
										onClick={() => handleAction(request.id, "approved")}
										disabled={processingId === request.id}
										className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
									>
										<Check className="w-4 h-4" />
										{processingId === request.id ? "Processando..." : "Aprovar"}
									</button>
									<button
										onClick={() => handleAction(request.id, "rejected")}
										disabled={processingId === request.id}
										className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
									>
										<X className="w-4 h-4" />
										{processingId === request.id ? "Processando..." : "Rejeitar"}
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{requests.length > 0 && (
				<div className="mt-6 text-center text-sm text-gray-600">
					{requests.length} {requests.length === 1 ? "solicitação" : "solicitações"} pendente{requests.length !== 1 ? "s" : ""}
				</div>
			)}
		</div>
	);
}