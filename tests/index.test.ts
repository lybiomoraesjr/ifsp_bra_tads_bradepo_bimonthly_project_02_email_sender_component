import { soma, validarEmail, calcularMedia } from '../src/index';

describe('Funções Matemáticas', () => {
  describe('soma', () => {
    it('deve somar dois números positivos', () => {
      expect(soma(2, 3)).toBe(5);
    });

    it('deve somar números negativos', () => {
      expect(soma(-1, -2)).toBe(-3);
    });

    it('deve somar zero', () => {
      expect(soma(5, 0)).toBe(5);
    });
  });

  describe('calcularMedia', () => {
    it('deve calcular a média de números positivos', () => {
      expect(calcularMedia([1, 2, 3, 4, 5])).toBe(3);
    });

    it('deve retornar 0 para array vazio', () => {
      expect(calcularMedia([])).toBe(0);
    });

    it('deve calcular a média de números negativos', () => {
      expect(calcularMedia([-1, -2, -3])).toBe(-2);
    });
  });
});

describe('Validação de Email', () => {
  describe('validarEmail', () => {
    it('deve validar email correto', () => {
      expect(validarEmail('teste@exemplo.com')).toBe(true);
    });

    it('deve rejeitar email sem @', () => {
      expect(validarEmail('testeexemplo.com')).toBe(false);
    });

    it('deve rejeitar email sem domínio', () => {
      expect(validarEmail('teste@')).toBe(false);
    });

    it('deve rejeitar email vazio', () => {
      expect(validarEmail('')).toBe(false);
    });

    it('deve validar email com subdomínio', () => {
      expect(validarEmail('teste@sub.exemplo.com')).toBe(true);
    });
  });
}); 