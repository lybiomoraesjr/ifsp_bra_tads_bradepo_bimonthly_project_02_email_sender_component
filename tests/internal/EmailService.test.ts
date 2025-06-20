import { EmailService } from '../../src/internal/EmailService';
import { SMTPConfig, EmailData } from '../../src/internal/models';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';

// Criamos uma função de mock persistente para sendMail.
const mockSendMail = jest.fn().mockImplementation((mailOptions) => {
  // Simula um erro se o email for para 'error@example.com'
  if (mailOptions.to === 'error@example.com') {
    return Promise.reject(new Error('Failed to send email'));
  }
  return Promise.resolve({ messageId: 'test-message-id' });
});

// Mock global do nodemailer para evitar chamadas de rede reais durante os testes.
jest.mock('nodemailer', () => ({
  // Fazemos com que createTransport sempre retorne o mesmo objeto mock.
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
  })),
}));

/**
 * @describe EmailService
 * @description Suíte de testes para a classe EmailService.
 * Valida todos os aspectos do serviço, desde a configuração até o envio de emails,
 * incluindo o tratamento de templates e erros.
 */
describe('EmailService', () => {
  const mockSMTPConfig: SMTPConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    user: 'test@example.com',
    pass: 'password123'
  };

  const mockEmailData: EmailData = {
    to: 'recipient@example.com',
    subject: 'Test Email',
    html: '<p>This is a test email</p>',
    data: {
      nome: 'Usuário',
      mensagem: 'Mensagem de teste',
      link: 'https://exemplo.com'
    }
  };

  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService();
    jest.clearAllMocks();
  });

  /**
   * @describe constructor
   * @description Testa a inicialização do EmailService.
   */
  describe('constructor', () => {
    it('should create EmailService without SMTP config', () => {
      expect(emailService).toBeInstanceOf(EmailService);
      expect(emailService.isConfigured()).toBe(false);
    });

    it('should create EmailService with SMTP config', () => {
      const serviceWithConfig = new EmailService(mockSMTPConfig);
      expect(serviceWithConfig.isConfigured()).toBe(true);
    });
  });

  /**
   * @describe configureSMTP
   * @description Testa a lógica de configuração do cliente SMTP.
   */
  describe('configureSMTP', () => {
    it('should configure SMTP successfully', () => {
      emailService.configureSMTP(mockSMTPConfig);
      expect(emailService.isConfigured()).toBe(true);
      expect(emailService.getSMTPConfig()).toBeDefined();
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: mockSMTPConfig.host,
        port: mockSMTPConfig.port,
        secure: false,
        auth: {
          user: mockSMTPConfig.user,
          pass: mockSMTPConfig.pass,
        },
      });
    });

    it('should configure SMTP with secure connection for port 465', () => {
      const secureConfig = { ...mockSMTPConfig, port: 465 };
      emailService.configureSMTP(secureConfig);
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: secureConfig.host,
        port: secureConfig.port,
        secure: true,
        auth: {
          user: secureConfig.user,
          pass: secureConfig.pass,
        },
      });
    });

    it('should throw error for invalid SMTP config', () => {
      const invalidConfig: SMTPConfig = {
        host: '',
        port: 0,
        user: '',
        pass: ''
      };

      expect(() => emailService.configureSMTP(invalidConfig)).toThrow('Invalid SMTP configuration');
    });
  });

  /**
   * @describe sendEmail
   * @description Testa a funcionalidade principal de envio de emails.
   */
  describe('sendEmail', () => {
    beforeEach(() => {
      emailService.configureSMTP(mockSMTPConfig);
    });

    it('should send email successfully with default template (base.hbs)', async () => {
      await expect(emailService.sendEmail(mockEmailData)).resolves.not.toThrow();
      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        from: mockSMTPConfig.user,
        to: mockEmailData.to,
        subject: mockEmailData.subject
      }));
    });

    it('should send email to multiple recipients', async () => {
      const multipleRecipients = {
        ...mockEmailData,
        to: 'recipient1@example.com, recipient2@example.com'
      };
      await expect(emailService.sendEmail(multipleRecipients)).resolves.not.toThrow();
      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: multipleRecipients.to
      }));
    });

    it('should send email with custom template and verify template data', async () => {
      const customTemplatePath = path.resolve(__dirname, 'custom_template.hbs');
      const customTemplateContent = '<h1>Olá, {{nome}}!</h1><div>{{mensagem}}</div><a href="{{link}}">Link</a>';
      fs.writeFileSync(customTemplatePath, customTemplateContent);
      
      const emailWithData: EmailData = {
        ...mockEmailData,
        data: {
          nome: 'John Doe',
          mensagem: 'Test Message',
          link: 'https://test.com'
        }
      };

      await emailService.sendEmail(emailWithData, customTemplatePath);
      
      const sentMailOptions = mockSendMail.mock.calls[0][0];
      
      expect(sentMailOptions.html).toContain('Olá, John Doe!');
      expect(sentMailOptions.html).toContain('Test Message');
      expect(sentMailOptions.html).toContain('https://test.com');
      
      fs.unlinkSync(customTemplatePath);
    });

    it('should throw error when template file not found', async () => {
      await expect(
        emailService.sendEmail(mockEmailData, 'non-existent-template.hbs')
      ).rejects.toThrow('Template file not found');
    });

    it('should throw error when SMTP not configured', async () => {
      const unconfiguredService = new EmailService();
      await expect(unconfiguredService.sendEmail(mockEmailData))
        .rejects.toThrow('SMTP not configured');
    });

    it('should throw error for invalid email data', async () => {
      const invalidEmail: EmailData = {
        to: 'invalid-email',
        subject: '',
        html: ''
      };

      await expect(emailService.sendEmail(invalidEmail))
        .rejects.toThrow('Invalid email data');
    });

    it('should handle email sending failure', async () => {
      const failingEmail: EmailData = {
        ...mockEmailData,
        to: 'error@example.com'
      };

      await expect(emailService.sendEmail(failingEmail))
        .rejects.toThrow('Failed to send email');
    });

    it('should send email with attachments', async () => {
      const emailWithAttachments: EmailData = {
        ...mockEmailData,
        attachments: [
          {
            filename: 'test.pdf',
            content: Buffer.from('test content'),
            contentType: 'application/pdf'
          }
        ]
      };

      await emailService.sendEmail(emailWithAttachments);
      
      const sentMailOptions = mockSendMail.mock.calls[0][0];
      
      expect(sentMailOptions.attachments).toHaveLength(1);
      expect(sentMailOptions.attachments[0]).toEqual(expect.objectContaining({
        filename: 'test.pdf',
        content: expect.any(Buffer),
        contentType: 'application/pdf'
      }));
    });
  });

  /**
   * @describe template management
   * @description Testa a gestão de templates padrão.
   */
  describe('template management', () => {
    beforeEach(() => {
      emailService.configureSMTP(mockSMTPConfig);
    });

    it('should set and get default template path', () => {
      const customTemplatePath = path.resolve(__dirname, 'custom_template.hbs');
      emailService.setDefaultTemplatePath(customTemplatePath);
      expect(emailService.getDefaultTemplatePath()).toBe(customTemplatePath);
    });

    it('should use default template when no custom template is provided', async () => {
      const defaultTemplatePath = path.resolve(__dirname, '../..', 'src/internal/templates/base.hbs');
      expect(fs.existsSync(defaultTemplatePath)).toBe(true);
      
      await expect(emailService.sendEmail(mockEmailData)).resolves.not.toThrow();
    });
  });
}); 