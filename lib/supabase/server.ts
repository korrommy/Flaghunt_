import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const getPublicSupabaseConfig = (): { url: string; publishableKey: string } => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new Error("Missing required public Supabase environment variables.");
  return { url, publishableKey };
};

export const createServerClient = async () => {
  const cookieStore = cookies();
  const { url, publishableKey } = getPublicSupabaseConfig();
  return createSupabaseServerClient(url, publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* Middleware refreshes sessions when server components cannot write cookies. */ }
      },
    },
  });
};
