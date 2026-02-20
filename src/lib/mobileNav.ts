export const MOBILE_TABS = [
  { label: "Home", href: "/" },
  { label: "Train", href: "/sports" },
  { label: "Feed", href: "/feed" },
  { label: "Progress", href: "/achievements" },
  { label: "Profile", href: "/profile" },
] as const;

export const MOBILE_TAB_PATHS = MOBILE_TABS.map((tab) => tab.href);

export const DEFAULT_TAB_STORAGE_KEY = "defaultMobileTab";

export const deepLinkToPath = (value?: string | null): string => {
  if (!value) return "/";
  if (value.startsWith("sportstreak://")) {
    const path = value.replace("sportstreak://", "/");
    return path.startsWith("/") ? path : `/${path}`;
  }

  if (value.startsWith("/")) return value;

  return "/";
};
