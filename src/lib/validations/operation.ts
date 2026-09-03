import { z } from "zod";

const moneySchema = z
  .union([z.string(), z.number()])
  .transform((v) => {
    if (typeof v === "number") return v;
    // Aceita "1.196,28" ou "1196.28"
    const normalized = v.replace(/\./g, "").replace(",", ".").trim();
    const n = Number(normalized);
    return Number.isFinite(n) ? n : NaN;
  })
  .pipe(
    z
      .number()
      .finite("Valor inválido.")
      .positive("Valor deve ser maior que zero.")
      .max(9999999999.99, "Valor muito alto."),
  );

export const operationCreateSchema = z.object({
  client_id: z.string().uuid("Cliente inválido."),
  bank_id: z.string().uuid("Selecione o banco de destino."),
  origin_bank_id: z.string().uuid("Selecione o banco de origem."),
  amount: moneySchema,
  installments: z.coerce
    .number({ invalid_type_error: "Parcelas inválidas." })
    .int("Parcelas deve ser inteiro.")
    .positive("Parcelas deve ser maior que zero.")
    .max(360, "Número de parcelas muito alto."),
  installment_amount: moneySchema,
  payment_status: z.enum(["pendente", "pago"], {
    errorMap: () => ({ message: "Status inválido." }),
  }),
  payment_date: z
    .string()
    .nullable()
    .optional()
    .transform((v) => {
      if (!v) return null;
      // Aceita "YYYY-MM-DD" ou vazio.
      return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
    }),
});

export const operationUpdateSchema = operationCreateSchema
  .omit({ client_id: true })
  .partial();

export type OperationCreateInput = z.input<typeof operationCreateSchema>;
export type OperationUpdateInput = z.input<typeof operationUpdateSchema>;
