import { SMTPConfigModel } from '../../../src/internal/models';

/**
 * @describe SMTPConfigModel
 * @description Suíte de testes para o modelo SMTPConfigModel.
 * Garante que a criação e a validação do modelo de configuração SMTP
 * funcionem conforme o esperado.
 */
describe('SMTPConfigModel', () => {
  it('deve criar um modelo válido com dados corretos', () => {
    const config = {
      host: 'smtp.example.com',
      port: 587,
      user: 'user@example.com',
      pass: 'password',
    };
    const model = SMTPConfigModel.create(config);
    expect(model).toBeInstanceOf(SMTPConfigModel);
    expect(model.validate()).toBe(true);
  });

  it('deve invalidar uma configuração com host vazio', () => {
    const config = { host: '', port: 587, user: 'user', pass: 'pass' };
    const model = SMTPConfigModel.create(config);
    expect(model.validate()).toBe(false);
  });

  it('deve invalidar uma configuração com porta inválida (zero)', () => {
    const config = { host: 'smtp.example.com', port: 0, user: 'user', pass: 'pass' };
    const model = SMTPConfigModel.create(config);
    expect(model.validate()).toBe(false);
  });

  it('deve invalidar uma configuração com usuário vazio', () => {
    const config = { host: 'smtp.example.com', port: 587, user: '', pass: 'pass' };
    const model = SMTPConfigModel.create(config);
    expect(model.validate()).toBe(false);
  });

  it('deve invalidar uma configuração com senha vazia', () => {
    const config = { host: 'smtp.example.com', port: 587, user: 'user', pass: '' };
    const model = SMTPConfigModel.create(config);
    expect(model.validate()).toBe(false);
  });
}); 