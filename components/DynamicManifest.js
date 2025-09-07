"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function DynamicManifest() {
  const pathname = usePathname();

  useEffect(() => {
    const link = document.querySelector("link[rel='manifest']");
    if (link) {
      link.href = pathname.startsWith("/admin")
        ? "/admin-manifest.json"
        : "/manifest.json";
    }
  }, [pathname]);

  return null;
}
