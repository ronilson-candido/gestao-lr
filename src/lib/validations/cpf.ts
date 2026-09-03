/**
 * Remove tudo que não é dígito de uma string.
 */
export function onlyDigits(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

/**
 * Aplica máscara de CPF: 000.000.000-00
 */
export function maskCPF(value: string | null | undefined): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * Máscara para exibição parcial: 000.000.***-**
 */
export function maskCPFPartial(cpf: string | null | undefined): string {
  const digits = onlyDigits(cpf);
  if (digits.length !== 11) return "***";
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.***-**`;
}

/**
 * Valida CPF pelo algoritmo de dígitos verificadores.
 * Aceita entrada com ou sem máscara. Retorna true se válido.
 */
export function isValidCPF(value: string | null | undefined): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return false;

  // Rejeita CPFs com todos os dígitos iguais.
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(digits[i]) * (10 - i);
  }
  let first = (sum * 10) % 11;
  if (first === 10) first = 0;
  if (first !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(digits[i]) * (11 - i);
  }
  let second = (sum * 10) % 11;
  if (second === 10) second = 0;
  if (second !== Number(digits[10])) return false;

  return true;
}
