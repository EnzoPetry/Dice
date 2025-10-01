"use client";

import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export function useSession() {
	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const router = useRouter();

	const validateAndCleanSession = async () => {
		try {
			const { data, error } = await authClient.getSession();

			if (error) {
				console.error('Erro ao obter sessão:', error);
				await clearSession();
				return null;
			}

			if (!data) {
				await clearSession();
				return null;
			}

			const now = new Date();
			const sessionExpiry = new Date(data.expiresAt);

			if (sessionExpiry < now) {
				console.log('Sessão expirada no cliente');
				await clearSession();
				return null;
			}

			return data;
		} catch (error) {
			console.error('Erro na validação da sessão:', error);
			await clearSession();
			return null;
		}
	};

	const clearSession = async () => {
		try {
			await authClient.signOut();
		} catch (error) {
			console.error('Erro ao fazer logout:', error);
		} finally {
			setSession(null);
			setError(null);

			if (typeof window !== 'undefined') {
				localStorage.removeItem('auth_session');
				localStorage.removeItem('user_data');
			}
		}
	};

	const refreshSession = async () => {
		setLoading(true);
		const validSession = await validateAndCleanSession();
		setSession(validSession);
		setLoading(false);
		return validSession;
	};

	useEffect(() => {
		const checkSession = async () => {
			try {
				const validSession = await validateAndCleanSession();
				setSession(validSession);
			} catch (error) {
				setError(error.message || 'Erro ao verificar sessão');
			} finally {
				setLoading(false);
			}
		};

		checkSession();

		const interval = setInterval(async () => {
			if (!loading) {
				const validSession = await validateAndCleanSession();
				if (!validSession && session) {
					router.push('/login');
				}
				setSession(validSession);
			}
		}, 5 * 60 * 1000); // 5 minutos

		return () => clearInterval(interval);
	}, []);

	const signOut = async () => {
		setLoading(true);
		try {
			await clearSession();
			router.push('/login');
		} catch (error) {
			setError(error.message || 'Erro ao fazer logout');
		} finally {
			setLoading(false);
		}
	};

	return {
		session,
		loading,
		error,
		signOut,
		refreshSession,
		isAuthenticated: !!session
	};
}