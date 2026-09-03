import { z } from "zod";
import { isValidCPF, onlyDigits } from "./cpf";

export const clientCreateSchema = z.object({
  name: z
    .string({ required_error: "Nome é obrigatório." })
    .trim()
    .min(3, "Nome deve ter ao menos 3 caracteres.")
    .max(120, "Nome muito longo."),
  cpf: z
    .string({ required_error: "CPF é obrigatório." })
    .transform((v) => onlyDigits(v))
    .refine((v) => v.length === 11, "CPF deve ter 11 dígitos.")
    .refine((v) => isValidCPF(v), "CPF inválido."),
});

export const clientUpdateSchema = clientCreateSchema.partial();

export type ClientCreateInput = z.input<typeof clientCreateSchema>;
export type ClientUpdateInput = z.input<typeof clientUpdateSchema>;
