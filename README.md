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

## 2. Arquitetura do Componente

### Padrão de Interface de Componente

O componente utiliza o padrão de Interface de Componente através das seguintes classes:

#### **ConcreteComponentInterface**
- **Função**: Ponto de entrada principal e container do componente
- **Responsabilidade**: Gerencia todas as portas de interface disponíveis
- **Uso**: É a primeira classe que o cliente instancia para acessar o componente

```typescript
// Cliente cria uma instância do componente
const emailComponent = new ConcreteComponentInterface();

// Cliente acessa as funcionalidades através das portas
const emailPort = emailComponent.ports[0];
```

#### **ConcreteInterfacePort**
- **Função**: Porta de interface que expõe as funcionalidades do serviço de email
- **Responsabilidade**: Adapta a interface pública com a lógica interna
- **Métodos**: `configureSMTP()` e `send()`

```typescript
// Cliente usa a porta para configurar e enviar emails
emailPort.configureSMTP(smtpConfig);
await emailPort.send(emailData);
```

### Vantagens desta Arquitetura

1. **Encapsulamento**: A lógica interna (`EmailService`) fica oculta do cliente
2. **Flexibilidade**: Novas funcionalidades podem ser adicionadas através de novas portas
3. **Testabilidade**: Cada parte pode ser testada independentemente
4. **Reutilização**: O componente pode ser facilmente integrado em sistemas maiores

## 3. Atendimento aos Critérios de Avaliação

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
-   **Cobertura**: Foram criados testes para todos os elementos do componente:
    -   `tests/provided/ComponentInterface.test.ts`: Testa o padrão de Interface de Componente, validando o uso correto do `ConcreteComponentInterface` e `ConcreteInterfacePort`.
    -   `tests/internal/models/SMTPConfig.test.ts`: Valida a criação e as regras do modelo de configuração.
    -   `tests/internal/models/EmailData.test.ts`: Valida a criação e as regras do modelo de dados do email.
    -   `tests/internal/models/EmailAttachment.test.ts`: Valida a criação e as regras do modelo de anexos.
-   **Execução**: Os testes podem ser executados com o comando `npm test`.

---

## 4. Como Usar o Componente

### Instalação
```bash
npm install @lybioit/email-sender-component
```

### Exemplo de Uso
```typescript
import { 
  ConcreteComponentInterface, 
  SMTPConfig, 
  EmailData 
} from '@lybioit/email-sender-component';

// 1. Crie uma instância do componente
const emailComponent = new ConcreteComponentInterface();

// 2. Obtenha a porta de interface (primeira porta disponível)
const emailPort = emailComponent.ports[0];

// 3. Configure o SMTP
const smtpConfig: SMTPConfig = {
  host: 'smtp.example.com',
  port: 587,
  user: 'seu-email@example.com',
  pass: 'sua-senha'
};

emailPort.configureSMTP(smtpConfig);

// 4. Crie os dados do email
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

// 5. Envie o email
async function enviar() {
  try {
    // Para usar um template, passe o caminho do arquivo .hbs como segundo argumento.
    // O conteúdo HTML do email será gerado a partir do template.
    await emailPort.send(emailData);
    console.log('Email enviado com sucesso!');
  } catch (error) {
    console.error('Falha ao enviar email:', error);
  }
}

enviar();
```

### Uso Alternativo (Obtendo Porta por ID)
```typescript
// Se você souber o ID específico da porta
const emailPort = emailComponent.getPort('emailService');

// Ou verificar todas as portas disponíveis
console.log('Portas disponíveis:', emailComponent.ports.map(p => p.id));
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

## 5. Licença

Este projeto está licenciado sob a licença **MIT**. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes. 