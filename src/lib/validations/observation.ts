import { z } from "zod";

export const observationCreateSchema = z.object({
  client_id: z.string().uuid("Cliente inválido."),
  content: z
    .string({ required_error: "Conteúdo é obrigatório." })
    .trim()
    .min(1, "Observação não pode ser vazia.")
    .max(5000, "Observação muito longa."),
});

export const observationUpdateSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Observação não pode ser vazia.")
    .max(5000, "Observação muito longa."),
});

export type ObservationCreateInput = z.input<typeof observationCreateSchema>;
export type ObservationUpdateInput = z.input<typeof observationUpdateSchema>;
