"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth-helpers";
import {
  operationCreateSchema,
  operationUpdateSchema,
} from "@/lib/validations/operation";
import type { FormState } from "./clients";

function flattenZodErrors(
  err: import("zod").ZodError,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.errors) {
    const path = issue.path.join(".");
    if (path && !out[path]) out[path] = issue.message;
  }
  return out;
}

function readForm(formData: FormData) {
  return {
    client_id: formData.get("client_id")?.toString() ?? "",
    bank_id: formData.get("bank_id")?.toString() ?? "",
    origin_bank_id: formData.get("origin_bank_id")?.toString() ?? "",
    amount: formData.get("amount")?.toString() ?? "",
    installments: formData.get("installments")?.toString() ?? "",
    installment_amount: formData.get("installment_amount")?.toString() ?? "",
    payment_status:
      (formData.get("payment_status")?.toString() as "pendente" | "pago") ??
      "pendente",
    payment_date: formData.get("payment_date")?.toString() ?? "",
  };
}

export async function createOperationAction(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireProfile();
  const raw = readForm(formData);

  const parsed = operationCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos abaixo.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("operations")
    .insert({
      client_id: parsed.data.client_id,
      bank_id: parsed.data.bank_id,
      origin_bank_id: parsed.data.origin_bank_id,
      amount: parsed.data.amount,
      installments: parsed.data.installments,
      installment_amount: parsed.data.installment_amount,
      payment_status: parsed.data.payment_status,
      payment_date:
        parsed.data.payment_status === "pago"
          ? parsed.data.payment_date ?? new Date().toISOString().slice(0, 10)
          : null,
      created_by: profile.id,
    })
    .select("id, client_id")
    .single();

  if (error) {
    return { ok: false, error: "Não foi possível salvar a operação." };
  }

  revalidatePath(`/clientes/${data.client_id}`);
  revalidatePath("/operacoes");
  revalidatePath("/dashboard");
  redirect(`/clientes/${data.client_id}`);
}

export async function updateOperationAction(
  operationId: string,
  clientId: string,
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireProfile();
  const raw = readForm(formData);

  const parsed = operationUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos abaixo.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const update: Record<string, unknown> = { updated_by: profile.id };
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v === undefined) continue;
    if (k === "payment_date" && parsed.data.payment_status === "pendente")
      update[k] = null;
    else update[k] = v;
  }

  // Regra: se mudou para pago, exige/atualiza data; se pendente, limpa.
  if (parsed.data.payment_status === "pago") {
    if (!parsed.data.payment_date)
      update.payment_date = new Date().toISOString().slice(0, 10);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("operations")
    .update(update)
    .eq("id", operationId);

  if (error) {
    return { ok: false, error: "Não foi possível atualizar a operação." };
  }

  revalidatePath(`/clientes/${clientId}`);
  revalidatePath("/operacoes");
  revalidatePath("/dashboard");
  redirect(`/clientes/${clientId}`);
}

export async function deleteOperationAction(
  operationId: string,
  clientId: string,
): Promise<FormState> {
  await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase.from("operations").delete().eq("id", operationId);

  if (error) {
    return { ok: false, error: "Não foi possível excluir a operação." };
  }

  revalidatePath(`/clientes/${clientId}`);
  revalidatePath("/operacoes");
  revalidatePath("/dashboard");
  redirect(`/clientes/${clientId}`);
}
