"use client";
import { useState } from "react";
import type { Listing } from "@/lib/types";
import ListingCard from "./ListingCard";

interface SlotGroup {
  timeSlot: string;
  listings: Listing[];
}

interface PastSlotGroupProps {
  slots: SlotGroup[];
  getNote: (id: string) => string;
  updateNote: (id: string, text: string) => void;
}

export default function PastSlotGroup({ slots, getNote, updateNote }: PastSlotGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const totalListings = slots.reduce((sum, s) => sum + s.listings.length, 0);

  if (slots.length === 0) return null;

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-4 py-2 w-full text-left"
      >
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            expanded ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-sm font-medium text-gray-500">
          Past ({totalListings} listing{totalListings !== 1 ? "s" : ""})
        </span>
      </button>

      {expanded &&
        slots.map((slot) => (
          <div key={slot.timeSlot} className="mb-4">
            <h3 className="text-xs font-medium text-gray-400 px-4 mb-2">
              {slot.timeSlot}
            </h3>
            <div className="flex flex-col gap-3 px-4">
              {slot.listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  note={getNote(listing.id)}
                  onNoteChange={(text) => updateNote(listing.id, text)}
                  isPast
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
