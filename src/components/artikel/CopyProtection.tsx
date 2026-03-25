"use client";

import { useEffect } from "react";

interface CopyProtectionProps {
  authorName: string;
  articleUrl: string;
  articleTitle: string;
}

export default function CopyProtection({
  authorName,
  articleUrl,
  articleTitle,
}: CopyProtectionProps) {
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.toString().length < 20) return;

      const copiedText = selection.toString();
      const attribution = `\n\n---\nSumber: Jurnalis Hukum Bandung\nJudul: ${articleTitle}\nPenulis: ${authorName}\nLink: ${articleUrl}\n\u00A9 ${new Date().getFullYear()} Jurnalis Hukum Bandung. Seluruh hak cipta dilindungi.`;

      e.clipboardData?.setData("text/plain", copiedText + attribution);
      e.preventDefault();
    };

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".article-content")) {
        e.preventDefault();
      }
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [authorName, articleUrl, articleTitle]);

  return null;
}
