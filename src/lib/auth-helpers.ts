import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/domain";

/**
 * Garante que existe um usuário autenticado. Redireciona para /login caso contrário.
 * Use em Server Components protegidas.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Retorna o usuário autenticado + profile correspondente. Cria profile se não existir
 * (defesa — esperado que o trigger handle_new_user já o crie).
 */
export async function requireProfile(): Promise<Profile> {
  const user = await requireUser();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    // Cria profile defensivamente se o trigger não tiver rodado.
    const { data: created, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        name: (user.user_metadata?.name as string | undefined) ?? user.email ?? "Usuário",
        email: user.email ?? "",
      })
      .select("*")
      .single();

    if (createError || !created) {
      throw new Error("Não foi possível carregar o perfil do usuário.");
    }
    return created as Profile;
  }

  return data as Profile;
}
