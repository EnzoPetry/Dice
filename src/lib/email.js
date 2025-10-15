import { createTransport } from "nodemailer";
import { getVerificationEmailHtml, getVerificationEmailText, getResetPasswordEmailHtml, getResetPasswordEmailText } from "./emailTemplates.js";

export const transporter = createTransport({
	host: process.env.SMTP_HOST,
	port: parseInt(process.env.SMTP_PORT),
	secure: false,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASSWORD,
	},
});

export async function sendVerificationEmails(email, token, userName) {
	const verificationUrl = `${process.env.NEXT_PUBLIC_URL}/verify-email?token=${token}`;

	try {
		const info = await transporter.sendMail({
			from: `"Project Dice" <noreply@${process.env.EMAIL_DOMAIN || "projectdice.com.br"}>`,
			to: email,
			subject: "Confirme seu e-mail - Project Dice",
			text: getVerificationEmailText(verificationUrl, userName),
			html: getVerificationEmailHtml(verificationUrl, userName),
		});

		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error("Erro ao enviar e-mail:", error);
		return { success: false, error: error.message };
	}
}

export async function sendResetPasswordEmail(email, token, userName) {
	const resetUrl = `${process.env.NEXT_PUBLIC_URL}/change-password?token=${token}`;

	try {
		const info = await transporter.sendMail({
			from: `"Project Dice" <noreply@${process.env.EMAIL_DOMAIN || "projectdice.com.br"}>`,
			to: email,
			subject: "Redefinição de Senha - Project Dice",
			text: getResetPasswordEmailText(resetUrl, userName),
			html: getResetPasswordEmailHtml(resetUrl, userName),
		});

		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error("Erro ao enviar e-mail de redefinição:", error);
		return { success: false, error: error.message };
	}
}