"use client";

import { useRouter } from "next/navigation";

export default function Page() {
	const router = useRouter();

	const handleLoginRedirect = () => {
		router.push("/login");
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
			<h1 className="text-3xl font-bold underline mb-8">Project Dice</h1>
			<button className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition" onClick={handleLoginRedirect} >
				Ir para Login
			</button>
		</div>
	);
}