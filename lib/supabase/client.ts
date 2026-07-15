import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

const getPublicSupabaseConfig = (): { url: string; publishableKey: string } => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new Error("Missing required public Supabase environment variables.");
  return { url, publishableKey };
};

export const createBrowserClient = () => {
  const { url, publishableKey } = getPublicSupabaseConfig();
  return createSupabaseBrowserClient(url, publishableKey);
};
