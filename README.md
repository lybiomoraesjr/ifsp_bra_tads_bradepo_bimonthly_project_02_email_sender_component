# Componente de Envio de Email

Projeto desenvolvido para a disciplina de **Desenvolvimento de Componentes (BRADEPO)** do curso de Tecnologia em Análise e Desenvolvimento de Sistemas do IFSP - Campus Bragança Paulista.

- **Aluno:** Lybio Moraes Junior
- **Prontuário:** BP303934X
- **Professor:** Luiz Gustavo Diniz de Oliveira Véras

---

## 1. Descrição do Componente

Este projeto consiste em um componente de software para envio de emails, desenvolvido em TypeScript. Ele abstrai a complexidade do envio de emails transacionais, oferecendo uma interface simples e robusta para configurar um servidor SMTP e enviar mensagens.

Seu principal recurso é o suporte a templates dinâmicos com **Handlebars**, permitindo que qualquer variável seja injetada no corpo do email para personalização completa, além do suporte a múltiplos anexos.

O componente foi projetado seguindo o **Padrão de Interface de Componente** e os princípios **SOLID**, garantindo baixo acoplamento, alta coesão e reutilização.

## 2. Atendimento aos Critérios de Avaliação

A seguir, é detalhado como o desenvolvimento deste componente atendeu aos critérios de avaliação individuais definidos no plano de ensino.

### CR3: Implementação do Padrão de Interface de Componente (1,5 pontos)

O Padrão de Interface de Componente foi a principal diretriz arquitetural do projeto. Para facilitar a implementação e garantir a conformidade com a metodologia **Beyond**, utilizei o pacote [`@lybioit/component-interface-pattern`](https://www.npmjs.com/package/@lybioit/component-interface-pattern), que fornece as abstrações necessárias (`InterfacePort`).

- **`provided/ConcreteInterfacePort.ts`**: Implementa a porta de interface, expondo as funcionalidades públicas do componente (`configureSMTP` e `send`).
- **`provided/interfaces/SpecificProvidedInterface.ts`**: Define o contrato público (interface provida) que os clientes do componente utilizarão.
- **`internal/`**: Contém toda a lógica interna e complexa, que permanece oculta para o cliente, garantindo o encapsulamento.

### CR4: Aplicação dos Princípios SOLID (3,0 pontos)

Pelo menos três princípios SOLID foram aplicados na arquitetura interna do componente:

1.  **Princípio da Responsabilidade Única (SRP)**: Cada classe tem uma responsabilidade bem definida.
    -   `EmailService`: Orquestra o envio de emails.
    -   `SMTPConfigModel`: Modela e valida os dados de configuração do SMTP.
    -   `EmailDataModel`: Modela e valida os dados de um email (destinatário, assunto, etc.).
    -   `EmailAttachmentModel`: Modela e valida os anexos.

2.  **Princípio do Aberto/Fechado (OCP)**: O componente é aberto para extensão, mas fechado para modificação. O uso de um objeto `data` genérico (`Record<string, unknown>`) para os templates permite a inserção de qualquer dado dinâmico sem a necessidade de modificar as interfaces do componente, apenas o template.

3.  **Princípio da Inversão de Dependência (DIP)**: O componente depende de abstrações, não de implementações concretas. O `EmailService` depende das interfaces (`SMTPConfig`, `EmailData`) em vez de classes concretas, e o cliente do componente depende da `SpecificProvidedInterface`, não da implementação interna do serviço.

### CR5: Uso de Sistema de Build e Deploy (1,5 pontos)

-   **Gerenciador de Dependências e Build**: O projeto utiliza **NPM** para gerenciamento de pacotes e **TypeScript (`tsc`)** como sistema de build. O script `npm run build` transpila o código TypeScript para JavaScript no diretório `dist/`, que é o artefato pronto para distribuição.
-   **Publicação em Repositório**: O componente foi publicado no **NPM Repository**, um serviço de hospedagem de módulos público, e está disponível para instalação através do comando:
    ```bash
    npm install @lybioit/email-sender-component
    ```

### CR6: Realização de Testes (1,0 ponto)

O componente possui uma suíte de testes unitários robusta para validar seu funcionamento.
-   **Ferramenta de Teste**: **Jest** foi utilizado para a criação e execução dos testes.
-   **Cobertura**: Foram criados testes para todos os elementos internos:
    -   `EmailService.test.ts`: Testa a lógica de envio, tratamento de templates, anexos e erros.
    -   `SMTPConfig.test.ts`: Valida a criação e as regras do modelo de configuração.
    -   `EmailData.test.ts`: Valida a criação e as regras do modelo de dados do email.
    -   `EmailAttachment.test.ts`: Valida a criação e as regras do modelo de anexos.
-   **Execução**: Os testes podem ser executados com o comando `npm test`.

---

## 3. Como Usar o Componente

### Instalação
```bash
npm install @lybioit/email-sender-component
```

### Exemplo de Uso
```typescript
import { EmailService, SMTPConfig, EmailData } from '@lybioit/email-sender-component';

// 1. Configure o SMTP
const smtpConfig: SMTPConfig = {
  host: 'smtp.example.com',
  port: 587,
  user: 'seu-email@example.com',
  pass: 'sua-senha'
};

// 2. Crie os dados do email
const emailData: EmailData = {
  to: 'destinatario@example.com',
  subject: 'Assunto do Email',
  html: '<b>Olá!</b>', // Conteúdo base, ignorado se um template for usado.
  // O objeto 'data' contém as variáveis que serão injetadas no seu template Handlebars.
  data: { 
    nome: 'John Doe',
    mensagem: 'Esta é uma mensagem de teste.',
    link: 'https://example.com'
  },
  attachments: [
    {
      filename: 'documento.pdf',
      path: './caminho/para/documento.pdf'
    }
  ]
};

// 3. Envie o email
async function enviar() {
  const service = new EmailService();
  service.configureSMTP(smtpConfig);
  
  try {
    // Para usar um template, passe o caminho do arquivo .hbs como segundo argumento.
    // O conteúdo HTML do email será gerado a partir do template.
    await service.sendEmail(emailData, 'caminho/para/seu/template.hbs');
    console.log('Email enviado com sucesso!');
  } catch (error) {
    console.error('Falha ao enviar email:', error);
  }
}

enviar();
```

### Exemplo de Template (`seu-template.hbs`)

Para que as variáveis do objeto `data` sejam injetadas, seu template Handlebars (`.hbs`) deve usar as chaves correspondentes. O conteúdo do seu arquivo de template poderia ser assim:

```html
<!DOCTYPE html>
<html>
<body>
  <h1>Olá, {{nome}}!</h1>
  <p>{{mensagem}}</p>
  <p>
    Para mais informações, <a href="{{link}}">clique aqui</a>.
  </p>
</body>
</html>
```

## 4. Licença

Este projeto está licenciado sob a licença **MIT**. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes. 