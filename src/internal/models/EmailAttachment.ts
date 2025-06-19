/**
 * @interface EmailAttachment
 * @description Define a estrutura para um anexo de email.
 * Um anexo pode ser especificado por seu conteúdo em `Buffer` ou pelo caminho do arquivo.
 */
export interface EmailAttachment {
  /** @type {string} O nome do arquivo do anexo (ex: "relatorio.pdf"). */
  filename: string;
  /** @type {Buffer | undefined} O conteúdo do arquivo como um Buffer. */
  content?: Buffer;
  /** @type {string | undefined} O caminho para o arquivo no sistema de arquivos. */
  path?: string;
  /** @type {string | undefined} O tipo MIME do conteúdo (ex: "application/pdf"). Se não for fornecido, será inferido. */
  contentType?: string;
}

/**
 * @class EmailAttachmentModel
 * @description Implementação do modelo de anexo de email.
 * Inclui métodos para criação, validação e inferência do tipo de conteúdo.
 * @implements {EmailAttachment}
 */
export class EmailAttachmentModel implements EmailAttachment {
  /**
   * @constructor
   * @param {string} filename
   * @param {Buffer | undefined} content
   * @param {string | undefined} path
   * @param {string | undefined} contentType
   */
  constructor(
    public filename: string,
    public content?: Buffer,
    public path?: string,
    public contentType?: string
  ) {}

  /**
   * @static
   * @method create
   * @description Cria uma nova instância de EmailAttachmentModel a partir de um objeto de anexo.
   * @param {EmailAttachment} attachment - O objeto de anexo.
   * @returns {EmailAttachmentModel}
   */
  static create(attachment: EmailAttachment): EmailAttachmentModel {
    return new EmailAttachmentModel(
      attachment.filename,
      attachment.content,
      attachment.path,
      attachment.contentType
    );
  }

  /**
   * @method validate
   * @description Valida o anexo.
   * Garante que o nome do arquivo seja fornecido e que `content` ou `path` existam.
   * @returns {boolean} `true` se o anexo for válido, `false` caso contrário.
   */
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

  /**
   * @method getContentType
   * @description Obtém o tipo MIME do anexo.
   * Se um `contentType` foi fornecido, ele é retornado.
   * Caso contrário, infere o tipo MIME com base na extensão do arquivo.
   * @returns {string} O tipo MIME do anexo.
   */
  getContentType(): string {
    if (this.contentType) {
      return this.contentType;
    }

    // Inferir content type baseado na extensão do arquivo
    const extension = this.filename.split('.').pop()?.toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed'
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }
}
