import { useEffect } from "react";

const useSiteSettings = (settings: any) => {
  useEffect(() => {
    if (!settings) return;

    // Update page title
    document.title = settings.school_name;

    // Update favicon
    let favicon = document.querySelector(
      "link[rel='icon']"
    ) as HTMLLinkElement | null;

    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    favicon.href = settings.favicon;
  }, [settings]);
};

export default useSiteSettings;