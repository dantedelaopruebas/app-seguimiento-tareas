"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData
) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/today") || "/today";

  if (!email || !password) {
    return { error: "Escribe tu correo y contraseña." };
  }

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Mensajes amigables
    const map: Record<string, string> = {
      "Invalid login credentials": "Correo o contraseña incorrectos.",
      "Email not confirmed": "El correo no está confirmado.",
    };
    return { error: map[error.message] ?? error.message };
  }

  revalidatePath("/", "layout");
  redirect(next.startsWith("/") ? next : "/today");
}

export async function logoutAction() {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
