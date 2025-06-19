import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import nodemailer, { Transporter } from "nodemailer";
import {
  EmailData,
  SMTPConfig,
  EmailDataModel,
  SMTPConfigModel,
} from "./models";

/**
 * @class EmailService
 * @description Classe principal que orquestra a configuração e o envio de emails.
 * Esta é a classe central da lógica interna do componente, responsável por:
 * - Configurar o transporte SMTP via nodemailer.
 * - Validar dados de email e configuração.
 * - Processar templates Handlebars.
 * - Enviar emails com anexos.
 */
export class EmailService {
  /**
   * @private
   * @type {Transporter | null}
   * @description A instância do transportador do nodemailer, usada para enviar emails.
   */
  private transporter: Transporter | null = null;
  /**
   * @private
   * @type {SMTPConfigModel | null}
   * @description A configuração SMTP ativa.
   */
  private smtpConfig: SMTPConfigModel | null = null;
  /**
   * @private
   * @type {string}
   * @description O caminho para o arquivo de template Handlebars padrão.
   */
  private defaultTemplatePath: string = path.resolve(
    __dirname,
    "templates/base.hbs"
  );

  /**
   * @constructor
   * @param {SMTPConfig} [smtpConfig] - Uma configuração SMTP opcional para inicializar o serviço no construtor.
   */
  constructor(smtpConfig?: SMTPConfig) {
    if (smtpConfig) {
      this.configureSMTP(smtpConfig);
    }
  }

  /**
   * @method configureSMTP
   * @description Configura o cliente SMTP para o envio de emails.
   * Valida a configuração fornecida e inicializa o transportador do nodemailer.
   * @param {SMTPConfig} smtp - O objeto de configuração SMTP.
   * @throws {Error} Lança um erro se a configuração SMTP for inválida.
   */
  configureSMTP(smtp: SMTPConfig): void {
    const config = SMTPConfigModel.create(smtp);

    if (!config.validate()) {
      throw new Error("Invalid SMTP configuration");
    }

    this.smtpConfig = config;

    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465, // true for 465, false for other ports
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  /**
   * @method sendEmail
   * @description Envia um email utilizando a configuração SMTP ativa.
   * @param {EmailData} emailData - Os dados do email a ser enviado.
   * @param {string} [templatePath] - Caminho opcional para um template Handlebars personalizado. Se não for fornecido, utiliza o template padrão.
   * @returns {Promise<void>}
   * @throws {Error} Lança um erro se o SMTP não estiver configurado, se os dados do email forem inválidos, se o template não for encontrado ou se houver uma falha no envio.
   */
  async sendEmail(emailData: EmailData, templatePath?: string): Promise<void> {
    if (!this.transporter) {
      throw new Error("SMTP not configured. Call configureSMTP() first.");
    }

    const email = EmailDataModel.create(emailData);

    if (!email.validate()) {
      throw new Error("Invalid email data");
    }

    // Usar template customizado se informado, senão usar o padrão
    const htmlContent = await this.processTemplate(
      email,
      templatePath || this.defaultTemplatePath
    );

    // Preparar anexos
    const attachments =
      email.attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
        path: att.path,
        contentType: att.getContentType(),
      })) || [];

    // Enviar email
    const mailOptions = {
      from: this.smtpConfig!.user,
      to: email.to,
      subject: email.subject,
      html: htmlContent,
      attachments,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${email.to}`);
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  /**
   * @private
   * @method processTemplate
   * @description Lê um arquivo de template Handlebars, compila-o e injeta os dados do email.
   * @param {EmailDataModel} email - O modelo de dados do email contendo o objeto `data` para o template.
   * @param {string} templatePath - O caminho para o arquivo .hbs do template.
   * @returns {Promise<string>} O conteúdo HTML processado.
   * @throws {Error} Lança um erro se o arquivo de template não puder ser lido.
   */
  private async processTemplate(
    email: EmailDataModel,
    templatePath: string
  ): Promise<string> {
    let templateContent: string;

    try {
      templateContent = await fs.promises.readFile(templatePath, "utf-8");
    } catch (error) {
      throw new Error(`Template file not found: ${templatePath}`);
    }

    // Compilar template com Handlebars usando os dados do template
    const template = handlebars.compile(templateContent);

    return template(email.data || {});
  }

  /**
   * @method isConfigured
   * @description Verifica se o serviço de email já foi configurado com dados SMTP.
   * @returns {boolean} `true` se o transportador SMTP estiver inicializado.
   */
  isConfigured(): boolean {
    return this.transporter !== null && this.smtpConfig !== null;
  }

  /**
   * @method getSMTPConfig
   * @description Retorna a configuração SMTP atualmente em uso.
   * @returns {SMTPConfigModel | null} O objeto de configuração ou `null` se não estiver configurado.
   */
  getSMTPConfig(): SMTPConfigModel | null {
    return this.smtpConfig;
  }

  /**
   * @method setDefaultTemplatePath
   * @description Permite substituir o caminho do template padrão do componente.
   * @param {string} templatePath - O caminho absoluto para o novo template padrão .hbs.
   */
  setDefaultTemplatePath(templatePath: string): void {
    this.defaultTemplatePath = templatePath;
  }

  /**
   * @method getDefaultTemplatePath
   * @description Retorna o caminho do template padrão atualmente configurado.
   * @returns {string}
   */
  getDefaultTemplatePath(): string {
    return this.defaultTemplatePath;
  }
}
