console.log('Hello, World!');

export const soma = (a: number, b: number): number => {
  return a + b;
}

export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export const calcularMedia = (numeros: number[]): number => {
  if (numeros.length === 0) return 0;
  const soma = numeros.reduce((acc, num) => acc + num, 0);
  return soma / numeros.length;
}
