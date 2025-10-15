export function getVerificationEmailHtml(verificationUrl, userName) {
	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: bold;
        }
        .content {
          padding: 40px 30px;
          color: #1f2937;
        }
        .content h2 {
          color: #111827;
          font-size: 24px;
          margin-top: 0;
          margin-bottom: 20px;
        }
        .content p {
          margin: 15px 0;
          color: #4b5563;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%);
          color: white !important;
          padding: 14px 40px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);
        }
        .link-box {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 6px;
          word-break: break-all;
          color: #6b7280;
          font-size: 14px;
          margin: 20px 0;
        }
        .warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .warning strong {
          color: #92400e;
        }
        .footer {
          text-align: center;
          padding: 30px;
          background-color: #f9fafb;
          color: #6b7280;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 5px 0;
        }
        .divider {
          height: 1px;
          background-color: #e5e7eb;
          margin: 30px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
			<img src="https://projectdice.com.br/Dice.png" alt="Logo Project Dice" width="48">
          	<h1>Project Dice</h1>
        </div>

        <div class="content">
          <h2>Bem-vindo${userName ? ', ' + userName : ''}!</h2>

          <p>Obrigado por se cadastrar no <strong>Project Dice</strong>, a plataforma para encontrar jogadores e mestres para suas aventuras de RPG!</p>

          <p>Para começar sua jornada épica, precisamos verificar seu endereço de e-mail. É rápido e fácil:</p>

          <div class="button-container">
            <a href="${verificationUrl}" class="button">Verificar Meu E-mail</a>
          </div>

          <div class="divider"></div>

          <p><strong>Não consegue clicar no botão?</strong> Copie e cole este link no seu navegador:</p>

          <div class="link-box">
            ${verificationUrl}
          </div>

          <div class="warning">
            <strong>⚠️ Importante:</strong> Este link expira em 24 horas por motivos de segurança.
          </div>

          <p>Se você não criou esta conta, pode simplesmente ignorar este e-mail com segurança.</p>

          <div class="divider"></div>

          <p><strong>O que vem a seguir?</strong></p>
          <p>Após verificar seu e-mail, você poderá:</p>
          <ul style="color: #4b5563;">
            <li>Criar e participar de grupos de RPG</li>
            <li>Conversar com outros jogadores em tempo real</li>
            <li>Organizar suas sessões de jogo</li>
            <li>Encontrar a mesa perfeita para você!</li>
          </ul>
        </div>

        <div class="footer">
          <p style="margin-top: 15px; font-size: 12px;">
            Este é um e-mail automático, por favor não responda.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getVerificationEmailText(verificationUrl, userName) {
	return `
Project Dice - Verificação de E-mail

Bem-vindo${userName ? ', ' + userName : ''}!

Obrigado por se cadastrar no Project Dice, a plataforma para encontrar jogadores e mestres para suas aventuras de RPG!

Para começar sua jornada épica, precisamos verificar seu endereço de e-mail.

Clique no link abaixo para confirmar:
${verificationUrl}

⚠️ IMPORTANTE: Este link expira em 24 horas por motivos de segurança.

Se você não criou esta conta, pode simplesmente ignorar este e-mail.

---

O que vem a seguir?

Após verificar seu e-mail, você poderá:
- Criar e participar de grupos de RPG
- Conversar com outros jogadores em tempo real
- Organizar suas sessões de jogo
- Encontrar a mesa perfeita para você!

---
Este é um e-mail automático, por favor não responda.
  `;
}


export function getResetPasswordEmailHtml(resetUrl, userName) {
	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: bold;
        }
        .content {
          padding: 40px 30px;
          color: #1f2937;
        }
        .content h2 {
          color: #111827;
          font-size: 24px;
          margin-top: 0;
          margin-bottom: 20px;
        }
        .content p {
          margin: 15px 0;
          color: #4b5563;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%);
          color: white !important;
          padding: 14px 40px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);
        }
        .link-box {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 6px;
          word-break: break-all;
          color: #6b7280;
          font-size: 14px;
          margin: 20px 0;
        }
        .warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .warning strong {
          color: #92400e;
        }
        .footer {
          text-align: center;
          padding: 30px;
          background-color: #f9fafb;
          color: #6b7280;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 5px 0;
        }
        .divider {
          height: 1px;
          background-color: #e5e7eb;
          margin: 30px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
			<img src="https://projectdice.com.br/Dice.png" alt="Logo Project Dice" width="48">
          	<h1>Project Dice</h1>
        </div>

        <div class="content">
          <h2>Recuperação de Senha${userName ? ', ' + userName : ''}</h2>

          <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Project Dice</strong>.</p>

          <p>Para criar uma nova senha, clique no botão abaixo:</p>

          <div class="button-container">
            <a href="${resetUrl}" class="button">Redefinir Minha Senha</a>
          </div>

          <div class="divider"></div>

          <p>Se você não consegue clicar no botão, copie e cole o link abaixo no seu navegador:</p>

          <div class="link-box">
            ${resetUrl}
          </div>

          <div class="warning">
            <strong>⚠️ Importante:</strong> Este link expira em 24 horas por motivos de segurança.
          </div>

          <p>Se você não solicitou esta redefinição de senha, ignore este e-mail e sua senha permanecerá inalterada.</p>

          <div class="divider"></div>

          <p><strong>Medidas de segurança:</strong></p>
          <ul style="color: #4b5563;">
            <li>Nunca compartilhe sua senha com outras pessoas</li>
            <li>Utilize uma senha única que não seja usada em outros serviços</li>
            <li>Considere utilizar um gerenciador de senhas</li>
          </ul>
        </div>

        <div class="footer">
          <p style="margin-top: 15px; font-size: 12px;">
            Este é um e-mail automático, por favor não responda.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getResetPasswordEmailText(resetUrl, userName) {
	return `
Project Dice - Redefinição de Senha

Olá${userName ? ', ' + userName : ''}!

Recebemos uma solicitação para redefinir a senha da sua conta no Project Dice.

Para criar uma nova senha, acesse o link abaixo:
${resetUrl}

⚠️ IMPORTANTE: Este link expira em 24 horas por motivos de segurança.

Se você não solicitou esta redefinição de senha, ignore este e-mail e sua senha permanecerá inalterada.

---

Medidas de segurança:
- Nunca compartilhe sua senha com outras pessoas
- Utilize uma senha única que não seja usada em outros serviços
- Considere utilizar um gerenciador de senhas

---
Este é um e-mail automático, por favor não responda.
  `;
}