const DEFAULT_NEXT_PATH = "/dashboard";
const APP_ORIGIN = "https://flaghunt.local";

export const getSafeNextPath = (next: string | null): string => {
  if (!next?.startsWith("/") || next.includes("\\")) {
    return DEFAULT_NEXT_PATH;
  }

  const destination = new URL(next, APP_ORIGIN);

  return destination.origin === APP_ORIGIN
    ? `${destination.pathname}${destination.search}${destination.hash}`
    : DEFAULT_NEXT_PATH;
};

export const getLoginRedirectPath = (next: string | null): string =>
  `/login?next=${encodeURIComponent(getSafeNextPath(next))}`;
