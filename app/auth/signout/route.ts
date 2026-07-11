import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(): Promise<never> {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims?.sub) await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
