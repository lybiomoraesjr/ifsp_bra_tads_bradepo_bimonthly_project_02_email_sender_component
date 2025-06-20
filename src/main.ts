/**
 * @file main.ts
 * @description Script de teste manual para o componente de envio de email.
 *
 * Este arquivo serve como um exemplo prático e um ponto de entrada para testar
 * o componente de email usando o padrão de Interface de Componente.
 * Ele carrega as configurações de um arquivo .env, monta um objeto de email 
 * com dados de teste (incluindo um anexo), e utiliza o componente para enviar o email.
 *
 * Para executar, use o comando: `npm run email:test`
 */

import dotenv from "dotenv";
import { ConcreteComponentInterface } from "./provided/ConcreteComponentInterface";
import { SMTPConfig, EmailData } from "./internal/models";
import path from "path";
import fs from "fs";
import { ConcreteInterfacePort } from "./provided/ConcreteInterfacePort";

// Carrega as variáveis de ambiente do arquivo .env na raiz do projeto.
dotenv.config();

/**
 * @async
 * @function main
 * @description Função principal que orquestra o teste de envio de email usando o padrão de Interface de Componente.
 */
async function main() {
  // 1. Validação das Variáveis de Ambiente
  // Garante que as credenciais SMTP essenciais estão definidas no arquivo .env.
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    console.error(
      "❌ Erro: Configure as variáveis de ambiente SMTP_HOST, SMTP_USER, e SMTP_PASS no arquivo .env"
    );
    console.log(
      "📝 Se necessário, copie o `env.example` para `.env` e preencha com seus dados."
    );
    process.exit(1);
  }

  // 2. Preparação do Anexo de Teste
  // Tenta localizar um arquivo de anexo de teste na raiz do projeto.
  const attachmentPath = path.join(process.cwd(), "test-attachment.txt");
  const attachmentExists = fs.existsSync(attachmentPath);

  // 3. Montagem da Configuração SMTP
  // Cria o objeto de configuração a partir das variáveis de ambiente.
  const smtpConfig: SMTPConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  };

  // 4. Montagem dos Dados do Email
  // Cria o objeto de dados do email, usando variáveis de ambiente ou valores padrão.
  // Inclui dados dinâmicos para o template e o anexo, se ele existir.
  const emailData: EmailData = {
    to: process.env.EMAIL_TO || "destinatario@email.com",
    subject: process.env.EMAIL_SUBJECT || "Teste de envio de email com anexo",
    html: "<b>Mensagem de teste enviada pelo componente!</b>",
    data: {
      nome: process.env.EMAIL_NOME || "Destinatário",
      mensagem:
        process.env.EMAIL_MENSAGEM ||
        "Esta é uma mensagem de teste usando o componente. Verifique o arquivo anexo.",
      link: process.env.EMAIL_LINK || "https://ifsp.edu.br",
    },
    attachments: attachmentExists
      ? [
          {
            filename: "test-attachment.txt",
            path: attachmentPath,
            contentType: "text/plain",
          },
        ]
      : [],
  };

  // Log das configurações para fins de depuração.
  console.log("📧 Configurando componente de email...");
  console.log(`   Host: ${smtpConfig.host}:${smtpConfig.port}`);
  console.log(`   Usuário: ${smtpConfig.user}`);
  console.log(`   Destinatário: ${emailData.to}`);

  if (attachmentExists) {
    console.log("📎 Anexo encontrado:", attachmentPath);
  } else {
    console.log("⚠️  Arquivo de anexo não encontrado:", attachmentPath);
  }

  // 5. Uso do Componente via Padrão de Interface de Componente
  // Cria uma instância do componente e obtém a porta de interface.
  const emailComponent = new ConcreteComponentInterface();
  const emailPort = emailComponent.getPort("emailService") as ConcreteInterfacePort;

  // Configura o SMTP através da porta de interface
  emailPort.configureSMTP(smtpConfig);

  try {
    console.log("🚀 Enviando email através do componente...");
    await emailPort.send(emailData);
    console.log("✅ Email enviado com sucesso usando o padrão de Interface de Componente!");
  } catch (err) {
    console.error("❌ Erro ao enviar email:", err);
    process.exit(1);
  }
}

// Executa a função principal.
main();
