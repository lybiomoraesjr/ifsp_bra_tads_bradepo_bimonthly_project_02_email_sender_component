import { InterfacePort } from "@lybioit/component-interface-pattern";
import { EmailData, SMTPConfig } from "../internal/models";
import { SpecificProvidedInterface } from "./interfaces/SpecificProvidedInterface";
import { EmailService } from "../internal/EmailService";

/**
 * @class ConcreteInterfacePort
 * @description Implementa a porta de interface do componente de email.
 * Esta classe serve como um adaptador que conecta a interface pública
 * (`SpecificProvidedInterface`) com a lógica de negócio interna (`EmailService`).
 * @extends {InterfacePort}
 * @implements {SpecificProvidedInterface}
 */
export class ConcreteInterfacePort
  extends InterfacePort
  implements SpecificProvidedInterface
{
  /**
   * @private
   * @type {EmailService}
   * @description Instância do serviço interno de email que contém a lógica de negócio.
   */
  private emailService: EmailService;

  /**
   * @constructor
   * @param {string} id - O identificador único para esta porta de interface.
   */
  constructor(id: string) {
    super();
    this.id = id;
    this.emailService = new EmailService();
    this.initialize();
  }

  /**
   * @method initialize
   * @description Inicializa a porta de interface, logando sua criação.
   * @override
   */
  initialize(): void {
    console.log(`Email Interface Port initialized with ID: ${this.id}`);
  }

  /**
   * @method configureSMTP
   * @description Expõe a funcionalidade de configurar o serviço SMTP.
   * Delega a chamada para o `EmailService` interno.
   * @param {SMTPConfig} smtp - O objeto de configuração SMTP.
   */
  configureSMTP(smtp: SMTPConfig): void {
    this.emailService.configureSMTP(smtp);
  }

  /**
   * @method send
   * @description Expõe a funcionalidade de enviar um email.
   * Delega a chamada para o `EmailService` interno.
   * @param {EmailData} mail - O objeto com os dados do email a ser enviado.
   * @returns {Promise<void>}
   */
  async send(mail: EmailData): Promise<void> {
    await this.emailService.sendEmail(mail);
  }
}
