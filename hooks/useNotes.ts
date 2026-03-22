"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "openhouse-notes";

type NotesMap = Record<string, { text: string; updatedAt: string }>;

function loadNotes(): NotesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveNotes(notes: NotesMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // localStorage unavailable (private browsing)
  }
}

export function useNotes() {
  const [notes, setNotes] = useState<NotesMap>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  const updateNote = useCallback((listingId: string, text: string) => {
    setNotes((prev) => {
      const next = {
        ...prev,
        [listingId]: { text, updatedAt: new Date().toISOString() },
      };
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => saveNotes(next), 500);
      return next;
    });
  }, []);

  const getNote = useCallback(
    (listingId: string) => notes[listingId]?.text ?? "",
    [notes]
  );

  return { getNote, updateNote };
}
