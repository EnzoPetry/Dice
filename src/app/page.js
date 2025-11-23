"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MessageSquare, Shield, Gamepad2, Sparkles, ArrowRight, Dices } from "lucide-react";

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
			<nav className="fixed top-0 w-full bg-black/20 backdrop-blur-lg border-b border-white/10 z-50">
				<div className="container mx-auto px-4 py-4 flex justify-between items-center">
					<div className="flex items-center gap-3">
						<Dices className="w-8 h-8 text-purple-400" />
						<span className="text-2xl font-bold text-white">Project Dice</span>
					</div>
					<div className="flex items-center gap-4">
						<Link href="/login">
							<Button variant="outline" className="text-base font-medium border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200">
								Entrar
							</Button>
						</Link>
						<Link href="/register">
							<Button className="text-base font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200w-full text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
								Criar Conta
							</Button>
						</Link>
					</div>
				</div>
			</nav>

			<section className="pt-32 pb-20 px-4">
				<div className="container mx-auto text-center">
					<h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
						Encontre sua próxima
						<span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
							Aventura Épica
						</span>
					</h1>

					<p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
						Conecte-se com jogadores e mestres, crie grupos, organize sessões e embarque em jornadas inesquecíveis de RPG de mesa.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<Link href="/register">
							<Button size="lg" className="h-11 text-base font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200w-full h-11 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
								Começar Agora
								<ArrowRight className="ml-2 w-5 h-5" />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			<section className="py-20 px-4 bg-black/20">
				<div className="container mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
							Tudo que você precisa para jogar
						</h2>
						<p className="text-xl text-gray-400 max-w-2xl mx-auto">
							Ferramentas poderosas para conectar jogadores e criar experiências incríveis
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
						<Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
							<CardContent className="p-8">
								<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
									<Users className="w-7 h-7 text-white" />
								</div>
								<h3 className="text-2xl font-bold text-white mb-3">Crie Grupos</h3>
								<p className="text-gray-400 leading-relaxed">
									Monte seu grupo de aventureiros. Defina o sistema de RPG, horários e encontre os jogadores perfeitos para sua mesa.
								</p>
							</CardContent>
						</Card>

						<Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
							<CardContent className="p-8">
								<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
									<MessageSquare className="w-7 h-7 text-white" />
								</div>
								<h3 className="text-2xl font-bold text-white mb-3">Chat em Tempo Real</h3>
								<p className="text-gray-400 leading-relaxed">
									Converse com seu grupo, planeje sessões e mantenha todos sincronizados com nosso sistema de chat instantâneo.
								</p>
							</CardContent>
						</Card>

						<Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
							<CardContent className="p-8">
								<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
									<Shield className="w-7 h-7 text-white" />
								</div>
								<h3 className="text-2xl font-bold text-white mb-3">Controle de Acesso</h3>
								<p className="text-gray-400 leading-relaxed">
									Aprove novos membros, gerencie permissões e mantenha seu grupo seguro com ferramentas de moderação avançadas.
								</p>
							</CardContent>
						</Card>

						<Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
							<CardContent className="p-8">
								<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
									<Gamepad2 className="w-7 h-7 text-white" />
								</div>
								<h3 className="text-2xl font-bold text-white mb-3">Múltiplos Sistemas</h3>
								<p className="text-gray-400 leading-relaxed">
									D&D, Pathfinder, Call of Cthulhu, Tormenta e muitos outros. Jogue o sistema que você ama.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			<section className="py-20 px-4">
				<div className="container mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
							Como funciona
						</h2>
						<p className="text-xl text-gray-400 max-w-2xl mx-auto">
							Em apenas 3 passos simples, você estará pronto para sua próxima aventura
						</p>
					</div>

					<div className="max-w-4xl mx-auto">
						<div className="relative">
							<div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-cyan-500 hidden md:block" />

							<div className="relative flex flex-col md:flex-row items-start gap-6 mb-12">
								<div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/50 z-10">
									1
								</div>
								<div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
									<h3 className="text-2xl font-bold text-white mb-3">Crie sua Conta</h3>
									<p className="text-gray-400 leading-relaxed">
										Cadastre-se gratuitamente em poucos segundos. Adicione suas preferências de RPG e conte um pouco sobre seu estilo de jogo.
									</p>
								</div>
							</div>

							<div className="relative flex flex-col md:flex-row items-start gap-6 mb-12">
								<div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/50 z-10">
									2
								</div>
								<div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
									<h3 className="text-2xl font-bold text-white mb-3">Encontre seu Grupo</h3>
									<p className="text-gray-400 leading-relaxed">
										Navegue por centenas de grupos ou crie o seu próprio. Filtre por sistema, horário e nível de experiência para encontrar a mesa perfeita.
									</p>
								</div>
							</div>

							<div className="relative flex flex-col md:flex-row items-start gap-6">
								<div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-500/50 z-10">
									3
								</div>
								<div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
									<h3 className="text-2xl font-bold text-white mb-3">Comece a Jogar</h3>
									<p className="text-gray-400 leading-relaxed">
										Entre no grupo, conheça os membros pelo chat e prepare-se para aventuras épicas. Role os dados e divirta-se!
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}