import { InterfacePort } from "@lybioit/component-interface-pattern";
import { EmailData, SMTPConfig } from "../internal/models";
import { SpecificProvidedInterface } from "./interfaces/SpecificProvidedInterface";
import { EmailService } from "../internal/EmailService";

export class ConcreteInterfacePort
  extends InterfacePort
  implements SpecificProvidedInterface
{
  private emailService: EmailService;

  constructor(id: string) {
    super();
    this.id = id;
    this.emailService = new EmailService();
    this.initialize();
  }

  initialize(): void {
    console.log(`Email Interface Port initialized with ID: ${this.id}`);
  }

  configureSMTP(smtp: SMTPConfig): void {
    this.emailService.configureSMTP(smtp);
  }

  async send(mail: EmailData): Promise<void> {
    await this.emailService.sendEmail(mail);
  }
}
