import { ComponentInterface } from "@lybioit/component-interface-pattern";
import { ConcreteInterfacePort } from "./ConcreteInterfacePort";

/**
 * @class ConcreteComponentInterface
 * @description Representa a implementação concreta da interface do componente.
 * É responsável por inicializar e gerenciar as portas de interface.
 * Esta classe atua como o ponto de entrada principal para o componente,
 * agregando todas as suas portas de comunicação.
 * @extends {ComponentInterface}
 */
export class ConcreteComponentInterface extends ComponentInterface {
  /**
   * @constructor
   * Cria uma instância de ConcreteComponentInterface.
   */
  constructor() {
    super();
    this.initialize();
  }

  /**
   * @method initialize
   * @description Inicializa o componente, criando e configurando suas portas de interface.
   * Neste caso, cria uma única porta (`ConcreteInterfacePort`) para o serviço de email.
   * @override
   */
  initialize(): void {
    const id = "emailService";

    const port: ConcreteInterfacePort = new ConcreteInterfacePort(id);

    this.ports.push(port);
  }
}
