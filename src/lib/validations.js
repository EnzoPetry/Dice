import { z } from "zod";

export const registerSchema = z.object({
	name: z
		.string()
		.min(1, "Nome é obrigatório")
		.min(3, "Nome deve ter pelo menos 3 caracteres")
		.max(50, "Nome deve ter no máximo 50 caracteres")
		.trim()
		.transform((val) => val.replace(/\s+/g, ' ')),

	email: z
		.string()
		.min(1, "E-mail é obrigatório")
		.email("E-mail inválido")
		.toLowerCase()
		.trim(),

	password: z
		.string()
		.min(1, "Senha é obrigatória")
		.min(6, "Senha deve ter pelo menos 8 caracteres")
		.max(100, "Senha deve ter no máximo 100 caracteres")
		.regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
		.regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
		.regex(/[0-9]/, "Senha deve conter pelo menos um número"),

	confirmPassword: z
		.string()
		.min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
	message: "As senhas não coincidem",
	path: ["confirmPassword"],
});

export const loginSchema = z.object({
	email: z
		.string()
		.min(1, "E-mail é obrigatório")
		.email("E-mail inválido")
		.toLowerCase()
		.trim(),

	password: z
		.string()
		.min(1, "Senha é obrigatória"),
});

export const createGroupSchema = z.object({
	name: z
		.string()
		.min(1, "Nome do grupo é obrigatório")
		.min(3, "Nome do grupo deve ter pelo menos 3 caracteres")
		.max(50, "Nome do grupo deve ter no máximo 50 caracteres")
		.trim()
		.transform((val) => val.replace(/\s+/g, ' ')),

	description: z
		.string()
		.min(1, "Descrição é obrigatória")
		.min(10, "Descrição deve ter pelo menos 10 caracteres")
		.max(500, "Descrição deve ter no máximo 500 caracteres")
		.trim()
		.transform((val) => val.replace(/\s+/g, ' ')),

	rpgTypeId: z
		.string()
		.min(1, "Tipo de RPG é obrigatório")
		.transform((val) => parseInt(val, 10))
		.refine((val) => !isNaN(val) && val > 0, {
			message: "Tipo de RPG inválido"
		})
});

export const messageSchema = z.object({
	content: z
		.string()
		.min(1, "Mensagem não pode ser vazia")
		.max(1000, "Mensagem deve ter no máximo 1000 caracteres")
		.trim()
});