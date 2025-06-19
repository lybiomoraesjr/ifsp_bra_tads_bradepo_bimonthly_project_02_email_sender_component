/**
 * @interface EmailData
 * @description Define a estrutura para os dados de um email.
 */
export interface EmailData {
  /** @type {string} O endereço de email do destinatário (ou múltiplos, separados por vírgula). */
  to: string;
  /** @type {string} O assunto do email. */
  subject: string;
  /** @type {string} O conteúdo HTML base do email. Pode ser sobrescrito por um template. */
  html: string;
  /** @type {Record<string, unknown> | undefined} Um objeto com dados dinâmicos para serem injetados no template Handlebars. */
  data?: Record<string, unknown>;
  /** @type {EmailAttachment[] | undefined} Uma lista de anexos do email. */
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content?: Buffer;
  path?: string;
  contentType?: string;
}

/**
 * @class EmailDataModel
 * @description Implementação do modelo de dados de email.
 * Inclui métodos para criação, validação e gerenciamento de anexos.
 * @implements {EmailData}
 */
export class EmailDataModel implements EmailData {
  /**
   * @constructor
   * @param {string} to
   * @param {string} subject
   * @param {string} html
   * @param {Record<string, unknown> | undefined} data
   * @param {EmailAttachmentModel[] | undefined} attachments
   */
  constructor(
    public to: string,
    public subject: string,
    public html: string,
    public data?: Record<string, unknown>,
    public attachments?: EmailAttachmentModel[]
  ) {}

  /**
   * @static
   * @method create
   * @description Cria uma nova instância de EmailDataModel a partir de um objeto de dados de email.
   * Converte anexos `EmailAttachment` para `EmailAttachmentModel`.
   * @param {EmailData} emailData - O objeto de dados do email.
   * @returns {EmailDataModel}
   */
  static create(emailData: EmailData): EmailDataModel {
    const attachments = emailData.attachments?.map(att => EmailAttachmentModel.create(att));
    
    return new EmailDataModel(
      emailData.to,
      emailData.subject,
      emailData.html,
      emailData.data,
      attachments
    );
  }

  /**
   * @method validate
   * @description Valida os dados do email.
   * Verifica se `to`, `subject` e `html` não estão vazios.
   * Valida o formato do email do destinatário.
   * Valida cada um dos anexos, se existirem.
   * @returns {boolean} `true` se os dados forem válidos, `false` caso contrário.
   */
  validate(): boolean {
    if (!this.to || this.to.trim().length === 0) {
      return false;
    }

    if (!this.subject || this.subject.trim().length === 0) {
      return false;
    }

    if (!this.html || this.html.trim().length === 0) {
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Valida apenas o primeiro e-mail se houver múltiplos
    const firstEmail = this.to.split(',')[0].trim();
    if (!emailRegex.test(firstEmail)) {
      return false;
    }

    // Validar anexos se existirem
    if (this.attachments && this.attachments.length > 0) {
      for (const attachment of this.attachments) {
        if (!attachment.validate()) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * @method addAttachment
   * @description Adiciona um novo anexo à lista de anexos do email.
   * O anexo só é adicionado se for válido.
   * @param {EmailAttachment} attachment - O anexo a ser adicionado.
   */
  addAttachment(attachment: EmailAttachment): void {
    const attachmentModel = EmailAttachmentModel.create(attachment);
    if (attachmentModel.validate()) {
      this.attachments = this.attachments || [];
      this.attachments.push(attachmentModel);
    }
  }

  /**
   * @method removeAttachment
   * @description Remove um anexo da lista pelo nome do arquivo.
   * @param {string} filename - O nome do arquivo do anexo a ser removido.
   * @returns {boolean} `true` se um anexo foi removido, `false` caso contrário.
   */
  removeAttachment(filename: string): boolean {
    if (!this.attachments) return false;
    
    const initialLength = this.attachments.length;
    this.attachments = this.attachments.filter(att => att.filename !== filename);
    
    return this.attachments.length < initialLength;
  }

  /**
   * @method getAttachmentsCount
   * @description Retorna a quantidade de anexos no email.
   * @returns {number} O número de anexos.
   */
  getAttachmentsCount(): number {
    return this.attachments?.length || 0;
  }
}

export class EmailAttachmentModel implements EmailAttachment {
  constructor(
    public filename: string,
    public content?: Buffer,
    public path?: string,
    public contentType?: string
  ) {}

  static create(attachment: EmailAttachment): EmailAttachmentModel {
    return new EmailAttachmentModel(
      attachment.filename,
      attachment.content,
      attachment.path,
      attachment.contentType
    );
  }

  validate(): boolean {
    if (!this.filename || this.filename.trim().length === 0) {
      return false;
    }

    // Deve ter pelo menos content ou path
    if (!this.content && !this.path) {
      return false;
    }

    // Se tiver path, deve ser uma string válida
    if (this.path && this.path.trim().length === 0) {
      return false;
    }

    return true;
  }

  getContentType(): string {
    if (this.contentType) {
      return this.contentType;
    }

    // Inferir content type baseado na extensão do arquivo
    const extension = this.filename.split(".").pop()?.toLowerCase();

    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      txt: "text/plain",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      zip: "application/zip",
      rar: "application/x-rar-compressed",
    };

    return mimeTypes[extension || ""] || "application/octet-stream";
  }
}
