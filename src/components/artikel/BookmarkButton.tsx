"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";

export default function BookmarkButton({ slug }: { slug: string }) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const stored: string[] = JSON.parse(
      localStorage.getItem("bookmarks") || "[]"
    );
    setBookmarked(stored.includes(slug));
  }, [slug]);

  function toggleBookmark() {
    const stored: string[] = JSON.parse(
      localStorage.getItem("bookmarks") || "[]"
    );
    let updated: string[];
    if (stored.includes(slug)) {
      updated = stored.filter((s) => s !== slug);
    } else {
      updated = [...stored, slug];
    }
    localStorage.setItem("bookmarks", JSON.stringify(updated));
    setBookmarked(!bookmarked);
  }

  return (
    <button
      onClick={toggleBookmark}
      className={`btn-ghost rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${
        bookmarked
          ? "text-primary bg-primary-light"
          : "text-txt-secondary hover:text-primary"
      }`}
      title={bookmarked ? "Hapus bookmark" : "Simpan bookmark"}
    >
      <Bookmark
        size={14}
        className={bookmarked ? "fill-goto-green" : ""}
      />
      {bookmarked ? "Disimpan" : "Bookmark"}
    </button>
  );
}
