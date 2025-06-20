import { ConcreteComponentInterface } from '../../src/provided/ConcreteComponentInterface';
import { ConcreteInterfacePort } from '../../src/provided/ConcreteInterfacePort';
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
 * @describe Componente de Email - Padrão de Interface de Componente
 * @description Suíte de testes para o componente de email seguindo o padrão de Interface de Componente.
 * Valida o uso correto do ConcreteComponentInterface e ConcreteInterfacePort,
 * testando a funcionalidade através das portas de interface em vez da implementação interna.
 */
describe('Componente de Email - Padrão de Interface de Componente', () => {
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

  let emailComponent: ConcreteComponentInterface;
  let emailPort: ConcreteInterfacePort;

  beforeEach(() => {
    emailComponent = new ConcreteComponentInterface();
    emailPort = emailComponent.getPort('emailService') as ConcreteInterfacePort;
    jest.clearAllMocks();
  });

  /**
   * @describe ConcreteComponentInterface
   * @description Testa a inicialização e configuração do componente principal.
   */
  describe('ConcreteComponentInterface', () => {
    it('should create component interface successfully', () => {
      expect(emailComponent).toBeInstanceOf(ConcreteComponentInterface);
    });

    it('should have email service port available', () => {
      const port = emailComponent.getPort('emailService');
      expect(port).toBeDefined();
      expect(port).toBeInstanceOf(ConcreteInterfacePort);
    });

    it('should return correct port by ID', () => {
      const port = emailComponent.getPort('emailService');
      expect(port).toBeInstanceOf(ConcreteInterfacePort);
    });

    it('should return undefined for non-existent port ID', () => {
      const nonExistentPort = emailComponent.getPort('non-existent');
      expect(nonExistentPort).toBeUndefined();
    });
  });

  /**
   * @describe ConcreteInterfacePort
   * @description Testa a porta de interface e seus métodos públicos.
   */
  describe('ConcreteInterfacePort', () => {
    it('should create interface port successfully', () => {
      expect(emailPort).toBeInstanceOf(ConcreteInterfacePort);
    });

    it('should initialize port successfully', () => {
      // Verifica se a porta foi inicializada (não deve lançar erro)
      expect(() => emailPort.initialize()).not.toThrow();
    });
  });

  /**
   * @describe configureSMTP via Porta
   * @description Testa a configuração SMTP através da porta de interface.
   */
  describe('configureSMTP via Porta de Interface', () => {
    it('should configure SMTP successfully through port', () => {
      expect(() => emailPort.configureSMTP(mockSMTPConfig)).not.toThrow();
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
      emailPort.configureSMTP(secureConfig);
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

    it('should throw error for invalid SMTP config through port', () => {
      const invalidConfig: SMTPConfig = {
        host: '',
        port: 0,
        user: '',
        pass: ''
      };

      expect(() => emailPort.configureSMTP(invalidConfig)).toThrow('Invalid SMTP configuration');
    });
  });

  /**
   * @describe send via Porta
   * @description Testa o envio de emails através da porta de interface.
   */
  describe('send via Porta de Interface', () => {
    beforeEach(() => {
      emailPort.configureSMTP(mockSMTPConfig);
    });

    it('should send email successfully through port with default template', async () => {
      await expect(emailPort.send(mockEmailData)).resolves.not.toThrow();
      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        from: mockSMTPConfig.user,
        to: mockEmailData.to,
        subject: mockEmailData.subject
      }));
    });

    it('should send email to multiple recipients through port', async () => {
      const multipleRecipients = {
        ...mockEmailData,
        to: 'recipient1@example.com, recipient2@example.com'
      };
      await expect(emailPort.send(multipleRecipients)).resolves.not.toThrow();
      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: multipleRecipients.to
      }));
    });

    it('should send email with custom template through port', async () => {
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

      await emailPort.send(emailWithData);
      
      const sentMailOptions = mockSendMail.mock.calls[0][0];
      
      expect(sentMailOptions.html).toContain('Olá, John Doe!');
      expect(sentMailOptions.html).toContain('Test Message');
      expect(sentMailOptions.html).toContain('https://test.com');
      
      fs.unlinkSync(customTemplatePath);
    });

    it('should throw error when SMTP not configured through port', async () => {
      const unconfiguredComponent = new ConcreteComponentInterface();
      const unconfiguredPort = unconfiguredComponent.getPort('emailService') as ConcreteInterfacePort;
      
      await expect(unconfiguredPort.send(mockEmailData))
        .rejects.toThrow('SMTP not configured');
    });

    it('should throw error for invalid email data through port', async () => {
      const invalidEmail: EmailData = {
        to: 'invalid-email',
        subject: '',
        html: ''
      };

      await expect(emailPort.send(invalidEmail))
        .rejects.toThrow('Invalid email data');
    });

    it('should handle email sending failure through port', async () => {
      const failingEmail: EmailData = {
        ...mockEmailData,
        to: 'error@example.com'
      };

      await expect(emailPort.send(failingEmail))
        .rejects.toThrow('Failed to send email');
    });
  });

  /**
   * @describe Uso Completo do Componente
   * @description Testa o fluxo completo de uso do componente seguindo o padrão.
   */
  describe('Uso Completo do Componente', () => {
    it('should complete full email workflow through component interface', async () => {
      // 1. Criar componente
      const component = new ConcreteComponentInterface();
      
      // 2. Obter porta
      const port = component.getPort('emailService') as ConcreteInterfacePort;
      
      // 3. Configurar SMTP
      port.configureSMTP(mockSMTPConfig);
      
      // 4. Enviar email
      await expect(port.send(mockEmailData)).resolves.not.toThrow();
      
      // 5. Verificar que foi enviado
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        from: mockSMTPConfig.user,
        to: mockEmailData.to,
        subject: mockEmailData.subject
      }));
    });
  });
}); 