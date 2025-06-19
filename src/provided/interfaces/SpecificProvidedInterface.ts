import { SMTPConfig, EmailData } from "../../internal/models";

/**
 * @interface SpecificProvidedInterface
 * @description Define o contrato público (interface provida) para o componente de email.
 * Clientes que utilizam este componente interagem através dos métodos definidos aqui.
 * Conceitualmente, estende a `ProvidedInterface` do Padrão de Interface de Componente.
 */
export interface SpecificProvidedInterface {
  /**
   * @method configureSMTP
   * @description Assinatura do método para configurar o serviço SMTP.
   * @param {SMTPConfig} smtp - O objeto de configuração SMTP.
   * @returns {void}
   */
  configureSMTP(smtp: SMTPConfig): void;

  /**
   * @method send
   * @description Assinatura do método para enviar um email.
   * @param {EmailData} mail - O objeto com os dados do email.
   * @returns {Promise<void>}
   */
  send(mail: EmailData): Promise<void>;
}
