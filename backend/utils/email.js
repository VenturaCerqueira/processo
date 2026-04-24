import nodemailer from 'nodemailer';

function validarConfigSMTP() {
  const obrigatorias = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  const faltando = obrigatorias.filter((key) => !process.env[key]);
  return faltando;
}

function criarTransporter() {
  const faltando = validarConfigSMTP();
  if (faltando.length > 0) {
    throw new Error(`Configuração SMTP incompleta. Variáveis ausentes: ${faltando.join(', ')}`);
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

export async function enviarEmailRecuperacao(email, token, nomeUsuario = '') {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const link = `${frontendUrl}/redefinir-senha?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  const saudacao = nomeUsuario ? `Olá, ${nomeUsuario}` : 'Olá';
  const from = process.env.SMTP_FROM || 'Sistema de Processos <noreply@processo.gov.br>';

  const htmlTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 0 16px !important; }
      .card { padding: 32px 20px !important; }
      .btn { width: 100% !important; display: block !important; text-align: center !important; }
      .header { padding: 32px 20px !important; }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate { animation: fadeInUp 0.6s ease both; }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f0f4f8; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f0f4f8;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container" style="max-width:600px; width:100%; border-collapse:collapse;">
          <!-- Header -->
          <tr>
            <td class="header animate" style="background: linear-gradient(135deg, #0f4c81 0%, #1a6db5 50%, #0a3358 100%); padding: 40px 32px; text-align:center; border-radius:16px 16px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="width:64px; height:64px; background:rgba(255,255,255,0.15); border-radius:16px; text-align:center; vertical-align:middle;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block; margin:0 auto;">
                      <path d="M15 7a2 2 0 0 1 2 2m4 0a6 6 0 0 1-7.743 5.743L11 17H9v2H7v2H4a1 1 0 0 1-1-1v-2.586a1 1 0 0 1 .293-.707l5.964-5.964A6 6 0 1 1 21 9z"/>
                    </svg>
                  </td>
                </tr>
              </table>
              <h1 style="color:#ffffff; font-size:22px; font-weight:700; margin:16px 0 4px; letter-spacing:-0.3px;">Recuperação de Senha</h1>
              <p style="color:rgba(255,255,255,0.75); font-size:13px; margin:0; font-weight:500;">Sistema de Processos Eletrônicos</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td class="card animate" style="background:#ffffff; padding:40px 32px; border-radius:0 0 16px 16px; box-shadow:0 10px 40px rgba(15,76,129,0.12);">
              <p style="font-size:16px; color:#1e293b; margin:0 0 12px; font-weight:600;">${saudacao},</p>
              <p style="font-size:14px; color:#475569; line-height:1.7; margin:0 0 24px;">
                Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha. Este link é válido por <strong style="color:#0f4c81;">1 hora</strong>.
              </p>

              <!-- Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:28px 0;">
                <tr>
                  <td align="center">
                    <a href="${link}" class="btn" style="display:inline-block; padding:16px 40px; background:linear-gradient(135deg,#0f4c81,#1a6db5); color:#ffffff; text-decoration:none; border-radius:10px; font-size:15px; font-weight:600; letter-spacing:0.3px; box-shadow:0 4px 14px rgba(15,76,129,0.35); transition:all 0.2s ease;">
                      Redefinir Minha Senha
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="font-size:12px; color:#64748b; margin:0 0 8px; font-weight:500;">Se o botão não funcionar, copie e cole este link no navegador:</p>
              <p style="word-break:break-all; background:#f1f5f9; padding:12px 16px; border-radius:8px; font-size:12px; color:#0f4c81; font-family:'SF Mono',Monaco,monospace; margin:0 0 24px; border:1px solid #e2e8f0;">
                ${link}
              </p>

              <!-- Security notice -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f8fafc; border-radius:10px; border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top; padding-right:12px;">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            <path d="m9 12 2 2 4-4"/>
                          </svg>
                        </td>
                        <td style="vertical-align:top;">
                          <p style="font-size:13px; color:#334155; margin:0 0 2px; font-weight:600;">Sua segurança é importante</p>
                          <p style="font-size:12px; color:#64748b; margin:0; line-height:1.5;">Se você não solicitou esta recuperação, ignore este e-mail. Nenhuma alteração será feita na sua conta.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <hr style="border:none; border-top:1px solid #e2e8f0; margin:28px 0;" />

              <!-- Footer -->
              <p style="font-size:12px; color:#94a3b8; text-align:center; margin:0; line-height:1.6;">
                Sistema de Processos Eletrônicos<br/>
                <span style="font-size:11px; color:#cbd5e1;">Este é um e-mail automático, por favor não responda.</span>
              </p>
            </td>
          </tr>
          <!-- Spacer -->
          <tr>
            <td style="height:24px;"></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const transporter = criarTransporter();
  await transporter.sendMail({
    from,
    to: email,
    subject: 'Recuperação de Senha - Sistema de Processos',
    html: htmlTemplate,
    text: `${saudacao},\n\nRecebemos uma solicitação para redefinir a senha da sua conta no Sistema de Processos Eletrônicos.\n\nAcesse o link abaixo para redefinir sua senha. Este link expira em 1 hora:\n\n${link}\n\nSe você não solicitou esta recuperação, ignore este e-mail. Nenhuma alteração será feita na sua conta.\n\nSistema de Processos Eletrônicos`
  });
}

export async function enviarEmailPrimeiroAcesso(email, token, nomeUsuario = '') {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const link = `${frontendUrl}/redefinir-senha?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&tipo=primeiro-acesso`;
  const saudacao = nomeUsuario ? `Olá, ${nomeUsuario}` : 'Olá';
  const from = process.env.SMTP_FROM || 'Sistema de Processos <noreply@processo.gov.br>';

  const htmlTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ativação de Conta</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 0 16px !important; }
      .card { padding: 32px 20px !important; }
      .btn { width: 100% !important; display: block !important; text-align: center !important; }
      .header { padding: 32px 20px !important; }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate { animation: fadeInUp 0.6s ease both; }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f0f4f8; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f0f4f8;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container" style="max-width:600px; width:100%; border-collapse:collapse;">
          <tr>
            <td class="header animate" style="background: linear-gradient(135deg, #0f4c81 0%, #1a6db5 50%, #0a3358 100%); padding: 40px 32px; text-align:center; border-radius:16px 16px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="width:64px; height:64px; background:rgba(255,255,255,0.15); border-radius:16px; text-align:center; vertical-align:middle;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block; margin:0 auto;">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </td>
                </tr>
              </table>
              <h1 style="color:#ffffff; font-size:22px; font-weight:700; margin:16px 0 4px; letter-spacing:-0.3px;">Ativação de Conta</h1>
              <p style="color:rgba(255,255,255,0.75); font-size:13px; margin:0; font-weight:500;">Sistema de Processos Eletrônicos</p>
            </td>
          </tr>
          <tr>
            <td class="card animate" style="background:#ffffff; padding:40px 32px; border-radius:0 0 16px 16px; box-shadow:0 10px 40px rgba(15,76,129,0.12);">
              <p style="font-size:16px; color:#1e293b; margin:0 0 12px; font-weight:600;">${saudacao},</p>
              <p style="font-size:14px; color:#475569; line-height:1.7; margin:0 0 24px;">
                Sua conta foi criada no Sistema de Processos Eletrônicos. Clique no botão abaixo para cadastrar sua senha de acesso. Este link é válido por <strong style="color:#0f4c81;">1 hora</strong>.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:28px 0;">
                <tr>
                  <td align="center">
                    <a href="${link}" class="btn" style="display:inline-block; padding:16px 40px; background:linear-gradient(135deg,#0f4c81,#1a6db5); color:#ffffff; text-decoration:none; border-radius:10px; font-size:15px; font-weight:600; letter-spacing:0.3px; box-shadow:0 4px 14px rgba(15,76,129,0.35); transition:all 0.2s ease;">
                      Cadastrar Minha Senha
                    </a>
                  </td>
                </tr>
              </table>
              <p style="font-size:12px; color:#64748b; margin:0 0 8px; font-weight:500;">Se o botão não funcionar, copie e cole este link no navegador:</p>
              <p style="word-break:break-all; background:#f1f5f9; padding:12px 16px; border-radius:8px; font-size:12px; color:#0f4c81; font-family:'SF Mono',Monaco,monospace; margin:0 0 24px; border:1px solid #e2e8f0;">
                ${link}
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f8fafc; border-radius:10px; border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top; padding-right:12px;">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            <path d="m9 12 2 2 4-4"/>
                          </svg>
                        </td>
                        <td style="vertical-align:top;">
                          <p style="font-size:13px; color:#334155; margin:0 0 2px; font-weight:600;">Sua segurança é importante</p>
                          <p style="font-size:12px; color:#64748b; margin:0; line-height:1.5;">Se você não solicitou esta conta, ignore este e-mail. Nenhuma alteração será feita.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <hr style="border:none; border-top:1px solid #e2e8f0; margin:28px 0;" />
              <p style="font-size:12px; color:#94a3b8; text-align:center; margin:0; line-height:1.6;">
                Sistema de Processos Eletrônicos<br/>
                <span style="font-size:11px; color:#cbd5e1;">Este é um e-mail automático, por favor não responda.</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="height:24px;"></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const transporter = criarTransporter();
  await transporter.sendMail({
    from,
    to: email,
    subject: 'Ativação de Conta - Sistema de Processos',
    html: htmlTemplate,
    text: `${saudacao},\n\nSua conta foi criada no Sistema de Processos Eletrônicos.\n\nAcesse o link abaixo para cadastrar sua senha de acesso. Este link expira em 1 hora:\n\n${link}\n\nSe você não solicitou esta conta, ignore este e-mail.\n\nSistema de Processos Eletrônicos`
  });
}
