/**
 * @interface SMTPConfig
 * @description Define a estrutura para as configurações de um servidor SMTP.
 */
export interface SMTPConfig {
  /** @type {string} O host do servidor SMTP (ex: smtp.gmail.com). */
  host: string;
  /** @type {number} A porta do servidor SMTP (ex: 587 ou 465). */
  port: number;
  /** @type {string} O nome de usuário para autenticação no servidor. */
  user: string;
  /** @type {string} A senha para autenticação no servidor. */
  pass: string;
}

/**
 * @class SMTPConfigModel
 * @description Implementação do modelo de configuração SMTP.
 * Inclui métodos para criação e validação dos dados de configuração.
 * @implements {SMTPConfig}
 */
export class SMTPConfigModel implements SMTPConfig {
  /**
   * @constructor
   * @param {string} host
   * @param {number} port
   * @param {string} user
   * @param {string} pass
   */
  constructor(
    public host: string,
    public port: number,
    public user: string,
    public pass: string
  ) {}

  /**
   * @static
   * @method create
   * @description Cria uma nova instância de SMTPConfigModel a partir de um objeto de configuração.
   * @param {SMTPConfig} config - O objeto de configuração.
   * @returns {SMTPConfigModel}
   */
  static create(config: SMTPConfig): SMTPConfigModel {
    return new SMTPConfigModel(
      config.host,
      config.port,
      config.user,
      config.pass
    );
  }

  /**
   * @method validate
   * @description Valida se a configuração SMTP é válida.
   * Verifica se os campos não estão vazios e se a porta está em um intervalo válido.
   * @returns {boolean} `true` se a configuração for válida, `false` caso contrário.
   */
  validate(): boolean {
    return (
      this.host.length > 0 &&
      this.port > 0 &&
      this.port <= 65535 &&
      this.user.length > 0 &&
      this.pass.length > 0
    );
  }
}
