"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth-helpers";
import { clientCreateSchema, clientUpdateSchema } from "@/lib/validations/client";

export type FormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

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

export async function createClientAction(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireProfile();

  const raw = {
    name: formData.get("name")?.toString() ?? "",
    cpf: formData.get("cpf")?.toString() ?? "",
  };

  const parsed = clientCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos abaixo.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      name: parsed.data.name,
      cpf: parsed.data.cpf,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Já existe um cliente cadastrado com este CPF.",
        fieldErrors: { cpf: "CPF já cadastrado." },
      };
    }
    return { ok: false, error: "Não foi possível salvar o cliente." };
  }

  revalidatePath("/clientes");
  revalidatePath("/dashboard");
  redirect(`/clientes/${data.id}`);
}

export async function updateClientAction(
  clientId: string,
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireProfile();

  const raw = {
    name: formData.get("name")?.toString() ?? "",
    cpf: formData.get("cpf")?.toString() ?? "",
  };

  const parsed = clientUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos abaixo.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const updateData: Record<string, unknown> = {
    updated_by: profile.id,
  };
  if (parsed.data.name) updateData.name = parsed.data.name;
  if (parsed.data.cpf) updateData.cpf = parsed.data.cpf;

  const { error } = await supabase
    .from("clients")
    .update(updateData)
    .eq("id", clientId);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Já existe um cliente cadastrado com este CPF.",
        fieldErrors: { cpf: "CPF já cadastrado." },
      };
    }
    return { ok: false, error: "Não foi possível atualizar o cliente." };
  }

  revalidatePath(`/clientes/${clientId}`);
  revalidatePath("/clientes");
  revalidatePath("/dashboard");
  redirect(`/clientes/${clientId}`);
}

export async function deleteClientAction(clientId: string): Promise<FormState> {
  await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase.from("clients").delete().eq("id", clientId);

  if (error) {
    return { ok: false, error: "Não foi possível excluir o cliente." };
  }

  revalidatePath("/clientes");
  revalidatePath("/dashboard");
  redirect("/clientes");
}
