import {
  EmailDataModel,
  EmailAttachmentModel,
} from "../../../src/internal/models";

/**
 * @describe EmailDataModel
 * @description Suíte de testes para o modelo EmailDataModel.
 * Valida a criação, as regras de negócio e a manipulação de anexos
 * para os dados de um email.
 */
describe("EmailDataModel", () => {
  const validEmailData = {
    to: "test@example.com",
    subject: "Test Subject",
    html: "<p>Test content</p>",
    data: {
      nome: "Test User",
      mensagem: "Test message",
    },
  };

  /**
   * @describe creation
   * @description Testa a instanciação do modelo.
   */
  describe("creation", () => {
    it("deve criar um EmailDataModel válido", () => {
      const model = EmailDataModel.create(validEmailData);
      expect(model).toBeInstanceOf(EmailDataModel);
      expect(model.validate()).toBe(true);
    });

    it("deve criar um EmailDataModel com anexos", () => {
      const dataWithAttachments = {
        ...validEmailData,
        attachments: [
          {
            filename: "test.txt",
            content: Buffer.from("test"),
            contentType: "text/plain",
          },
        ],
      };
      const model = EmailDataModel.create(dataWithAttachments);
      expect(model.attachments).toHaveLength(1);
      expect(model.attachments![0]).toBeInstanceOf(EmailAttachmentModel);
    });
  });

  /**
   * @describe validation
   * @description Testa as regras de validação do modelo.
   */
  describe("validation", () => {
    it("deve invalidar com campo 'to' vazio", () => {
      const model = EmailDataModel.create({ ...validEmailData, to: "" });
      expect(model.validate()).toBe(false);
    });

    it("deve invalidar com formato de email inválido", () => {
      const model = EmailDataModel.create({
        ...validEmailData,
        to: "invalid-email",
      });
      expect(model.validate()).toBe(false);
    });

    it("deve invalidar com 'subject' vazio", () => {
      const model = EmailDataModel.create({ ...validEmailData, subject: "" });
      expect(model.validate()).toBe(false);
    });

    it("deve invalidar com 'html' vazio", () => {
      const model = EmailDataModel.create({ ...validEmailData, html: "" });
      expect(model.validate()).toBe(false);
    });

    it("deve validar mesmo sem o campo opcional 'data'", () => {
      const { data, ...dataWithoutTemplateData } = validEmailData;
      const model = EmailDataModel.create(dataWithoutTemplateData);
      expect(model.validate()).toBe(true);
    });
  });

  /**
   * @describe attachment management
   * @description Testa a adição e remoção de anexos.
   */
  describe("attachment management", () => {
    it("deve adicionar um anexo válido", () => {
      const model = EmailDataModel.create(validEmailData);
      model.addAttachment({
        filename: "test.txt",
        content: Buffer.from("test"),
      });
      expect(model.getAttachmentsCount()).toBe(1);
    });

    it("não deve adicionar um anexo inválido", () => {
      const model = EmailDataModel.create(validEmailData);
      // Anexo inválido (sem nome de arquivo)
      model.addAttachment({
        filename: "",
        content: Buffer.from("test"),
      });
      expect(model.getAttachmentsCount()).toBe(0);
    });

    it("deve remover um anexo pelo nome do arquivo", () => {
      const model = EmailDataModel.create({
        ...validEmailData,
        attachments: [
          {
            filename: "test.txt",
            content: Buffer.from("test"),
          },
        ],
      });
      expect(model.removeAttachment("test.txt")).toBe(true);
      expect(model.getAttachmentsCount()).toBe(0);
    });

    it("deve retornar false ao tentar remover um anexo que não existe", () => {
      const model = EmailDataModel.create(validEmailData);
      expect(model.removeAttachment("non-existent.txt")).toBe(false);
    });
  });
}); 