"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth-helpers";
import {
  observationCreateSchema,
  observationUpdateSchema,
} from "@/lib/validations/observation";
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

export async function createObservationAction(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireProfile();

  const raw = {
    client_id: formData.get("client_id")?.toString() ?? "",
    content: formData.get("content")?.toString() ?? "",
  };

  const parsed = observationCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos abaixo.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("observations").insert({
    client_id: parsed.data.client_id,
    content: parsed.data.content,
    created_by: profile.id,
  });

  if (error) {
    return { ok: false, error: "Não foi possível salvar a observação." };
  }

  revalidatePath(`/clientes/${parsed.data.client_id}`);
  redirect(`/clientes/${parsed.data.client_id}`);
}

export async function updateObservationAction(
  observationId: string,
  clientId: string,
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireProfile();
  const content = formData.get("content")?.toString() ?? "";

  const parsed = observationUpdateSchema.safeParse({ content });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos abaixo.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("observations")
    .update({ content: parsed.data.content, updated_by: profile.id })
    .eq("id", observationId);

  if (error) {
    return { ok: false, error: "Não foi possível atualizar a observação." };
  }

  revalidatePath(`/clientes/${clientId}`);
  redirect(`/clientes/${clientId}`);
}

export async function deleteObservationAction(
  observationId: string,
  clientId: string,
): Promise<FormState> {
  await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase
    .from("observations")
    .delete()
    .eq("id", observationId);

  if (error) {
    return { ok: false, error: "Não foi possível excluir a observação." };
  }

  revalidatePath(`/clientes/${clientId}`);
  redirect(`/clientes/${clientId}`);
}
