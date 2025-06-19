import { EmailAttachmentModel } from '../../../src/internal/models';

/**
 * @describe EmailAttachmentModel
 * @description Suíte de testes para o modelo EmailAttachmentModel.
 * Assegura que a criação, validação e detecção de tipo de conteúdo
 * para anexos de email funcionem corretamente.
 */
describe('EmailAttachmentModel', () => {
  /**
   * @describe creation
   * @description Testa a instanciação do modelo de anexo.
   */
  describe('creation', () => {
    it('should create a valid attachment with content', () => {
      const attachment = EmailAttachmentModel.create({
        filename: 'test.txt',
        content: Buffer.from('test content')
      });
      expect(attachment).toBeInstanceOf(EmailAttachmentModel);
      expect(attachment.validate()).toBe(true);
    });

    it('should create a valid attachment with path', () => {
      const attachment = EmailAttachmentModel.create({
        filename: 'test.txt',
        path: '/path/to/file.txt'
      });
      expect(attachment).toBeInstanceOf(EmailAttachmentModel);
      expect(attachment.validate()).toBe(true);
    });
  });

  /**
   * @describe validation
   * @description Testa as regras de validação para os dados do anexo.
   */
  describe('validation', () => {
    it('should invalidate empty filename', () => {
      const attachment = EmailAttachmentModel.create({
        filename: '',
        content: Buffer.from('test')
      });
      expect(attachment.validate()).toBe(false);
    });

    it('should invalidate attachment without content or path', () => {
      const attachment = EmailAttachmentModel.create({
        filename: 'test.txt'
      });
      expect(attachment.validate()).toBe(false);
    });

    it('should invalidate attachment with empty path', () => {
      const attachment = EmailAttachmentModel.create({
        filename: 'test.txt',
        path: ''
      });
      expect(attachment.validate()).toBe(false);
    });
  });

  /**
   * @describe content type detection
   * @description Testa a inferência automática de tipo MIME.
   */
  describe('content type detection', () => {
    it('should detect PDF content type', () => {
      const attachment = EmailAttachmentModel.create({
        filename: 'document.pdf',
        content: Buffer.from('test')
      });
      expect(attachment.getContentType()).toBe('application/pdf');
    });

    it('should detect image content types', () => {
      const jpgAttachment = EmailAttachmentModel.create({
        filename: 'photo.jpg',
        content: Buffer.from('test')
      });
      expect(jpgAttachment.getContentType()).toBe('image/jpeg');

      const pngAttachment = EmailAttachmentModel.create({
        filename: 'image.png',
        content: Buffer.from('test')
      });
      expect(pngAttachment.getContentType()).toBe('image/png');
    });

    it('should use provided content type', () => {
      const attachment = EmailAttachmentModel.create({
        filename: 'custom.file',
        content: Buffer.from('test'),
        contentType: 'application/custom'
      });
      expect(attachment.getContentType()).toBe('application/custom');
    });

    it('should default to octet-stream for unknown extensions', () => {
      const attachment = EmailAttachmentModel.create({
        filename: 'unknown.xyz',
        content: Buffer.from('test')
      });
      expect(attachment.getContentType()).toBe('application/octet-stream');
    });
  });
}); 